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
import { executeOnceShared } from '../../../test/util/shared-build';
import { PlatformType } from '../platform/platform';
import {
  POLYFILL_ENTRY_ID,
  buildPlatformDefine,
  getBuildPlatform,
  polyfillEntryPlugin,
  resolveLocalizeInit,
  runViteBuilder,
} from './index';

/**
 * `@angular/localize/init` 的接入方式。
 *
 * ## 为什么是构建期 polyfill，不是运行时兜底
 *
 * Angular 官方就把 `@angular/localize/init` 当 **polyfill**：
 * - `@angular/build` 看 `polyfills` 里有没有 `@angular/localize(/init)`，有就
 *   把它塞进 polyfills bundle（`application-code-bundle.js`）
 * - webpack 时代看 tsconfig `types`，有就把 `@angular/localize/init` 作为
 *   `main` 的第一个 entry（`configs/common.js`）
 * - AOT 内联翻译时干脆 `alias['@angular/localize/init'] = false` 整个摘掉
 *
 * 三条路都是**构建期决定**，运行时没有任何探测或兜底。CLI 甚至专门做了个
 * 插件对源码里直接 `import '@angular/localize/init'` 发警告。
 * 所以本项目也不在库里装 `$localize` 占位——没做 i18n 的项目不该为它付体积，
 * 更不该被要求装那个包。
 */
describe('@angular/localize/init 注入', () => {
  describe('判定（单元）', () => {
    it('没声明就返回 undefined', () => {
      expect(resolveLocalizeInit(undefined)).toBeUndefined();
      expect(resolveLocalizeInit('')).toBeUndefined();
      expect(resolveLocalizeInit(['zone.js'])).toBeUndefined();
    });

    for (const name of ['@angular/localize', '@angular/localize/init']) {
      it(`${name} 认得，且给的是裸标识符`, () => {
        expect(resolveLocalizeInit([name])).toBe('@angular/localize/init');
      });
    }

    it('单个串写法同样认（schema 允许 string）', () => {
      expect(resolveLocalizeInit('@angular/localize')).toBe(
        '@angular/localize/init',
      );
    });

    /**
     * 给裸标识符而不是解析后的绝对路径：解析交给 Vite，和应用里其余依赖走
     * 同一条路（exports map / conditions / alias 全一致）。自己
     * require.resolve 出来的路径在 monorepo 提升、`file:` 链接下会分叉。
     */
    it('给的是裸标识符，不是解析结果', () => {
      const r = resolveLocalizeInit(['@angular/localize'])!;
      expect(path.isAbsolute(r)).toBe(false);
      expect(r).not.toContain('node_modules');
      expect(r).not.toContain('fesm');
    });
  });

  /**
   * 为什么 `@angular/localize` 要归一成 `@angular/localize/init`，
   * 而不是「声明了什么就 import 什么」。
   *
   * 两者不等价，实测：
   *  - `@angular/localize` 主入口只导出 `ɵ` 前缀的内部 API
   *    （`ɵ$localize` / `loadTranslations` / `parseTranslation` …），
   *    **一个字都不碰 globalThis**。
   *  - `@angular/localize/init` 整个模块就一句
   *    `globalThis.$localize = $localize`。
   *
   * 而编译产物里的 i18n 常量走的是**裸 `$localize`**（define 换成
   * `<平台>.$localize`），那个全局只有 `/init` 会挂。所以照抄声明里的
   * `@angular/localize` 会构建成功、运行时全炸。
   *
   * 上游两条路径也都是归一到 `/init`：
   *  - `@angular/build` `application-code-bundle.js:119`
   *  - `build-angular` `configs/common.js:81`
   */
  describe('两种声明都归一到 /init', () => {
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
    const loadOf = (init: string | undefined) => {
      const p = polyfillEntryPlugin('/abs/polyfill-entry.js', init);
      return (p.load as (id: string) => string | null)(POLYFILL_ENTRY_ID);
    };

    it('声明了才多一行 import', () => {
      expect(loadOf('/abs/init.mjs')).toContain('/abs/init.mjs');
      expect(loadOf(undefined)).not.toContain('init.mjs');
      // 自己的那份永远在
      expect(loadOf(undefined)).toContain('/abs/polyfill-entry.js');
    });

    it('自己的 polyfill-entry 永远在最前', () => {
      const code = loadOf('/abs/init.mjs')!;
      expect(code.indexOf('polyfill-entry.js')).toBeLessThan(
        code.indexOf('init.mjs'),
      );
    });

    it('别的 id 一概不接管', () => {
      const resolveId = polyfillEntryPlugin('/abs/polyfill-entry.js', undefined)
        .resolveId as (id: string) => string | null;
      expect(resolveId('/some/real.js')).toBeNull();
      expect(resolveId(POLYFILL_ENTRY_ID)).toBe(POLYFILL_ENTRY_ID);
    });
  });

  describeBuilder(runViteBuilder, BROWSER_BUILDER_INFO, (harness) => {
    it('声明后 polyfills.js 里真的带上了 $localize', async () => {
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

      const result = await executeOnceShared(harness, 'build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-localize',
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        platform: PlatformType.wx,
        sourceMap: false,
        polyfills: ['@angular/localize'],
      });
      expect(result.result?.success).toBeTruthy();

      const names = (await h.getFileList(join(root, 'dist/vite-localize'))).map(
        String,
      );
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
      expect(all).toMatch(/wx\.__window\.AgentNode\.(TEXT_NODE|COMMENT_NODE)/);
      // 而且表上真的有：agent-node.ts 的 `globalThis.AgentNode = AgentNode`
      // 被 define 改写后的形态
      expect(all).toMatch(/wx\.__window\.AgentNode\s*=/);
      // 可执行代码里不该再剩裸 `Node`（`instanceof Node` 是最典型的一处）
      expect(all).not.toMatch(/instanceof\s+(?!\w+\.)Node\b/);
    }, 600000);
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
