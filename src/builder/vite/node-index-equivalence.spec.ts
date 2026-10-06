import { join, normalize } from '@angular-devkit/core';
import * as fs from 'fs-extra';
import * as path from 'path';

import {
  type BuilderTestHarness,
  MyTestProjectHost,
  describeBuilder,
} from '../../../test/plugin-describe-builder';
import {
  BROWSER_BUILDER_INFO,
  DEFAULT_ANGULAR_CONFIG,
} from '../../../test/test-builder';
import {
  ALL_COMPONENT_NAME_LIST,
  ALL_PAGE_NAME_LIST,
} from '../../../test/util/file';
import {
  NodeManifest,
  extractDeclsByComponent,
  extractManifestsFromSource,
  extractViewTreesFromSource,
} from '../../../test/util/node-manifest';
import { BUILD_TIMEOUT_MS } from '../../../test/util/shared-build';
import {
  nodeListIndices,
  splitWxmlTopLevelBlocks,
  wxmlTagsByIndex,
} from '../../../test/util/wxml-blocks';
import {
  getGeneratedWxmlRecords,
  resetGeneratedWxmlRecords,
} from '../mini-program-compiler/manifest-registry';
import {
  isTextInstruction,
  mapAngularTagToWxml,
} from '../mini-program-compiler/tag-mapping';
import { PlatformType } from '../platform/platform';
import {
  type ViteMiniProgramBuildOptions,
  runViteBuilder as runBuilder,
} from './index';

/**
 * 证明「wxml 的下标」与「Angular 编译产出的节点下标」两端等价。
 *
 * wxml 里烧的是绝对下标（`nodeList[0]` / `nodeList[2]` / ...），运行时 `lViewToWXView`
 * 产出 `nodeList[lViewIndex - HEADER_OFFSET]`。这两套下标是各自独立计算的，一旦某侧
 * 漏算，后续所有节点整体错位一位 → 整页渲染崩，且不抛任何错误。
 *
 * 本测试把「两端等价」变成可断言的数据：
 *   - 从编译产物 JS 里提取 Angular 官方口径的节点下标
 *   - 从同目录同基名的 wxml 里提取被引用的下标
 *   - 断言两者关系成立
 *
 * 这是制品级断言，不是静态源码分析——静态分析看不出实际错位。
 */

interface BuildArtifacts {
  /** 全输出目录里所有 JS 提取到的 manifest（含被 code-split 出去的共享 chunk） */
  manifests: { manifest: NodeManifest; fromFile: string }[];
  /** 全输出目录里的 wxml */
  wxmls: { wxml: string; rel: string }[];
}

/** 名字归一：去连字符/下划线、小写，便于 component1-entry ↔ Component1Component 匹配 */
function normName(s: string): string {
  return s.replace(/[-_]/g, '').toLowerCase();
}

/**
 * 找出能「覆盖」某个 wxml 的 manifest。
 * 不按组件名匹配——Vite 会把组件模板 code-split 到共享 chunk，entry.js 里没有模板指令。
 * 改用结构签名：找是否存在某个 Angular 模板，其节点下标集合包含该 wxml 引用的全部下标。
 * 若两端漂移，不会有任何 manifest 能覆盖，必然报出。
 */
function coveringManifests(
  all: BuildArtifacts['manifests'],
  referenced: Set<number>,
): { manifest: NodeManifest; fromFile: string }[] {
  return all.filter((x) => {
    for (const idx of referenced) {
      if (!x.manifest.indices.has(idx)) {
        return false;
      }
    }
    return true;
  });
}

function collectArtifacts(outDir: string): BuildArtifacts {
  const manifests: BuildArtifacts['manifests'] = [];
  const wxmls: BuildArtifacts['wxmls'] = [];

  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(full);
        continue;
      }
      if (e.name.endsWith('.js')) {
        const ms = extractManifestsFromSource(
          fs.readFileSync(full, 'utf8'),
          full,
        );
        for (const m of ms) {
          manifests.push({ manifest: m, fromFile: full });
        }
      } else if (e.name.endsWith('.wxml')) {
        wxmls.push({
          wxml: fs.readFileSync(full, 'utf8'),
          rel: path.relative(outDir, full),
        });
      }
    }
  };
  walk(outDir);
  return { manifests, wxmls };
}

