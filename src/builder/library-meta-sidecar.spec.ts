/**
 * 库元数据 sidecar（`<库根>/mp-library-meta.json`）→ wxml 事件绑定。
 *
 * 钉住两条相反的方向，缺一不可：
 *
 *   ✅ sidecar 里有正确的 host 元数据，并且真的驱动了 wxml 的 bind:* 事件
 *   ❌ `.d.ts` 里**不再**出现 `declare const X_Listeners` 这类内联标记
 *
 * 第二条是这次重构的核心承诺：`.d.ts` 是类型契约，不当 key-value 存储用。
 * 旧方案之所以要「构建后补写」，是因为 ng-packagr 22 的 d.ts 扁平化会把
 * 未导出的 `declare const` tree-shake 掉；标记一丢，应用侧拿到空 listeners
 * 并覆盖掉 host.listeners，wxml 一个事件绑定都没有，且毫无报错。
 * 元数据搬到 sidecar 之后，扁平化根本碰不到它。
 */
import { join, normalize } from '@angular-devkit/core';
import * as fs from 'fs';
import * as path from 'path';

import {
  MyTestProjectHost,
  describeBuilder,
} from '../../test/plugin-describe-builder';
import {
  BROWSER_BUILDER_INFO,
  DEFAULT_ANGULAR_CONFIG,
} from '../../test/test-builder';
import {
  ALL_COMPONENT_NAME_LIST,
  ALL_PAGE_NAME_LIST,
} from '../../test/util/file';
import { analyzeFileInjection } from '../../test/util/template-inject-ast';
import {
  LIBRARY_META_FILE_NAME,
  LIBRARY_META_SCHEMA_VERSION,
  LibraryMetaFile,
} from './library/library-meta-schema';
import { PlatformType } from './platform/platform';
import { runViteBuilder as runBuilder } from './vite';

const angularConfig = {
  ...DEFAULT_ANGULAR_CONFIG,
  platform: PlatformType.wx,
  sourceMap: false,
};

