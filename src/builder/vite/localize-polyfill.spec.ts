import { join, normalize, virtualFs } from '@angular-devkit/core';
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
  BUILD_TIMEOUT_MS,
  executeOnceShared,
} from '../../../test/util/shared-build';
import { PlatformType } from '../platform/platform';
import {
  POLYFILL_ENTRY_ID,
  buildPlatformDefine,
  getBuildPlatform,
  normalizePolyfills,
  polyfillEntryContents,
  polyfillEntryPlugin,
  runViteBuilder,
  toPolyfillSpecifier,
} from './index';

/**
 * `@angular/localize/init` 的接入方式。
 *
 * ## 为什么是构建期 polyfill，不是运行时兜底
 *
 * Angular 官方就把 `@angular/localize/init` 当 **polyfill**：
 * - `@angular/build` 把 `polyfills` 数组逐条 `import` 进一个虚拟模块
 *   （`application-code-bundle.ts` 的 `getEsBuildCommonPolyfillsOptions`）
 * - webpack 时代看 tsconfig `types`，有就把 `@angular/localize/init` 作为
 *   `main` 的第一个 entry（`configs/common.js`）
 * - AOT 内联翻译时干脆 `alias['@angular/localize/init'] = false` 整个摘掉
 *
 * 三条路都是**构建期决定**，运行时没有任何探测或兜底。CLI 甚至专门做了个
 * 插件对源码里直接 `import '@angular/localize/init'` 发警告。
 * 所以本项目也不在库里装 `$localize` 占位——没做 i18n 的项目不该为它付体积，
 * 更不该被要求装那个包。
 *
 * 本项目走第一条（与上游 browser 路径同名同义）：`polyfills` 里声明什么就
 * import 什么，包名和本地文件都走普通解析，没有任何特判。所以 `/init` 必须
 * 写全（`ng add @angular/localize` 写的就是全路径），下面钉了裸写法的后果。
 */