/** wxml 里引用的所有 nodeList 下标 */
function wxmlReferencedIndices(wxml: string): Set<number> {
  const s = new Set<number>();
  for (const m of wxml.matchAll(/nodeList\[(\d+)\]/g)) {
    s.add(Number(m[1]));
  }
  return s;
}

/** 标签类型对应校验（正向与反向对照共用同一判定逻辑）。返回违规描述数组；空数组表示一致。 */
function checkTagCorrespondence(
  blocksByComponent: Map<
    string,
    { name: string; indices: Set<number>; content: string }[]
  >,
  trees: {
    componentName: string;
    views: {
      indices: Set<number>;
      entries: { index: number; instruction: string; tag?: string }[];
    }[];
  }[],
): { violations: string[]; compared: number } {
  const violations: string[] = [];
  let compared = 0;
  for (const [cmp, blocks] of blocksByComponent) {
    const tree = trees.find((t) => t.componentName === cmp);
    if (!tree) {
      continue;
    }
    for (const b of blocks) {
      if (b.indices.size === 0) {
        continue;
      }
      const covering = tree.views.filter((v) =>
        [...b.indices].every((i) => v.indices.has(i)),
      );
      if (covering.length === 0) {
        continue;
      }
      const wxmlTags = wxmlTagsByIndex(b.content);
      for (const [idx, wtag] of wxmlTags) {
        const entries = covering
          .flatMap((v) => v.entries.filter((e) => e.index === idx))
          .filter((e) => !isTextInstruction(e.instruction) && e.tag);
        if (entries.length === 0) {
          /**
           * 该槽在 Angular 侧存但没有标签（text / TI18n / i18nAttributes）。
           * 这里不能 `continue`：wxml 既然在 `nodeList[idx]` 上写了个元素，Angular 就必须
           * 在同一槽上建元素。没标签就是「两边下标对不上」，跳过等于把位移放过去。
           */
          const occupying = covering.flatMap((v) =>
            v.entries.filter((e) => e.index === idx),
          );
          if (occupying.length) {
            compared++;
            violations.push(
              `${cmp} 块 ${b.name} 下标 ${idx}: wxml=<${wtag}> 但 Angular 该槽是 ` +
                `"${occupying.map((e) => e.instruction).join('/')}"，不是元素`,
            );
          }
          continue;
        }
        const expected = mapAngularTagToWxml(entries[0].tag as string);
        compared++;
        if (expected !== wtag) {
          violations.push(
            `${cmp} 块 ${b.name} 下标 ${idx}: wxml=<${wtag}> ` +
              `但 Angular 是 "${entries[0].tag}"，映射后应为 <${expected}>`,
          );
        }
      }
    }
  }
  return { violations, compared };
}

/**
 * nodeList 越界校验（正向与反向对照共用同一判定逻辑）。
 * wxml 根块引用的最大下标必须严格小于组件 decls，因为运行时 `nodeList.length === decls`。
 * 只比对根块——具名块是子视图自己的 0 基空间。
 */
function checkNodeListOverflow(
  blocksByComponent: Map<string, { name: string; indices: Set<number> }[]>,
  declsByComponent: Map<string, number>,
): { violations: string[]; checked: number } {
  const violations: string[] = [];
  let checked = 0;
  for (const [cmp, blocks] of blocksByComponent) {
    const decls = declsByComponent.get(cmp);
    if (decls === undefined) {
      continue;
    }
    const root = blocks.find((b) => b.name === '__root__');
    if (!root || root.indices.size === 0) {
      continue;
    }
    const max = Math.max(...root.indices);
    checked++;
    if (max >= decls) {
      violations.push(
        `${cmp}: wxml 根块最大下标 ${max} >= decls ${decls} → ` +
          `运行时 nodeList(长度 ${decls}) 越界`,
      );
    }
  }
  return { violations, checked };
}

/**
 * 三个 describe 共用一次构建：它们验的是同一次构建的不同侧面，构建参数逐字相同。
 * 这里不能用 `executeOnceShared`：后两个 describe 要读 `manifest-registry` 这个进程内注册表。
 */
type SharedArtifacts = {
  manifests: { manifest: NodeManifest; fromFile: string }[];
  wxmls: { wxml: string; rel: string }[];
  records: ReturnType<typeof getGeneratedWxmlRecords>;
  trees: ReturnType<typeof extractViewTreesFromSource>;
  declsByComponent: Map<string, number>;
};

let sharedArtifacts: Promise<SharedArtifacts> | undefined;