function memoize<T>(fn: () => Promise<T>) {
  let p: Promise<T> | undefined;
  return () => (p = p ?? fn());
}

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  /** 库产物根（构建产物，非中间产物） */
  const distRoot = path.resolve(__dirname, '../../dist');
  const metaFilePath = path.join(distRoot, LIBRARY_META_FILE_NAME);

  const load = memoize(async () => {
    const root = harness.host.root();
    const h = new MyTestProjectHost(harness.host);
    const list = await h.getFileList(
      normalize(path.join(root, 'src', '__pages')),
    );
    list.push(
      ...(await h.getFileList(
        normalize(path.join(root, 'src', '__components')),
      )),
    );
    await h.importPathRename(list);
    await h.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
    await h.moveDir(ALL_COMPONENT_NAME_LIST, '__components', 'components');
    await h.addPageEntry(ALL_PAGE_NAME_LIST);

    // 本 harness 的 builder 是 **app** builder，跑不了 library target，
    // 所以 test-library 由 `library/library.spec.ts` 构建后拷进
    // `test/hello-world-app/node_modules/test-library`，这里读那份副本。
    // 谁先跑由 `vitest.config.mts` 的 sequencer 保证，不在脚本里排序。
    //
    // 但单独跑本文件（`vitest run library-meta-sidecar`）时 sequencer 帮不上忙，
    // 副本可能缺失或是上一轮残留，所以这里显式验新鲜度：
    // 宁可大声报错，也不要静默地测一个旧副本而给出假绿灯。
    //
    // 用 devkit host 读，不用 `fs` + host.root()：root 是虚拟路径
    // `/C/code/...`，Windows 下 Node 的 fs 解析不了。
    const installedLibEntry = join(
      normalize(root),
      'node_modules/test-library/fesm2022/test-library.mjs',
    );
    let installedLib: string;
    try {
      // host.read() 发的是 ArrayBuffer，`fileBufferToString` 不认（会变成
      // "[object ArrayBuffer]"），所以走 Buffer.from。
      installedLib = Buffer.from(
        await harness.host.read(installedLibEntry).toPromise(),
      ).toString('utf8');
    } catch {
      installedLib = '';
    }
    expect(
      installedLib.length,
      '读不到 node_modules/test-library；跑全量 `npm test`，' +
        '或先单独跑 `vitest run src/builder/library/library.spec.ts` 生成副本',
    ).toBeGreaterThan(0);
    expect(
      installedLib,
      'node_modules/test-library 副本已过期（缺 LIB_TEST_LIBRARY_RENDERED），' +
        '先跑 `vitest run src/builder/library/library.spec.ts` 重新生成',
    ).toContain('LIB_TEST_LIBRARY_RENDERED');

    harness.useTarget('build', angularConfig);
    const r = await harness.executeOnce();
    const base = r.result?.baseOutputPath as string;
    return {
      base,
      wxml: fs.readFileSync(
        path.join(base, 'pages/base-forms/base-forms-entry.wxml'),
        'utf8',
      ),
      demoWxml: fs.readFileSync(
        path.join(base, 'pages/library-meta-demo/library-meta-demo-entry.wxml'),
        'utf8',
      ),
      demoJson: JSON.parse(
        fs.readFileSync(
          path.join(
            base,
            'pages/library-meta-demo/library-meta-demo-entry.json',
          ),
          'utf8',
        ),
      ) as { usingComponents: Record<string, string> },
      /** 库组件**自身**的产物 wxml（不是父页面里的引用） */
      libCompWxml: fs.readFileSync(
        path.join(
          base,
          'library/test-library/test-library-component/test-library-component.wxml',
        ),
        'utf8',
      ),
      /** 库组件**自身**的产物 wxss */
      libCompWxss: fs.readFileSync(
        path.join(
          base,
          'library/test-library/test-library-component/test-library-component.wxss',
        ),
        'utf8',
      ),
      /** 二级出口组件自己的 wxml */
      secCompWxml: fs.readFileSync(
        path.join(
          base,
          'library/test-library/src/secondary/secondary-entry-component/secondary-entry-component.wxml',
        ),
        'utf8',
      ),
      /** 二级出口组件自己的 wxss */
      secCompWxss: fs.readFileSync(
        path.join(
          base,
          'library/test-library/src/secondary/secondary-entry-component/secondary-entry-component.wxss',
        ),
        'utf8',
      ),
      /** demo 页编译后的 JS（input/output 只能在里看到） */
      demoJs: fs.readFileSync(
        path.join(base, 'pages/library-meta-demo/library-meta-demo-entry.js'),
        'utf8',
      ),
      /**
       * app 产物里的全部 JS。
       *
       * 必须在 `load()` 里就读完：harness 的临时工程目录会在 spec 之间被
       * 清掉，拿着 `base` 稍后再去 scandir 就是 ENOENT。
       */
      allAppJs: (() => {
        const out: { name: string; content: string }[] = [];
        const walk = (dir: string) => {
          for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, item.name);
            if (item.isDirectory()) {
              walk(p);
            } else if (item.name.endsWith('.js')) {
              out.push({ name: p, content: fs.readFileSync(p, 'utf8') });
            }
          }
        };
        walk(base);
        return out;
      })(),
    };
  });

  const readMeta = memoize(async (): Promise<LibraryMetaFile> => {
    // 先跑一次构建，确保 dist 已产出
    await load();
    return JSON.parse(fs.readFileSync(metaFilePath, 'utf8'));
  });

  /**
   * 读 app 产物里的全部 JS。
   *
   * 用来验证「库组件的 `amp.propertyChange` 是主构建注进去的」——
   * 库自己的 fesm 里没有（vanilla），但 app 的 chunk 里有。
   */
  const readAllAppJs = async () => (await load()).allAppJs;

  describe('库元数据 sidecar → wxml 事件绑定', () => {
    it('库根产出 mp-library-meta.json', async () => {
      await load();
      expect(
        fs.existsSync(metaFilePath),
        `${LIBRARY_META_FILE_NAME} 应存在于库根`,
      ).toBe(true);
    });

    it('schema 版本与结构正确', async () => {
      const meta = await readMeta();
      expect(meta.schemaVersion).toBe(LIBRARY_META_SCHEMA_VERSION);
      expect(meta.generator).toBe('angular-miniprogram');
      expect(typeof meta.entries).toBe('object');
    });

    it('entry 以「扁平化 d.ts 相对库根路径」为主键', async () => {
      const meta = await readMeta();
      const keys = Object.keys(meta.entries);
      expect(keys).toContain('types/angular-miniprogram-forms.d.ts');
      const forms = meta.entries['types/angular-miniprogram-forms.d.ts'];
      expect(forms.moduleId).toBe('angular-miniprogram/forms');
      // key 必须就是该 entry package.json 的 typings 指向
      const formsPkg = JSON.parse(
        fs.readFileSync(path.join(distRoot, 'forms', 'package.json'), 'utf8'),
      );
      expect(
        path
          .relative(distRoot, path.resolve(distRoot, 'forms', formsPkg.typings))
          .replace(/\\/g, '/'),
      ).toBe('types/angular-miniprogram-forms.d.ts');
    });

    it('forms 指令的 host 元数据正确', async () => {
      const meta = await readMeta();
      const directives =
        meta.entries['types/angular-miniprogram-forms.d.ts'].directives;
      // 监听器 / 输入属性的**集合**要一致，但声明顺序无关，所以两边都排序。
      expect([...directives.DefaultValueAccessor.listeners].sort()).toEqual([
        'bindblur',
        'bindinput',
      ]);
      expect(
        [...directives.CheckBoxGroupValueAccessor.listeners].sort(),
      ).toEqual(['bindchange']);
      expect([...directives.DefaultValueAccessor.properties].sort()).toEqual([
        'disabled',
        'value',
      ]);
    });

    it('d.ts 不再被改写：里面没有任何内联标记（回归核心承诺）', async () => {
      await load();
      const typesDir = path.join(distRoot, 'types');
      const offenders: string[] = [];
      for (const name of fs.readdirSync(typesDir)) {
        if (!name.endsWith('.d.ts')) {
          continue;
        }
        const content = fs.readFileSync(path.join(typesDir, name), 'utf8');
        if (
          /_Listeners\b/.test(content) ||
          /_Properties\b/.test(content) ||
          /_OutputPath\b/.test(content) ||
          content.includes('__mp_library_meta_begin__')
        ) {
          offenders.push(name);
        }
      }
      expect(offenders, 'd.ts 里不应再出现内联元数据标记').toEqual([]);
    });

    it('base-forms 的 wxml 里 input 有 bind:input / bind:blur', async () => {
      const { wxml } = await load();
      expect(wxml).toContain('bind:input="bindEvent"');
      expect(wxml).toContain('bind:blur="bindEvent"');
    });

    it('base-forms 的 wxml 里 checkbox-group 有 bind:change', async () => {
      const { wxml } = await load();
      expect(wxml).toContain('bind:change="bindEvent"');
    });

    it('反向对照：断言不是恒真（wxml 事件全部能追溯到 sidecar 元数据）', async () => {
      // 把 sidecar 里的事件名当成集合，与 wxml 中出现的事件一一对应。
      // 若事件是别处硬编码来的，这个对应关系就不会成立。
      const meta = await readMeta();
      const { wxml } = await load();

      const metaEvents = new Set<string>();
      for (const entry of Object.values(meta.entries)) {
        for (const record of [
          ...Object.values(entry.directives),
          ...Object.values(entry.components),
        ]) {
          record.listeners.forEach((l) => metaEvents.add(l));
        }
      }

      const wxmlEvents = new Set<string>();
      const re2 = /bind:([a-z]+)=/g;
      let m2: RegExpExecArray | null;
      while ((m2 = re2.exec(wxml))) {
        wxmlEvents.add(m2[1]);
      }

      expect(wxmlEvents.size, 'wxml 应有事件绑定').toBeGreaterThan(0);
      wxmlEvents.forEach((e) =>
        expect(
          metaEvents.has(e),
          `wxml 事件 bind:${e} 应能在 sidecar 元数据里找到来源`,
        ).toBe(true),
      );
    });
  });

  /**
   * 专用 demo 页 `pages/library-meta-demo`：整页都是 test-library 调用。
   *
   * 源模板（src/__pages/library-meta-demo/library-meta-demo.component.html）
   * 与 sidecar 记录的对应关系，逐字段钉住。
   */
  describe('库元数据 demo 页（test-library 调用）', () => {
    it('库指令 TestLibraryDirective 的 listeners → bind:tap / bind:touchstart', async () => {
      const { demoWxml } = await load();
      expect(demoWxml).toMatch(/<view[^>]*\bbind:tap="bindEvent"/);
      expect(demoWxml).toMatch(/<view[^>]*\bbind:touchstart="bindEvent"/);
    });

    it('库指令 TestLibraryDirective 的 properties → value="{{nodeList[N].property.value}}"', async () => {
      const { demoWxml } = await load();
      expect(demoWxml).toMatch(
        /<view[^>]*value="\{\{nodeList\[\d+\]\.property\.value\}\}"/,
      );
    });

    it('库组件 TestLibraryComponent 的 properties → property1', async () => {
      const { demoWxml } = await load();
      expect(demoWxml).toMatch(
        /<lib-test-library[^>]*property1="\{\{nodeList\[\d+\]\.property\.property1\}\}"/,
      );
    });

    it('库组件 + 库指令叠加时，两组元数据都在', async () => {
      const { demoWxml } = await load();
      const merged = demoWxml.match(/<lib-test-library[^>]*>/g) ?? [];
      const both = merged.find(
        (tag: string) =>
          tag.includes('property1="') &&
          tag.includes('value="') &&
          tag.includes('bind:tap="bindEvent"') &&
          tag.includes('bind:touchstart="bindEvent"'),
      );
      expect(
        both,
        '应有一个 <lib-test-library libTestLibrary> 同时带两组元数据',
      ).toBeTruthy();
    });

    it('库组件 LibComp1Component 的 listeners → bind:tap', async () => {
      const { demoWxml } = await load();
      expect(demoWxml).toMatch(/<app-lib-comp1[^>]*\bbind:tap="bindEvent"/);
    });

    it('库组件自身产物 wxml 不再是空 block（模板真的编译进去了）', async () => {
      const { libCompWxml } = await load();
      // 改之前：`<block wx:if="{{hasLoad}}"></block>`，空的，肉眼无法判断渲染了没有。
      expect(libCompWxml).not.toMatch(
        /<block wx:if="\{\{hasLoad\}\}"><\/block>/,
      );
      // 改之后：block 里有子节点
      expect(libCompWxml).toMatch(/<block wx:if="\{\{hasLoad\}\}"><[a-z]+/);
    });

    it('库组件模板文本走运行时数据，wxml 里是 {{nodeList[N].value}}', async () => {
      const { libCompWxml } = await load();
      // 说明：文本节点不进 wxml 字面量，而是存在 vnode 里由运行时填。
      // 所以“渲染标记在不在”不能靠 wxml 字面量查，得看 JS 产物 + wxss。
      expect(libCompWxml).toContain('{{nodeList[1].value}}');
    });

    it('库组件样式类名原样进 .wxss 产物（可字面量验收）', async () => {
      const { libCompWxss } = await load();
      expect(libCompWxss).toContain('lib-test-library__body');
    });

    /**
     * input / output 传值。
     *
     * 实测：`<lib-test-library [input1]="x">` 生成的 wxml 与不传时**一模一样**，
     * input 不以任何属性形式出现在 wxml 里（它走 vnode，运行时由组件自己读）。
     * 所以这部分只能查编译后的 JS：Angular 会把 input/output 名保留成字符串
     * 字面量（consts 里的 `[3, 'input1']`、update 里的 `property('input1', ...)`）。
     */
    it('库组件 input 传值进了编译产物', async () => {
      const { demoJs } = await load();
      expect(demoJs, 'demo 的 input 值应进产物').toContain('来自-app的input1');
      expect(demoJs, 'input 绑定名应作为字符串字面量保留').toMatch(
        /["'`]input1["'`]/,
      );
      expect(demoJs).toMatch(/["'`]input2["'`]/);
    });

    it('库指令 output 回抛接线进了编译产物', async () => {
      const { demoJs } = await load();
      expect(demoJs).toMatch(/["'`]output1["'`]/);
      expect(demoJs).toMatch(/["'`]output2["'`]/);
    });

    it('库组件 outputPath 落到 usingComponents', async () => {
      const { demoJson } = await load();
      expect(demoJson.usingComponents['lib-test-library']).toBe(
        '/library/test-library/test-library-component/test-library-component',
      );
      expect(demoJson.usingComponents['app-lib-comp1']).toBe(
        '/library/test-library/lib-comp1-component/lib-comp1-component',
      );
    });

    it('反向对照：demo 页的 bind:* 事件全部在 test-library 的 sidecar 里有记录', async () => {
      // 注意：demo 页用的是 **test-library（第二个库）**，不是主库
      // angular-miniprogram。所以这里读的是 test-library 自己的
      // mp-library-meta.json（由 library.spec.ts 构建后拷进 node_modules）。
      const libMetaPath = path.resolve(
        __dirname,
        '../../test/hello-world-app/node_modules/test-library/mp-library-meta.json',
      );
      expect(
        fs.existsSync(libMetaPath),
        'test-library 应先被构建并拷入 node_modules',
      ).toBe(true);
      const libMeta: LibraryMetaFile = JSON.parse(
        fs.readFileSync(libMetaPath, 'utf8'),
      );

      const metaEvents = new Set<string>();
      for (const entry of Object.values(libMeta.entries)) {
        for (const record of [
          ...Object.values(entry.directives),
          ...Object.values(entry.components),
        ]) {
          record.listeners.forEach((l) => metaEvents.add(l));
        }
      }

      const { demoWxml } = await load();
      const wxmlEvents = new Set<string>();
      const re = /bind:([a-z]+)=/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(demoWxml))) {
        wxmlEvents.add(m[1]);
      }
      expect(wxmlEvents.size).toBeGreaterThan(0);
      wxmlEvents.forEach((e) =>
        expect(
          metaEvents.has(e),
          `demo 页事件 bind:${e} 应在 test-library sidecar 里有记录`,
        ).toBe(true),
      );
    });
  });

  /**
   * 运行时 hook 的所有权：库不管，主构建管。
   *
   * 重构前：库构建把 `import * as amp` + `amp.propertyChange(...)` 烘进
   * 自己的 fesm，库产物不是 vanilla，且运行时 hook 与库版本死锁。
   * 重构后：库只出 `mp-library-meta.json`，主构建读到 sidecar 后给库组件
   * 补上注入。
   *
   * 两个方向都要钉：
   *   ✅ app chunk 里库组件的 template fn 有且仅有一次 propertyChange
   *   ✅ 库 fesm 本身一个 propertyChange 都没有（证明注入来自 app 侧）
   */
  describe('库组件的 propertyChange 由主构建注入', () => {
    const LIB_COMPONENTS = [
      'TestLibraryComponent',
      'OtherComponent',
      'LibComp1Component',
      'OutsideTemplateComponent',
      'GlobalSelfTemplateComponent',
    ];

    it('库 fesm 自身不带任何 propertyChange（vanilla 产物）', async () => {
      const fesmPath = path.resolve(
        __dirname,
        '../../test/hello-world-app/node_modules/test-library/fesm2022/test-library.mjs',
      );
      const fesm = fs.readFileSync(fesmPath, 'utf8');
      expect(fesm).not.toContain('propertyChange');
      expect(fesm).not.toContain("from 'angular-miniprogram'");
    });

    it('app 产物里每个库组件都被注入且只注入一次', async () => {
      const files = await readAllAppJs();
      const counts = new Map<string, number>();
      for (const f of files) {
        const report = analyzeFileInjection(f.name, f.content);
        for (const c of report.components) {
          if (!LIB_COMPONENTS.includes(c.componentName)) {
            continue;
          }
          counts.set(
            c.componentName,
            (counts.get(c.componentName) ?? 0) + c.propertyChangeCount,
          );
        }
      }

      for (const name of LIB_COMPONENTS) {
        expect(
          counts.get(name),
          `${name} 应被注入恰好 1 次 propertyChange，实际=${String(
            counts.get(name),
          )}（0 = 主构建没接上，>1 = 重复注入会双倍 setData）`,
        ).toBe(1);
      }
    });

    it('注入位置在 rf & 2 更新块末尾，没有游离调用', async () => {
      const files = await readAllAppJs();
      for (const f of files) {
        const report = analyzeFileInjection(f.name, f.content);
        const hit = report.components.filter((c) =>
          LIB_COMPONENTS.includes(c.componentName),
        );
        if (!hit.length) {
          continue;
        }
        for (const c of hit) {
          expect(
            c.branch,
            `${c.componentName} 应被注入到更新块（A 或 B）`,
          ).toBeTruthy();
          expect(
            c.isLastStatement,
            `${c.componentName} 的注入应在更新块最后`,
          ).toBe(true);
        }
      }
    });

    it('sidecar 里带模板载荷（content / useComponents / style）', async () => {
      const libMetaPath = path.resolve(
        __dirname,
        '../../test/hello-world-app/node_modules/test-library/mp-library-meta.json',
      );
      const libMeta: LibraryMetaFile = JSON.parse(
        fs.readFileSync(libMetaPath, 'utf8'),
      );
      expect(libMeta.schemaVersion).toBe(LIBRARY_META_SCHEMA_VERSION);
      const entry = libMeta.entries['types/test-library.d.ts'];
      expect(entry.fesm).toBe('fesm2022/test-library.mjs');

      for (const name of LIB_COMPONENTS) {
        const record = entry.components[name];
        expect(record, `${name} 应在 sidecar 里有记录`).toBeTruthy();
        // content 是 ${} 插值模板串（平台中立）
        expect(
          typeof record.content,
          `${name} 的 content 应是 \${} 插值模板串`,
        ).toBe('string');
        expect(record.content, `${name} 应带平台中立的模板文本`).toContain(
          'hasLoad',
        );
        // 平台相关处留的是插值，不是写死的 wx: / a:
        expect(record.content).toContain('${directivePrefix}');
        expect(record.content).not.toContain('wx:');
      }
      expect(entry.selfTemplate?.template).toContain(
        '$$mp$$__self__$$libraryFirst',
      );
    });
  });

  /**
   * 二级出口（`test-library/src/secondary`）走主构建。
   *
   * 多 entry point 的库，每个 entry 有自己的 fesm、自己的组件。主构建
   * 必须按**组件名**把两边分别对上：碰二级 fesm 只处理二级组件，碰一级
   * fesm 只处理一级组件。
   *
   * 重构前这里是 `meta.entry ? [meta.entry] : meta.entries`，碰不到 entry
   * 就把整包 emit 一遍 —— 多出口包下会把应用根本没 import 的出口也产出来。
   */
  describe('二级出口在主构建下', () => {
    it('二级出口组件产出自己的 wxml，内容只含它自己的模板', async () => {
      const { secCompWxml } = await load();
      expect(secCompWxml, '二级出口组件应有自己的 wxml 产物').toContain(
        'secondary entry works!',
      );
      // 不能把一级出口组件的模板串进来
      expect(secCompWxml).not.toContain('other works!');
      expect(secCompWxml).not.toContain('lib-comp1 works!');
    });

    it('二级出口组件的 host 事件从 sidecar listeners 过来', async () => {
      const { secCompWxml } = await load();
      expect(secCompWxml).toContain('bind:tap');
    });

    it('二级出口组件的样式产出为同名 wxss', async () => {
      const { secCompWxss } = await load();
      expect(secCompWxss).toContain('.lib-secondary-entry__text');
    });

    it('一级出口组件产物仍在，没被二级顶掉', async () => {
      const { libCompWxml } = await load();
      // 一级出口组件的 wxml 仍完整：自引用 import + 自己的数据绑定
      expect(libCompWxml).toContain('/library/test-library/self.wxml');
      expect(libCompWxml).toContain('{{nodeList[1].value}}');
      expect(libCompWxml).not.toContain('secondary entry works!');
    });

    it('demo 页 usingComponents 同时指到一级与二级出口的组件', async () => {
      const { demoJson } = await load();
      const paths = Object.values(demoJson.usingComponents);
      expect(
        paths.some((p) =>
          p.includes('/library/test-library/test-library-component/'),
        ),
        '一级出口组件应在 usingComponents 里',
      ).toBe(true);
      expect(
        paths.some((p) =>
          p.includes(
            '/library/test-library/src/secondary/secondary-entry-component/',
          ),
        ),
        '二级出口组件应在 usingComponents 里',
      ).toBe(true);
    });

    it('二级出口组件被注入恰好 1 次 propertyChange', async () => {
      const files = await readAllAppJs();
      let count = 0;
      for (const f of files) {
        const report = analyzeFileInjection(f.name, f.content);
        for (const c of report.components) {
          if (c.componentName === 'SecondaryEntryComponent') {
            count += c.propertyChangeCount;
          }
        }
      }
      expect(
        count,
        `SecondaryEntryComponent 应被注入恰好 1 次，实际=${count}（0 = 二级出口没接上注入链路）`,
      ).toBe(1);
    });
  });
});
