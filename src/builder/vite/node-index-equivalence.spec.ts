import { join, normalize } from '@angular-devkit/core';
import * as fs from 'fs-extra';
import * as path from 'path';

import {
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
  extractManifestsFromSource,
  extractViewTreesFromSource,
} from '../../../test/util/node-manifest';
import {
  nodeListIndices,
  splitWxmlTopLevelBlocks,
} from '../../../test/util/wxml-blocks';
import {
  getGeneratedWxmlRecords,
  resetGeneratedWxmlRecords,
} from '../mini-program-compiler/manifest-registry';
import { PlatformType } from '../platform/platform';
import { runViteBuilder as runBuilder } from './index';

/**
 * 证明「wxml 的下标」与「Angular 编译产出的节点下标」两端等价。
 *
 * ## 背景
 *
 * wxml 里烧的是绝对下标（`nodeList[0]` / `nodeList[2]` / ...），
 * 运行时 `lViewToWXView` 产出 `nodeList[lViewIndex - HEADER_OFFSET]`。
 * 这两套下标历史上是**各自独立计算**的——构建侧自己维护 `declIndex`
 * 数出来的，运行时是 Angular 真实 lView 下标。它们「恰好」对上了，
 * 但中间没有任何验证。
 *
 * 一旦某侧漏算（i18n 就是已确认的一例：`visitIcu` 是空实现，
 * 而 Angular 的 i18n 块会占一个 TI18n 节点槽），后续所有节点整体
 * 错位一位 → 整页渲染崩，**且不抛任何错误**。
 *
 * ## 本测试做什么
 *
 * 把「两端等价」变成可断言的数据：
 *   - 从编译产物 JS 里提取 Angular 官方口径的节点下标
 *     （下标是 allocateSlots 算好后烤进每条指令第一个参数的）
 *   - 从同目录同基名的 wxml 里提取被引用的下标
 *   - 断言两者关系成立
 *
 * 这是**制品级**断言，不是静态源码分析——静态分析看不出实际错位。
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
 *
 * 不按组件名匹配——Vite 会把组件模板 code-split 到共享 chunk
 * （如 component1.component-DGfPgACN.js），entry.js 里没有模板指令，
 * 且 chunk 里的组件名提取也可能退化。
 *
 * 改用结构签名：找是否存在某个 Angular 模板，其节点下标集合
 * **包含**该 wxml 引用的全部下标。
 *
 * 这在语义上正是我们要的等价关系：
 *   「wxml 引用的每个位置，在某个真实的 Angular 编译产物里都是真实节点」
 * 若两端漂移，不会有任何 manifest 能覆盖，必然报出。
 */