function loadSharedArtifacts(
  harness: BuilderTestHarness<ViteMiniProgramBuildOptions>,
): Promise<SharedArtifacts> {
  return (sharedArtifacts ??= buildSharedArtifacts(harness));
}

async function buildSharedArtifacts(
  harness: BuilderTestHarness<ViteMiniProgramBuildOptions>,
): Promise<SharedArtifacts> {
  // 构建前清空注册表，避免跨次构建脏数据
  resetGeneratedWxmlRecords();
  const root = harness.host.root();
  const h = new MyTestProjectHost(harness.host);
  const list = await h.getFileList(normalize(join(root, 'src', '__pages')));
  list.push(
    ...(await h.getFileList(normalize(join(root, 'src', '__components')))),
  );
  await h.importPathRename(list);
  await h.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
  await h.moveDir(ALL_COMPONENT_NAME_LIST, '__components', 'components');
  await h.addPageEntry(ALL_PAGE_NAME_LIST);

  harness.useTarget('build', {
    ...DEFAULT_ANGULAR_CONFIG,
    platform: PlatformType.wx,
    outputPath: 'dist/node-index',
    sourceMap: false,
  } as never);

  const r = await harness.executeOnce();
  const outDir = r.result?.baseOutputPath as string;

  const { manifests, wxmls } = collectArtifacts(outDir);

  const trees: ReturnType<typeof extractViewTreesFromSource> = [];
  const declsByComponent = new Map<string, number>();
  const walkJs = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walkJs(full);
      } else if (e.name.endsWith('.js')) {
        const src = fs.readFileSync(full, 'utf8');
        trees.push(...extractViewTreesFromSource(src, full));
        for (const [k, v] of extractDeclsByComponent(src, full)) {
          // 同名组件可能出现在多个 chunk，取首次见到的值
          if (!declsByComponent.has(k)) {
            declsByComponent.set(k, v);
          }
        }
      }
    }
  };
  walkJs(outDir);

  // 至少要有若干对 wxml/js，否则后面的断言会空跑通过
  expect(wxmls.length).toBeGreaterThan(5);
  expect(manifests.length).toBeGreaterThan(5);

  return {
    manifests,
    wxmls,
    records: getGeneratedWxmlRecords(),
    trees,
    declsByComponent,
  };
}

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('节点下标两端等价性', () => {
    /**
     * 必须在 it() 内部触发构建，不能用 beforeAll——harness 的 TestProjectHost
     * 是在 spec 执行期才初始化的。三个 describe 共用同一份制品。
     */
    async function loadArtifacts(): Promise<BuildArtifacts> {
      const a = await loadSharedArtifacts(harness);
      return { manifests: a.manifests, wxmls: a.wxmls };
    }

    /**
     * 核心断言：wxml 引用的每个下标，都必须是 Angular 编译产物里真实存在的节点下标。
     * 用「全输出并集」而非「单个组件模板覆盖」——Vite 会把组件模板 code-split 到共享 chunk，
     * 单组件精确配对在当前提取器下不可靠。
     */
    it(
      'wxml 引用的每个下标都必须是 Angular 认定的真实节点下标',
      async () => {
        const a = await loadArtifacts();

        const angularUniverse = new Set<number>();
        for (const x of a.manifests) {
          x.manifest.indices.forEach((i) => angularUniverse.add(i));
        }
        expect(
          angularUniverse.size,
          '没从任何 JS 里提取到节点下标，提取器可能失效',
        ).toBeGreaterThan(0);

        const violations: string[] = [];
        for (const w of a.wxmls) {
          for (const idx of wxmlReferencedIndices(w.wxml)) {
            if (!angularUniverse.has(idx)) {
              violations.push(
                `${w.rel}: 引用 nodeList[${idx}]，Angular 编译产物里无此节点下标`,
              );
            }
          }
        }

        /**
         * 已知提取缺口清单：default-structural-directive 大量使用 ngIf/ngFor，其模板经
         * Angular pipeline 改造后，部分节点下标当前提取器抓不到。这是提取器的局限，
         * 不是已证实的渲染错位。用「子集」断言而非直接忽略：清单只能缩小，不能扩大。
         */
        const KNOWN_EXTRACTION_GAPS = new Set<string>([]);

        const newGaps = [
          ...new Set(violations.map((v) => v.split(':')[0])),
        ].filter((f) => !KNOWN_EXTRACTION_GAPS.has(f));

        expect({ newlyUnverifiableWxml: newGaps }).toEqual({
          newlyUnverifiableWxml: [],
        });
      },
      BUILD_TIMEOUT_MS,
    );

    /**
     * 反向对照：证明这套断言真的能抓到错位，不是只会通过的摆设。
     * 做法：拿一份真实 wxml，把它引用的下标整体偏移，断言此时校验必须失败。
     */
    it(
      '反向对照：人为制造下标错位时，校验必须失败',
      async () => {
        const a = await loadArtifacts();
        const real = a.wxmls.find(
          (w) => wxmlReferencedIndices(w.wxml).size > 0,
        );
        expect(real, '找不到带 nodeList 引用的 wxml').toBeDefined();

        // 整体 +1000，模拟「运行时多占槽导致整体错位」
        const shifted = real!.wxml.replace(
          /nodeList\[(\d+)\]/g,
          (_m, n) => `nodeList[${Number(n) + 1000}]`,
        );
        const shiftedIdx = wxmlReferencedIndices(shifted);
        expect(shiftedIdx.size).toBeGreaterThan(0);

        const universe = new Set<number>();
        a.manifests.forEach((x) =>
          x.manifest.indices.forEach((i) => universe.add(i)),
        );

        const orphans = [...shiftedIdx].filter((i) => !universe.has(i));

        expect(
          orphans.length,
          `人为把 wxml 下标整体 +1000 后，所有引用都应识别为错位。` +
            `识别出 ${orphans.length}/${shiftedIdx.size} 个——` +
            `若为 0 说明这套校验抓不住错位，是假测试`,
        ).toBe(shiftedIdx.size);
        expect(orphans.length).toBeGreaterThan(0);
      },
      BUILD_TIMEOUT_MS,
    );
  });
});