describe('@angular/localize/init 注入', () => {
  describe('polyfills 条目（单元）', () => {
    it('单个串写法归一成数组（schema 允许 string）', () => {
      expect(normalizePolyfills('src/polyfills.ts')).toEqual([
        'src/polyfills.ts',
      ]);
      expect(normalizePolyfills(undefined)).toEqual([]);
    });

    it('包名保持裸标识符，不自己解析', () => {
      // 解析交给 Vite（exports map / conditions / alias 与应用里其余依赖同一套）；
      // 自己 require.resolve 在 monorepo 提升、`file:` 链接下会分叉。
      const r = toPolyfillSpecifier('@angular/localize/init', '/w');
      expect(r).toBe('@angular/localize/init');
      expect(path.isAbsolute(r)).toBe(false);
      expect(r).not.toContain('node_modules');
    });

    it('本地文件拼成绝对路径', () => {
      expect(toPolyfillSpecifier('src/polyfills.ts', '/w')).toBe(
        path.resolve('/w', 'src/polyfills.ts'),
      );
      expect(toPolyfillSpecifier('./x.polyfill.js', '/w')).toBe(
        path.resolve('/w', './x.polyfill.js'),
      );
    });

    it('条目逐条 import，顺序保持，我们那份在最前', () => {
      const code = polyfillEntryContents(
        '/abs/polyfill-entry.js',
        ['a', 'b'],
        '/w',
      );
      expect(code).toContain('import "a";');
      expect(code).toContain('import "b";');
      expect(code.indexOf('polyfill-entry.js')).toBeLessThan(
        code.indexOf('"a"'),
      );
      expect(code.indexOf('"a"')).toBeLessThan(code.indexOf('"b"'));
    });

    it('没声明就只有我们那一份', () => {
      const code = polyfillEntryContents('/abs/polyfill-entry.js', [], '/w');
      expect(code).toContain('__mpPolyfills');
      expect(code.match(/import /g)).toHaveLength(1);
    });
  });

  /**
   * 为什么 `/init` 必须写全，写 `@angular/localize` 不算。
   *
   * 两者不等价，实测：
   *  - `@angular/localize` 主入口只导出 `ɵ` 前缀的内部 API
   *    （`ɵ$localize` / `loadTranslations` / `parseTranslation` …），
   *    **一个字都不碰 globalThis**。
   *  - `@angular/localize/init` 整个模块就一句
   *    `globalThis.$localize = $localize`。
   *
   * 而编译产物里的 i18n 常量走的是**裸 `$localize`**（define 换成
   * `<平台>.$localize`），那个全局只有 `/init` 会挂。所以声明裸主入口会
   * 构建成功、运行时全炸。
   *
   * 构建器不做归一：上游 browser 路径也不做（只有 SSR 那条
   * `createServerPolyfillBundleOptions` 会补 `/init`），小程序不是 SSR，
   * 就按普通 browser 语义走。
   */
  describe('`/init` 必须写全', () => {
    it('主入口不挂 $localize', async () => {
      delete (globalThis as Record<string, unknown>).$localize;
      await import('@angular/localize');
      expect((globalThis as Record<string, unknown>).$localize).toBeUndefined();
    });

    it('/init 的全部内容就是挂那一下', async () => {
      await import('@angular/localize/init');
      expect(typeof (globalThis as Record<string, unknown>).$localize).toBe(
        'function',
      );
    });
  });

  describe('入口拼装（单元）', () => {
    /** vite 的 hook 允许写成对象形式，类型上不可调用，这里收窄成函数 */
    const loadOf = (polyfills: string[]) => {
      const p = polyfillEntryPlugin('/abs/polyfill-entry.js', polyfills, '/w');
      return (p.load as (id: string) => string | null)(POLYFILL_ENTRY_ID);
    };

    /**
     * 声明的是绝对路径，`toPolyfillSpecifier` 会 `path.resolve(workspaceRoot, x)`
     * 再过一道 `JSON.stringify`。Windows 上 `/abs/init.mjs` 会落到当前盘
     * （`C:\abs\init.mjs`）且反斜杠被转义成 `\\`，所以期望值按同一套规则算，
     * 不能写死 posix 字面量。Linux 上两者等价。
     */
    const imported = (p: string) => JSON.stringify(path.resolve('/w', p));

    it('声明了才多一行 import', () => {
      expect(loadOf(['/abs/init.mjs'])).toContain(imported('/abs/init.mjs'));
      expect(loadOf([])).not.toContain('init.mjs');
      // 自己的那份永远在
      expect(loadOf([])).toContain('/abs/polyfill-entry.js');
    });

    it('自己的 polyfill-entry 永远在最前', () => {
      const code = loadOf(['/abs/init.mjs'])!;
      expect(code.indexOf('polyfill-entry.js')).toBeLessThan(
        code.indexOf('init.mjs'),
      );
    });

    it('别的 id 一概不接管', () => {
      const resolveId = polyfillEntryPlugin('/abs/polyfill-entry.js', [], '/w')
        .resolveId as (id: string) => string | null;
      expect(resolveId('/some/real.js')).toBeNull();
      expect(resolveId(POLYFILL_ENTRY_ID)).toBe(POLYFILL_ENTRY_ID);
    });
  });

  describeBuilder(runViteBuilder, BROWSER_BUILDER_INFO, (harness) => {
    it(
      '声明后 polyfills.js 里真的带上了 $localize',
      async () => {
        const root = harness.host.root();
        const h = new MyTestProjectHost(harness.host);
        const list = await h.getFileList(
          normalize(join(root, 'src', '__pages')),
        );
        list.push(
          ...(await h.getFileList(
            normalize(join(root, 'src', '__components')),
          )),
        );
        await h.importPathRename(list);
        await h.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
        await h.moveDir(ALL_COMPONENT_NAME_LIST, '__components', 'components');
        await h.addPageEntry(ALL_PAGE_NAME_LIST);

        const result = await executeOnceShared(harness, 'build', {
          tsConfig: 'src/tsconfig.app.json',
          outputPath: 'dist/vite-localize',
          pages: DEFAULT_ANGULAR_CONFIG.pages,
          platform: PlatformType.wx,
          sourceMap: false,
          polyfills: ['@angular/localize/init'],
        });
        expect(result.result?.success).toBeTruthy();

        const names = (
          await h.getFileList(join(root, 'dist/vite-localize'))
        ).map(String);
        const p = names.find((n) => n.endsWith('polyfills.js'));
        expect(p).toBeTruthy();
        const code = virtualFs.fileBufferToString(
          await harness.host.read(normalize(p!)).toPromise(),
        );
        /**
         * init 的全部内容就是往全局上挂 `$localize`；define 已把 `globalThis`
         * 换成 `wx.__window`，所以两边必须同时出现。
         */
        expect(code).toContain('AbortController');
        expect(code).toMatch(/\$localize/);
        expect(code).toContain('wx.__window');

        /**
         * `Node` 的 define 是否真的作用进了 @angular/core。
         *
         * `walkIcuTree` 的 `case Node.TEXT_NODE` 不在 ngDevMode 守卫里，
         * 生产也要，所以这条必须落实；`assertDomNode` 的 `instanceof Node`
         * 同理（仅 ngDevMode）。
         */
        const all = (
          await Promise.all(
            names
              .filter((n) => n.endsWith('.js'))
              .map((n) => harness.host.read(normalize(String(n))).toPromise()),
          )
        )
          .map(virtualFs.fileBufferToString)
          .join('\n');
        // 换成了表上的 AgentNode
        expect(all).toMatch(
          /wx\.__window\.AgentNode\.(TEXT_NODE|COMMENT_NODE)/,
        );
        // 而且表上真的有：agent-node.ts 的 `globalThis.AgentNode = AgentNode`
        // 被 define 改写后的形态
        expect(all).toMatch(/wx\.__window\.AgentNode\s*=/);
        // 可执行代码里不该再剩裸 `Node`（`instanceof Node` 是最典型的一处）
        expect(all).not.toMatch(/instanceof\s+(?!\w+\.)Node\b/);
      },
      BUILD_TIMEOUT_MS,
    );
  });
});

/**
 * `Node` 的编译期重定义。
 *
 * 小程序全局上没有 `Node`（实测），也不需要有个全局叫这个名字，所以
 * `buildPlatformDefine` 直接把 `Node` 这个标识符换掉，运行时压根不存在它。
 * 但 `AgentNode` 必须真的挂在能力表上，否则换过去是 undefined——
 * 和 AbortController 一样是「define + 表里得有值」两步。
 */
describe('Node 的 define 重定向（单元）', () => {
  const define = buildPlatformDefine(getBuildPlatform(PlatformType.wx), false);

  it('裸 Node 指向能力表上的 AgentNode', () => {
    expect(define['Node']).toBe('wx.__window.AgentNode');
  });

  it('与 globalThis 重定向到同一张表', () => {
    // agent-node.ts 写的是 `globalThis.AgentNode = AgentNode`，
    // 两边必须落在同一个对象上，否则换过去取不到
    expect(define['Node']!.replace(/\.AgentNode$/, '')).toBe(
      define['globalThis'],
    );
  });
});