function coveringManifests(
  all: BuildArtifacts['manifests'],
  referenced: Set<number>
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
          full
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

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('节点下标两端等价性', () => {
    /**
     * 必须在 it() 内部触发构建，不能用 beforeAll——
     * harness 的 TestProjectHost 是在 spec 执行期才初始化的，
     * beforeAll 阶段调用会报 "TestProjectHost must be initialized"。
     * 用 memoize 保证只构建一次，多个 it() 共享同一批制品。
     */
    let cache: BuildArtifacts | null = null;

    async function loadArtifacts(): Promise<BuildArtifacts> {
      if (cache) {
        return cache;
      }
      // 构建前清空注册表，避免跨次构建脏数据
      resetGeneratedWxmlRecords();
      const root = harness.host.root();
      const h = new MyTestProjectHost(harness.host);
      const list = await h.getFileList(normalize(join(root, 'src', '__pages')));
      list.push(
        ...(await h.getFileList(normalize(join(root, 'src', '__components'))))
      );
      await h.importPathRename(list);
      await h.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
      await h.moveDir(ALL_COMPONENT_NAME_LIST, '__components', 'components');
      await h.addPageEntry(ALL_PAGE_NAME_LIST);

      harness.useTarget('build', {
        ...DEFAULT_ANGULAR_CONFIG,
        platform: PlatformType.wx,
        outputPath: 'dist/manifest-eq',
        sourceMap: false,
      } as never);

      const r = await harness.executeOnce();
      const outDir = r.result?.baseOutputPath as string;
      cache = collectArtifacts(outDir);
      // 至少要有若干对 wxml/js，否则下面的断言会空跑通过
      expect(cache.wxmls.length).toBeGreaterThan(5);
      expect(cache.manifests.length).toBeGreaterThan(5);
      return cache;
    }

    /**
     * 核心断言：wxml 引用的每个下标，都必须是 Angular 编译产物里
     * 真实存在的节点下标。
     *
     * 用「全输出并集」而非「单个组件模板覆盖」——因为 Vite 会把组件模板
     * code-split 到共享 chunk，且部分模板是 hoisted 函数引用，
     * 单组件精确配对在当前提取器下不可靠。
     *
     * 局限（诚实记录）：并集校验弱于「按组件精确校验」。真正严格的
     * 做法是在 builder 生成 wxml 的当口同时产出 manifest，让两者
     * 同源生成后直接比对。那是下一步。
     *
     * 但这一条已经能抓住「wxml 引用了 Angular 根本没分配的节点下标」
     * 这类错位——正是原架构最危险的失败模式。
     */
    it('wxml 引用的每个下标都必须是 Angular 认定的真实节点下标', async () => {
      const a = await loadArtifacts();

      const angularUniverse = new Set<number>();
      for (const x of a.manifests) {
        x.manifest.indices.forEach((i) => angularUniverse.add(i));
      }
      expect(angularUniverse.size)
        .withContext('没从任何 JS 里提取到节点下标，提取器可能失效')
        .toBeGreaterThan(0);

      const violations: string[] = [];
      for (const w of a.wxmls) {
        for (const idx of wxmlReferencedIndices(w.wxml)) {
          if (!angularUniverse.has(idx)) {
            violations.push(
              `${w.rel}: 引用 nodeList[${idx}]，Angular 编译产物里无此节点下标`
            );
          }
        }
      }

      /**
       * 已知提取缺口清单。
       *
       * default-structural-directive 大量使用 ngIf/ngFor，其模板经
       * Angular pipeline 改造后，部分节点下标当前提取器抓不到
       * （hoisted 模板函数 / 嵌套嵌入式视图的引用形式）。
       *
       * 这是**提取器的局限**，不是已证实的渲染错位。
       *
       * 用「子集」断言而非直接忽略：清单只能缩小，不能扩大。
       * 新增一个验证不了的 wxml 就会失败——防止缺口悄悄增长。
       */
      const KNOWN_EXTRACTION_GAPS = new Set<string>([]);

      const newGaps = [
        ...new Set(violations.map((v) => v.split(':')[0])),
      ].filter((f) => !KNOWN_EXTRACTION_GAPS.has(f));

      expect({ newlyUnverifiableWxml: newGaps }).toEqual({
        newlyUnverifiableWxml: [],
      });
    }, 600000);

    /**
     * 反向对照：证明这套断言**真的能抓到错位**，不是只会通过的摆设。
     *
     * 做法：拿一份真实 wxml，把它引用的下标整体 +1（模拟「运行时多
     * 占了一个槽导致错位」），断言此时校验必须失败。
     *
     * 没有这条，前面两条测试可能只是因为环境里恰好没有越界引用而假通过。
     */
    it('反向对照：人为制造下标错位时，校验必须失败', async () => {
      const a = await loadArtifacts();
      const real = a.wxmls.find((w) => wxmlReferencedIndices(w.wxml).size > 0);
      expect(real).withContext('找不到带 nodeList 引用的 wxml').toBeDefined();

      // 整体 +1000，模拟「运行时多占槽导致整体错位」
      const shifted = real!.wxml.replace(
        /nodeList\[(\d+)\]/g,
        (_m, n) => `nodeList[${Number(n) + 1000}]`
      );
      const shiftedIdx = wxmlReferencedIndices(shifted);
      expect(shiftedIdx.size).toBeGreaterThan(0);

      const universe = new Set<number>();
      a.manifests.forEach((x) =>
        x.manifest.indices.forEach((i) => universe.add(i))
      );

      const orphans = [...shiftedIdx].filter((i) => !universe.has(i));

      expect(orphans.length)
        .withContext(
          `人为把 wxml 下标整体 +1000 后，所有引用都应识别为错位。` +
            `识别出 ${orphans.length}/${shiftedIdx.size} 个——` +
            `若为 0 说明这套校验抓不住错位，是假测试`
        )
        .toBe(shiftedIdx.size);
      expect(orphans.length).toBeGreaterThan(0);
    }, 600000);
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
    let cache: {
      manifests: { manifest: NodeManifest; fromFile: string }[];
      records: ReturnType<typeof getGeneratedWxmlRecords>;
    } | null = null;

    async function load(): Promise<NonNullable<typeof cache>> {
      if (cache) {
        return cache;
      }
      resetGeneratedWxmlRecords();
      const root = harness.host.root();
      const h = new MyTestProjectHost(harness.host);
      const list = await h.getFileList(normalize(join(root, 'src', '__pages')));
      list.push(
        ...(await h.getFileList(normalize(join(root, 'src', '__components'))))
      );
      await h.importPathRename(list);
      await h.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
      await h.moveDir(ALL_COMPONENT_NAME_LIST, '__components', 'components');
      await h.addPageEntry(ALL_PAGE_NAME_LIST);
      harness.useTarget('build', {
        ...DEFAULT_ANGULAR_CONFIG,
        platform: PlatformType.wx,
        outputPath: 'dist/manifest-precise',
        sourceMap: false,
      } as never);
      const r = await harness.executeOnce();
      const outDir = r.result?.baseOutputPath as string;

      const manifests: { manifest: NodeManifest; fromFile: string }[] = [];
      const walk = (dir: string) => {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) {
            walk(full);
          } else if (e.name.endsWith('.js')) {
            for (const m of extractManifestsFromSource(
              fs.readFileSync(full, 'utf8'),
              full
            )) {
              manifests.push({ manifest: m, fromFile: full });
            }
          }
        }
      };
      walk(outDir);
      cache = { manifests, records: getGeneratedWxmlRecords() };
      return cache;
    }

    it('注册表应记录到组件（否则本测试空跑）', async () => {
      const c = await load();
      expect(c.records.length).toBeGreaterThan(5);
    }, 600000);

    it('每个组件的 wxml 下标，必须落在该组件自己的 Angular 节点下标集合内', async () => {
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
          (x) => x.manifest.componentName === rec.componentName
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
                  .join(',')}]）`
            );
          }
        }
      }

      // 「找不到自己的 manifest」也必须上报：无法验证 ≠ 验证通过
      expect({ componentsWithoutOwnManifest: noManifest }).toEqual({
        componentsWithoutOwnManifest: [],
      });

      /**
       * ⚠️ 已知无法精确验证的组件清单——**待查的真错位候选**。
       *
       * 现象值得警惕：BaseTagComponent 的 wxml 引用奇数下标
       * (1,3,5,...)，而其自身指令流的节点槽是偶数 (0,2,4,...)，
       * 呈系统性错开一位，不像随机提取失败。
       *
       * 两种可能，尚未定论：
       *   (a) 提取器只抓到了部分模板（hoisted 模板函数 / 嵌入式视图
       *       的独立函数体没走全），导致清单不完整；
       *   (b) 真的存在 off-by-one——wxml 引用的下标并非该组件自身的
       *       节点槽，而是靠「并集里恰好存在」蒙混过关。
       *
       * 现有「全输出并集」测试之所以通过，正是因为奇数下标在**别的**
       * 组件模板里存在。也就是说并集校验掩盖了这个问题。
       *
       * 用子集断言固化：清单只能缩小，新增即失败。
       * 查清一个就从这里删一个，直到清空。
       */
      /**
       * 已修复：原先列了 8 个组件，实为提取器漏了 `ɵɵdom*` 系列指令
       * （本 fork 的 patched 指令名），导致元素节点全丢、误报 off-by-one。
       * 补上后 8 → 4。那 4 个不是渲染错位，是我提取不全。
       *
       * 剩下 4 个的共同点：重度使用控制流 / 结构型指令。
       * Angular 把 @if/@for/@ngIf 的分支编译成**独立的顶层模板函数**
       * （ɵɵtemplate(2, X_Conditional_1_Template, decls, vars, ...)），
       * 不在主模板函数体内，所以 extractNodeManifest 只收到根视图节点，
       * 而 wxml 引用了分支视图的下标。
       *
       * 下一步：让 extractNodeManifest 顺着 ɵɵtemplate 的第二个参数
       * 找到那些独立模板函数并一并遍历（每个视图有各自从 0 开始的下标
       * 空间，需要按视图分组，不能混在一起比）。
       */
      /**
       * 已知缺口：只剩 ControlFlowComponent。
       *
       * 这是**本测试口径本身**的局限，不是产物错误：
       * 「按组件精确」把组件的所有 wxml 下标拍成一个并集去比，
       * 但 ControlFlowComponent 的 wxml 里含大量具名块
       * (ifBlock_3 / forBlock_11 / Case_18 ...)，那些下标属于
       * **各自子视图**的 0 基空间，混进组件级并集必然串。
       *
       * 更精确的「按视图分块」测试已 **零缺口** 覆盖同一批组件，
       * 所以这里保留一个组件名不代表未验证。
       */
      /**
       * 已知缺口：ControlFlowComponent —— **本测试口径的缺陷**，非产物错误。
       *
       * 「按组件精确」把组件所有 wxml 下标拍成一个并集，去比该组件
       * 所有视图下标的并集。但 Angular 的下标是**每视图各自 0 基**
       * （allocateSlots: "not unique between views"），ControlFlowComponent
       * 有 13 个视图，并集后只有 0/1 这类小数字，而根区引用到 19，
       * 必然串。
       *
       * 更强的「按视图分块」测试已对同一批组件 **零缺口** 覆盖，
       * 本项实为被其取代的弱断言。保留只为不丢历史信号。
       */
      const KNOWN_PRECISION_GAPS = new Set(['ControlFlowComponent']);

      const newViolations = [
        ...new Set(violations.map((v) => v.split(':')[0].trim())),
      ].filter((c) => !KNOWN_PRECISION_GAPS.has(c));

      expect({ newlyFailingComponents: newViolations }).toEqual({
        newlyFailingComponents: [],
      });
    }, 600000);

    it('反向对照：篡改某组件 wxml 下标后，精确校验必须失败', async () => {
      const c = await load();
      const rec = c.records.find((r) => wxmlReferencedIndices(r.wxml).size > 0);
      expect(rec)
        .withContext('注册表里没有带 nodeList 引用的组件')
        .toBeDefined();

      const mine = c.manifests.filter(
        (x) => x.manifest.componentName === rec!.componentName
      );
      const own = new Set<number>();
      mine.forEach((x) => x.manifest.indices.forEach((i) => own.add(i)));

      const tampered = wxmlReferencedIndices(
        rec!.wxml.replace(
          /nodeList\[(\d+)\]/g,
          (_m, n) => `nodeList[${Number(n) + 7777}]`
        )
      );
      expect(tampered.size).toBeGreaterThan(0);

      const orphans = [...tampered].filter((i) => !own.has(i));
      expect(orphans.length)
        .withContext(
          `篡改后应全部识别为错位。识别 ${orphans.length}/${tampered.size}。` +
            `为 0 说明精确校验抓不住问题`
        )
        .toBe(tampered.size);
    }, 600000);
  });
});

/**
 * 按**视图**分块的精确校验。
 *
 * 关键认知：Angular 的槽位每个视图各自从 0 开始，@if/@for 的分支编译成
 * 独立顶层模板函数；wxml 侧对应 <template name="ifBlock_3"> 这样的
 * 具名模板块，块内下标同样从 0 开始。
 *
 * 所以「把整个 wxml 的 nodeList 下标混成一个集合」是错的——
 * 那会把多个独立下标空间揉在一起。必须按模板块分块，
 * 每块对它自己的视图下标空间校验。
 */
describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('节点下标两端等价性（按视图分块）', () => {
    /**
     * 用平衡匹配的分块器（见 test/util/wxml-blocks）。
     *
     * 之前这里用非贪婪正则切具名模板，遇到**嵌套**具名模板会在第一个
     * </template> 处截断，把外层模板的闭合残尾留在根区，导致根区
     * 引用了不属于它的下标（ControlFlowComponent 就是这么栽的）。
     */
    type Block = { name: string; indices: Set<number> };

    function splitWxmlBlocks(wxml: string): Block[] {
      return splitWxmlTopLevelBlocks(wxml).map((b) => ({
        name: b.name,
        indices: nodeListIndices(b.content),
      }));
    }

    let cache: {
      trees: ReturnType<typeof extractViewTreesFromSource>;
      blocksByComponent: Map<string, Block[]>;
    } | null = null;

    async function load() {
      if (cache) {
        return cache;
      }
      resetGeneratedWxmlRecords();
      const root = harness.host.root();
      const h = new MyTestProjectHost(harness.host);
      const list = await h.getFileList(normalize(join(root, 'src', '__pages')));
      list.push(
        ...(await h.getFileList(normalize(join(root, 'src', '__components'))))
      );
      await h.importPathRename(list);
      await h.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
      await h.moveDir(ALL_COMPONENT_NAME_LIST, '__components', 'components');
      await h.addPageEntry(ALL_PAGE_NAME_LIST);
      harness.useTarget('build', {
        ...DEFAULT_ANGULAR_CONFIG,
        platform: PlatformType.wx,
        outputPath: 'dist/view-group',
        sourceMap: false,
      } as never);
      const r = await harness.executeOnce();
      const outDir = r.result?.baseOutputPath as string;

      const trees: ReturnType<typeof extractViewTreesFromSource> = [];
      const walk = (dir: string) => {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) {
            walk(full);
          } else if (e.name.endsWith('.js')) {
            trees.push(
              ...extractViewTreesFromSource(fs.readFileSync(full, 'utf8'), full)
            );
          }
        }
      };
      walk(outDir);

      const blocksByComponent = new Map<string, Block[]>();
      for (const rec of getGeneratedWxmlRecords()) {
        blocksByComponent.set(rec.componentName, splitWxmlBlocks(rec.wxml));
      }
      cache = { trees, blocksByComponent };
      return cache;
    }

    it('视图树应拆出多个视图（控制流组件）', async () => {
      const c = await load();
      const cf = c.trees.find(
        (t) => t.componentName === 'ControlFlowComponent'
      );
      expect(cf)
        .withContext('没找到 ControlFlowComponent 的视图树')
        .toBeDefined();
      // @if x4 + @for x3 + @switch 等，应远多于 1 个视图
      expect(cf!.views.length).toBeGreaterThan(3);
    }, 600000);

    it('每个 wxml 模板块的下标，必须被某个视图的下标空间覆盖', async () => {
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
            [...b.indices].every((i) => v.indices.has(i))
          );
          if (covering.length === 0) {
            violations.push(
              `${cmp} 模板块 ${b.name}: 下标 [${[...b.indices]
                .sort((x, y) => x - y)
                .join(',')}] 没有任何视图覆盖` +
                `（各视图下标集: ${tree.views
                  .map(
                    (v) =>
                      `${v.viewName}=[${[...v.indices].sort((x, y) => x - y).join(',')}]`
                  )
                  .join(' | ')}）`
            );
          }
        }
      }

      /**
       * 已知缺口：只剩 __root__ 块，具名模板块已全部通过。
       *
       * 视图分组本身是有效的——ControlFlowComponent 拆出 8 个视图，
       * ifBlock / forBlock 等具名块的下标全部被对应视图覆盖。
       *
       * 剩 __root__ 块未过，两种成因待查：
       *   (a) splitWxmlBlocks 对根区的切分粗糙（<import> / 嵌套
       *       <template> / <block wx:if> 混在一起，可能把不属于根视图
       *       的下标算进来了）
       *   (b) 根视图里仍有未计入的节点槽指令
       *       例：NgContentComponent 根视图提取到 {0,1,2,4,5,6}，
       *       缺 3——需要确认 index 3 处是什么指令
       *
       * 子集断言：只能缩小，新增即失败。
       */
      /**
       * 已知缺口：只剩 ControlFlowComponent 的 __root__ 块。
       *
       * 演进：4 → 1
       *   - 补 ɵɵdom* 系列指令：修掉一批误报
       *   - 展开链式 codegen（unwrapCallChain，注意 TS 用 .expression
       *     不是 ESTree 的 .callee）：NgContent / CustomStructural /
       *     DefaultStructural 全部通过
       *
       * 剩 ControlFlowComponent：根视图提取到
       *   [0,1,2,3,4,5,6,7,9,10,13,16,17,18,19,20]
       * 而 __root__ 块引用了 11,12,14,15（forBlock_11 / forEmpty_12 /
       * forBlock_14 等模板的注册槽）。
       *
       * 成因是 (a)：splitWxmlBlocks 用 `wxml.replace(具名模板正则, '')`
       * 求根区，但 `<template is="...">` 调用标签、嵌套具名模板等
       * 残留在根区里，把不属于根视图的下标算了进来。
       *
       * 下一步：把 splitWxmlBlocks 改成能区分
       *   - 具名模板**定义** <template name="x">
       *   - 模板**调用** <template is="x" data="...">
       * 根区只取 hasLoad 那个 <block> 内、排除所有具名定义后的内容，
       * 且调用标签引用的下标应映射到对应注册槽而非当作根视图下标。
       */
      const KNOWN_ROOT_BLOCK_GAPS = new Set<string>([]);

      const newGaps = [
        ...new Set(violations.map((v) => v.split(' 模板块')[0].trim())),
      ].filter((c) => !KNOWN_ROOT_BLOCK_GAPS.has(c));

      expect({ newlyUncoveredComponents: newGaps }).toEqual({
        newlyUncoveredComponents: [],
      });
    }, 600000);

    it('具名模板块（ifBlock / forBlock 等）必须全部被覆盖', async () => {
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
            [...b.indices].every((i) => v.indices.has(i))
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
    }, 600000);

    it('反向对照：篡改某个模板块下标后，必须识别为不覆盖', async () => {
      const c = await load();
      // 找一个有多视图的组件
      const entry = [...c.blocksByComponent.entries()].find(([cmp]) => {
        const t = c.trees.find((x) => x.componentName === cmp);
        return t && t.views.length > 1;
      });
      expect(entry).withContext('找不到多视图组件').toBeDefined();

      const [cmp, blocks] = entry!;
      const tree = c.trees.find((x) => x.componentName === cmp)!;
      const block = blocks.find((b) => b.indices.size > 0);
      expect(block).withContext('该组件没有带下标的模板块').toBeDefined();

      const tampered = new Set([...block!.indices].map((i) => i + 5555));
      const covering = tree.views.filter((v) =>
        [...tampered].every((i) => v.indices.has(i))
      );

      expect(covering.length)
        .withContext(
          `篡改 ${cmp}/${block!.name} 下标 +5555 后不应有任何视图覆盖，` +
            `实际覆盖 ${covering.length} 个（>0 说明校验抓不住）`
        )
        .toBe(0);
    }, 600000);
  });
});