/**
 * 按组件**精确**比对：wxml ↔ 该组件自己的 Angular 编译产物。
 *
 * 配对关系来自 builder 生成 wxml 的那一刻（manifest-registry），
 * 组件身份是权威的，不用从文件名/路径猜，因此不受 code-splitting 影响。
 *
 * 这是比「全输出并集」更强的断言：
 *   并集：wxml 引用的下标在**某个**模板里存在
 *   精确：wxml 引用的下标在**它自己组件**的模板里存在
 */
describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('节点下标两端等价性（按组件精确）', () => {
    async function load() {
      const a = await loadSharedArtifacts(harness);
      return { manifests: a.manifests, records: a.records };
    }

    it(
      '注册表应记录到组件（否则本测试空跑）',
      async () => {
        const c = await load();
        expect(c.records.length).toBeGreaterThan(5);
      },
      BUILD_TIMEOUT_MS,
    );

    it(
      '每个组件的 wxml 下标，必须落在该组件自己的 Angular 节点下标集合内',
      async () => {
        const c = await load();
        const violations: string[] = [];
        const noManifest: string[] = [];

        for (const rec of c.records) {
          const referenced = wxmlReferencedIndices(rec.wxml);
          if (referenced.size === 0) {
            continue;
          }
          // 按组件类名找它自己的 manifest（名字来自 componentKey，权威）
          const mine = c.manifests.filter(
            (x) => x.manifest.componentName === rec.componentName,
          );
          if (mine.length === 0) {
            noManifest.push(`${rec.componentName} (${rec.componentKey})`);
            continue;
          }
          const own = new Set<number>();
          mine.forEach((x) => x.manifest.indices.forEach((i) => own.add(i)));
          for (const idx of referenced) {
            if (!own.has(idx)) {
              violations.push(
                `${rec.componentName}: wxml 引用 nodeList[${idx}]，` +
                  `但该组件自身指令流里没有此下标（自身下标集=[${[...own]
                    .sort((a, b) => a - b)
                    .join(',')}]）`,
              );
            }
          }
        }

        // 「找不到自己的 manifest」也必须上报：无法验证 ≠ 验证通过
        expect({ componentsWithoutOwnManifest: noManifest }).toEqual({
          componentsWithoutOwnManifest: [],
        });

        /**
         * 已知无法精确验证的组件清单——待查的真错位候选。用子集断言固化：
         * 清单只能缩小，新增即失败。查清一个就删一个，直到清空。
         *
         * 成因：Angular 把 @if/@for/@ngIf 的分支编译成独立的顶层模板函数
         * （ɵɵtemplate(2, X_Conditional_1_Template, decls, vars, ...)），不在主模板
         * 函数体内，而 wxml 引用了分支视图的下标。Angular 的下标是每视图各自 0 基，
         * 「按组件精确」把它们拍成一个并集去比必然串。更强的「按视图分块」测试已覆盖。
         */
        const KNOWN_PRECISION_GAPS = new Set(['ControlFlowComponent']);

        const newViolations = [
          ...new Set(violations.map((v) => v.split(':')[0].trim())),
        ].filter((c) => !KNOWN_PRECISION_GAPS.has(c));

        expect({ newlyFailingComponents: newViolations }).toEqual({
          newlyFailingComponents: [],
        });
      },
      BUILD_TIMEOUT_MS,
    );

    it(
      '反向对照：篡改某组件 wxml 下标后，精确校验必须失败',
      async () => {
        const c = await load();
        const rec = c.records.find(
          (r) => wxmlReferencedIndices(r.wxml).size > 0,
        );
        expect(rec, '注册表里没有带 nodeList 引用的组件').toBeDefined();

        const mine = c.manifests.filter(
          (x) => x.manifest.componentName === rec!.componentName,
        );
        const own = new Set<number>();
        mine.forEach((x) => x.manifest.indices.forEach((i) => own.add(i)));

        const tampered = wxmlReferencedIndices(
          rec!.wxml.replace(
            /nodeList\[(\d+)\]/g,
            (_m, n) => `nodeList[${Number(n) + 7777}]`,
          ),
        );
        expect(tampered.size).toBeGreaterThan(0);

        const orphans = [...tampered].filter((i) => !own.has(i));
        expect(
          orphans.length,
          `篡改后应全部识别为错位。识别 ${orphans.length}/${tampered.size}。` +
            `为 0 说明精确校验抓不住问题`,
        ).toBe(tampered.size);
      },
      BUILD_TIMEOUT_MS,
    );
  });
});

/**
 * 按视图分块的精确校验。
 * Angular 的槽位每个视图各自从 0 开始，@if/@for 的分支编译成独立顶层模板函数；
 * wxml 侧对应 <template name="ifBlock_3"> 这样的具名模板块，块内下标同样从 0 开始。
 * 所以「把整个 wxml 的 nodeList 下标混成一个集合」是错的，必须按模板块分块校验。
 */
describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('节点下标两端等价性（按视图分块）', () => {
    /** 用平衡匹配的分块器（见 test/util/wxml-blocks）：非贪婪正则切具名模板会在嵌套处截断。 */
    type Block = {
      name: string;
      indices: Set<number>;
      content: string;
    };

    function splitWxmlBlocks(wxml: string): Block[] {
      return splitWxmlTopLevelBlocks(wxml).map((b) => ({
        name: b.name,
        indices: nodeListIndices(b.content),
        content: b.content,
      }));
    }

    async function load() {
      const a = await loadSharedArtifacts(harness);
      const blocksByComponent = new Map<string, Block[]>();
      for (const rec of a.records) {
        blocksByComponent.set(rec.componentName, splitWxmlBlocks(rec.wxml));
      }
      return {
        trees: a.trees,
        blocksByComponent,
        declsByComponent: a.declsByComponent,
      };
    }

    it(
      '视图树应拆出多个视图（控制流组件）',
      async () => {
        const c = await load();
        const cf = c.trees.find(
          (t) => t.componentName === 'ControlFlowComponent',
        );
        expect(cf, '没找到 ControlFlowComponent 的视图树').toBeDefined();
        // @if x4 + @for x3 + @switch 等，应远多于 1 个视图
        expect(cf!.views.length).toBeGreaterThan(3);
      },
      BUILD_TIMEOUT_MS,
    );

    it(
      '每个 wxml 模板块的下标，必须被某个视图的下标空间覆盖',
      async () => {
        const c = await load();
        const violations: string[] = [];

        for (const [cmp, blocks] of c.blocksByComponent) {
          const tree = c.trees.find((t) => t.componentName === cmp);
          if (!tree) {
            continue; // 已由「按组件精确」那条上报
          }
          for (const b of blocks) {
            if (b.indices.size === 0) {
              continue;
            }
            const covering = tree.views.filter((v) =>
              [...b.indices].every((i) => v.indices.has(i)),
            );
            if (covering.length === 0) {
              violations.push(
                `${cmp} 模板块 ${b.name}: 下标 [${[...b.indices]
                  .sort((x, y) => x - y)
                  .join(',')}] 没有任何视图覆盖` +
                  `（各视图下标集: ${tree.views
                    .map(
                      (v) =>
                        `${v.viewName}=[${[...v.indices].sort((x, y) => x - y).join(',')}]`,
                    )
                    .join(' | ')}）`,
              );
            }
          }
        }

        /**
         * 已知缺口：只剩 ControlFlowComponent 的 __root__ 块，具名模板块已全部通过。
         * 成因：splitWxmlBlocks 用 `wxml.replace(具名模板正则, '')` 求根区，但
         * `<template is="...">` 调用标签、嵌套具名模板等残留在根区里，把不属于
         * 根视图的下标算了进来。子集断言：只能缩小，新增即失败。
         */
        const KNOWN_ROOT_BLOCK_GAPS = new Set<string>([]);

        const newGaps = [
          ...new Set(violations.map((v) => v.split(' 模板块')[0].trim())),
        ].filter((c) => !KNOWN_ROOT_BLOCK_GAPS.has(c));

        expect({ newlyUncoveredComponents: newGaps }).toEqual({
          newlyUncoveredComponents: [],
        });
      },
      BUILD_TIMEOUT_MS,
    );

    it(
      '具名模板块（ifBlock / forBlock 等）必须全部被覆盖',
      async () => {
        const c = await load();
        const violations: string[] = [];

        for (const [cmp, blocks] of c.blocksByComponent) {
          const tree = c.trees.find((t) => t.componentName === cmp);
          if (!tree) {
            continue;
          }
          for (const b of blocks) {
            if (b.name === '__root__' || b.indices.size === 0) {
              continue;
            }
            const covering = tree.views.filter((v) =>
              [...b.indices].every((i) => v.indices.has(i)),
            );
            if (covering.length === 0) {
              violations.push(`${cmp}/${b.name}`);
            }
          }
        }

        // 这条没有豁免清单：具名块必须 100% 覆盖
        expect({ uncoveredNamedBlocks: violations }).toEqual({
          uncoveredNamedBlocks: [],
        });
      },
      BUILD_TIMEOUT_MS,
    );

    it('运行时 nodeList 长度（=decls）必须严格大于 wxml 根块引用的最大下标', async () => {
      /**
       * 链条：
       *   1. 运行时 nodeList.length === bindingStartIndex - HEADER_OFFSET
       *   2. bindingStartIndex = HEADER_OFFSET + decls ⇒ nodeList.length === decls
       *   3. 所以 max(wxml 根块下标) < decls 即不会越界
       */
      const c = await load();
      const { violations, checked } = checkNodeListOverflow(
        c.blocksByComponent as never,
        c.declsByComponent,
      );
      console.log(`根块越界比对组件数: ${checked}`);
      expect(checked, '比对数为 0 说明本断言空跑').toBeGreaterThan(10);
      expect(violations).toEqual([]);
    });

    it('反向对照：把 wxml 根块下标推到 >= decls，越界校验必须报', async () => {
      /**
       * 关键：走的是与正向同一个 checkNodeListOverflow，只是把某个组件根块的下标集合
       * 人为放大到 >= decls。若这条不失败，说明越界校验是摆设。
       */
      const c = await load();

      // 找一个既有 decls 又有非空根块的组件
      let target: { cmp: string; decls: number } | null = null;
      for (const [cmp, blocks] of c.blocksByComponent) {
        const decls = c.declsByComponent.get(cmp);
        const root = blocks.find((b) => b.name === '__root__');
        if (decls !== undefined && root && root.indices.size > 0) {
          target = { cmp, decls };
          break;
        }
      }
      expect(target, '没找到可篡改的组件，无法构造反向对照').not.toBeNull();
      const t = target as { cmp: string; decls: number };

      // 篡改：给该组件根块加一个越界下标（== decls，即 nodeList 之外第一位）
      const tampered = new Map<
        string,
        { name: string; indices: Set<number> }[]
      >();
      for (const [cmp, blocks] of c.blocksByComponent) {
        tampered.set(
          cmp,
          blocks.map((b) =>
            cmp === t.cmp && b.name === '__root__'
              ? { ...b, indices: new Set([...b.indices, t.decls]) }
              : b,
          ),
        );
      }

      const { violations } = checkNodeListOverflow(
        tampered as never,
        c.declsByComponent,
      );
      const hit = violations.filter((v) => v.includes(t.cmp));
      expect(
        hit.length,
        `把 ${t.cmp} 根块最大下标推到 ${t.decls}（decls=${t.decls}）后 ` +
          `未报越界 → 越界校验是摆设`,
      ).toBeGreaterThan(0);
    });

    it('标签类型对应：wxml 承载某下标的标签，必须等于 Angular 该槽标签经映射', async () => {
      /**
       * 纯下标断言抓不到「下标对但节点类型错」。这里比对两端类型：
       *   wxml 侧：承载 `nodeList[i].class` 的那个元素的标签名
       *   Angular 侧：`ɵɵelementStart(i, tag)` 的 tag
       * 经 `mapAngularTagToWxml`（与 element.ts 同源）换算后必须相等。
       */
      const c = await load();
      const { violations, compared } = checkTagCorrespondence(
        c.blocksByComponent as never,
        c.trees as never,
      );
      console.log(`标签比对对数: ${compared}`);
      expect(
        compared,
        '比对数为 0 说明本断言空跑，没有真正校验任何东西',
      ).toBeGreaterThan(50);
      expect(violations).toEqual([]);
    });

    it('反向对照：篡改 wxml 承载标签后，类型校验必须报违规', async () => {
      /**
       * 关键：走的是与正向同一个 checkTagCorrespondence，只是把 wxml 内容里的承载标签换掉。
       * 若这条不失败，说明类型校验是摆设。
       */
      const c = await load();

      // 找一个真实的 view 承载元素
      let target: {
        cmp: string;
        blockName: string;
        idx: number;
        snippet: string;
      } | null = null;
      outer: for (const [cmp, blocks] of c.blocksByComponent) {
        for (const b of blocks) {
          const tags = wxmlTagsByIndex(b.content);
          for (const [idx, tag] of tags) {
            if (tag === 'view') {
              const snippet = `<view  class="{{nodeList[${idx}].class}}"`;
              if (b.content.includes(snippet)) {
                target = { cmp, blockName: b.name, idx, snippet };
                break outer;
              }
            }
          }
        }
      }
      expect(
        target,
        '没找到可篡改的 view 承载元素，无法构造反向对照',
      ).not.toBeNull();
      const t = target as {
        cmp: string;
        blockName: string;
        idx: number;
        snippet: string;
      };

      // 篡改：view → text（合法 wxml 标签，但类型错）
      const tamperedBlocks = new Map<
        string,
        typeof c.blocksByComponent extends Map<string, infer B> ? B : never
      >();
      for (const [cmp, blocks] of c.blocksByComponent) {
        tamperedBlocks.set(
          cmp,
          blocks.map((b) =>
            cmp === t.cmp && b.name === t.blockName
              ? {
                  ...b,
                  content: b.content.replace(
                    t.snippet,
                    t.snippet.replace('<view', '<text'),
                  ),
                }
              : b,
          ),
        );
      }

      const { violations } = checkTagCorrespondence(
        tamperedBlocks as never,
        c.trees as never,
      );
      const hit = violations.filter((v) => v.includes(`下标 ${t.idx}`));
      expect(
        hit.length,
        `篡改 ${t.cmp} 下标 ${t.idx} 的承载标签为 <text> 后，校验未报违规 → 类型校验是摆设`,
      ).toBeGreaterThan(0);
    });

    it(
      '反向对照：篡改某个模板块下标后，必须识别为不覆盖',
      async () => {
        const c = await load();
        // 找一个有多视图的组件
        const entry = [...c.blocksByComponent.entries()].find(([cmp]) => {
          const t = c.trees.find((x) => x.componentName === cmp);
          return t && t.views.length > 1;
        });
        expect(entry, '找不到多视图组件').toBeDefined();

        const [cmp, blocks] = entry!;
        const tree = c.trees.find((x) => x.componentName === cmp)!;
        const block = blocks.find((b) => b.indices.size > 0);
        expect(block, '该组件没有带下标的模板块').toBeDefined();

        const tampered = new Set([...block!.indices].map((i) => i + 5555));
        const covering = tree.views.filter((v) =>
          [...tampered].every((i) => v.indices.has(i)),
        );

        expect(
          covering.length,
          `篡改 ${cmp}/${block!.name} 下标 +5555 后不应有任何视图覆盖，` +
            `实际覆盖 ${covering.length} 个（>0 说明校验抓不住）`,
        ).toBe(0);
      },
      BUILD_TIMEOUT_MS,
    );
  });
});
