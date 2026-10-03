import { join, normalize, virtualFs } from '@angular-devkit/core';
import * as fs from 'fs';
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
import { PlatformType } from '../platform/platform';
import { runViteBuilder } from './index';

/**
 * 入口注册自动注入的构建集成验证。
 *
 * 入口文件只声明「我是哪个组件」（`export default`），
 * `bootstrapPage` / `componentRegistry` / `bootstrapCustomTabbar` 由构建器补：
 *  - 入口类型由来源决定：pages 是页面，customTabbar 是 tabBar，其余全是组件
 *  - 自定义 tabBar 的产物路径固定为 `custom-tab-bar/index`
 *  - 老写法（入口里自己调）仍然可用，且不会被重复注入
 */
describeBuilder(runViteBuilder, BROWSER_BUILDER_INFO, (harness) => {
  const setupFixture = async () => {
    const root = harness.host.root();
    const myTestProjectHost = new MyTestProjectHost(harness.host);
    const list = await myTestProjectHost.getFileList(
      normalize(join(root, 'src', '__pages')),
    );
    list.push(
      ...(await myTestProjectHost.getFileList(
        normalize(join(root, 'src', '__components')),
      )),
    );
    await myTestProjectHost.importPathRename(list);
    await myTestProjectHost.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
    await myTestProjectHost.moveDir(
      ALL_COMPONENT_NAME_LIST,
      '__components',
      'components',
    );
    await myTestProjectHost.addPageEntry(ALL_PAGE_NAME_LIST);
    return { root, myTestProjectHost };
  };

  const builtPages = ALL_PAGE_NAME_LIST.map((n) => `pages/${n}/${n}-entry`);

  const assetsWithoutAppJson = (
    DEFAULT_ANGULAR_CONFIG.assets as Array<{ glob: string }>
  ).filter((a) => a.glob !== 'app.json');

  const write = async (rel: string, content: string) => {
    await harness.host
      .write(
        join(harness.host.root(), rel),
        virtualFs.stringToFileBuffer(content),
      )
      .toPromise();
  };

  const readOutput = async (rel: string) =>
    virtualFs.fileBufferToString(
      await harness.host.read(join(harness.host.root(), rel)).toPromise(),
    );

  const exists = (base: string, rel: string) =>
    fs.existsSync(path.join(base, rel));

  /** 自定义 tabBar：源文件位置随意，产物必须落 custom-tab-bar/index */
  const writeTabbar = () =>
    Promise.all([
      write(
        'src/custom-tab-bar/index.component.ts',
        [
          "import { Component } from '@angular/core';",
          '',
          '@Component({',
          '  standalone: true,',
          "  selector: 'app-tabbar',",
          "  template: '<view>tabbar</view>',",
          '})',
          'export class TabbarComponent {}',
          '',
        ].join('\n'),
      ),
      write(
        'src/custom-tab-bar/index.entry.ts',
        "export { TabbarComponent as default } from './index.component';\n",
      ),
    ]);

  const build = async (
    outputPath: string,
    extra: Record<string, unknown> = {},
  ) => {
    harness.useTarget('build', {
      tsConfig: 'src/tsconfig.app.json',
      outputPath,
      main: DEFAULT_ANGULAR_CONFIG.main,
      pages: DEFAULT_ANGULAR_CONFIG.pages,
      assets: assetsWithoutAppJson,
      platform: PlatformType.wx,
      sourceMap: false,
      ...extra,
    } as never);
    return harness.executeOnce();
  };

  const errorText = (result: { logs: readonly unknown[] }) =>
    (result.logs || [])
      .map((l: { message?: string }) => String(l.message))
      .join(' ~~ ');

  describe('vite: 入口注册自动注入', () => {
    it('default export 入口被注入对应注册函数，tabBar 落 custom-tab-bar/index', async () => {
      await setupFixture();
      await writeTabbar();
      await write(
        'src/app.config.json',
        JSON.stringify({
          pages: builtPages,
          tabBar: {
            custom: true,
            list: [{ pagePath: builtPages[0], text: '首页' }],
          },
        }),
      );

      const result = await build('dist/vite-entry-bootstrap', {
        appJson: 'src/app.config.json',
      });
      if (!result.result?.success) {
        console.log('ENTRY_ERR>>>' + errorText(result).slice(0, 4000));
      }
      expect(result.result?.success).toBeTruthy();

      // 页面入口：注入 bootstrapPage
      const page = await readOutput(
        'dist/vite-entry-bootstrap/pages/base-tap/base-tap-entry.js',
      );
      expect(page).toContain('bootstrapPage');

      // 组件入口：注入 componentRegistry
      const component = await readOutput(
        'dist/vite-entry-bootstrap/components/component1/component1-entry.js',
      );
      expect(component).toContain('componentRegistry');

      // 自定义 tabBar：产物路径固定，注入 bootstrapCustomTabbar
      const base = result.result!.baseOutputPath as string;
      expect(exists(base, 'custom-tab-bar/index.js')).toBe(true);
      const tabbar = await readOutput(
        'dist/vite-entry-bootstrap/custom-tab-bar/index.js',
      );
      expect(tabbar).toContain('bootstrapCustomTabbar');
      // tabBar 组件的 json 必须带 component: true
      const tabbarJson = JSON.parse(
        await readOutput('dist/vite-entry-bootstrap/custom-tab-bar/index.json'),
      ) as { component?: boolean };
      expect(tabbarJson.component).toBe(true);

      // app.js 不能 require 入口类 chunk：那等于在 app 上下文调 Page()/Component()
      const appJs = await readOutput('dist/vite-entry-bootstrap/app.js');
      expect(appJs).not.toContain('custom-tab-bar');
      expect(appJs).not.toContain('pages/base-tap');
    }, 300000);

    it('支付宝：tabBar 产物目录跟着平台切成 customize-tab-bar', async () => {
      await setupFixture();
      await writeTabbar();
      await write(
        'src/app.config.json',
        JSON.stringify({
          pages: builtPages,
          tabBar: {
            // 支付宝的开关字段也不是 custom
            customize: true,
            list: [{ pagePath: builtPages[0], text: '首页' }],
          },
        }),
      );

      const result = await build('dist/vite-entry-tabbar-zfb', {
        appJson: 'src/app.config.json',
        platform: PlatformType.zfb,
      });
      if (!result.result?.success) {
        console.log('ZFB_ERR>>>' + errorText(result).slice(0, 4000));
      }
      expect(result.result?.success).toBeTruthy();
      const base = result.result!.baseOutputPath as string;

      // 源文件依旧放 src/custom-tab-bar，产物跟着平台走
      expect(exists(base, 'customize-tab-bar/index.js')).toBe(true);
      expect(exists(base, 'custom-tab-bar/index.js')).toBe(false);
      const tabbar = await readOutput(
        'dist/vite-entry-tabbar-zfb/customize-tab-bar/index.js',
      );
      expect(tabbar).toContain('bootstrapCustomTabbar');
    }, 300000);

    it('平台没有自定义 tabBar 时直接报错，不产一个没人加载的目录', async () => {
      await setupFixture();
      await writeTabbar();
      const result = await build('dist/vite-entry-tabbar-bdzn', {
        platform: PlatformType.bdzn,
      });
      expect(result.result?.success).toBeFalsy();
      expect(errorText(result)).toContain('没有自定义 tabBar');
    }, 300000);

    it('不配任何组件范围：其余入口全按组件处理，且不招 tsconfig 外的无关入口', async () => {
      await setupFixture();
      // 组件不在任何约定目录里，只能靠「整个 sourceRoot」的组件 glob 收到
      await write(
        'src/widgets/widget/widget.component.ts',
        [
          "import { Component } from '@angular/core';",
          '@Component({',
          '  standalone: true,',
          "  selector: 'app-widget',",
          "  template: '<view></view>',",
          '})',
          'export class WidgetComponent {}',
          '',
        ].join('\n'),
      );
      await write(
        'src/widgets/widget/widget.entry.ts',
        "export { WidgetComponent as default } from './widget.component';\n",
      );
      // 入口必须进 tsconfig 才算这个 app 的编译单元
      await write(
        'src/tsconfig.app.json',
        JSON.stringify({
          extends: '../tsconfig.base.json',
          compilerOptions: {
            outDir: '../out-tsc/app',
            types: [],
            skipLibCheck: true,
            target: 'ES2022',
          },
          files: ['main.ts'],
          include: [
            '**/*.d.ts',
            'pages/**/*.entry.ts',
            'components/**/*.entry.ts',
            'custom-tab-bar/**/*.entry.ts',
            'widgets/**/*.entry.ts',
          ],
        }),
      );

      const result = await build('dist/vite-entry-no-components');
      if (!result.result?.success) {
        console.log('NOCONF_ERR>>>' + errorText(result).slice(0, 4000));
      }
      expect(result.result?.success).toBeTruthy();
      const base = result.result!.baseOutputPath as string;

      // 产物路径按 sourceRoot 镜像：src/widgets/... → widgets/...
      expect(exists(base, 'widgets/widget/widget-entry.js')).toBe(true);
      const widget = await readOutput(
        'dist/vite-entry-no-components/widgets/widget/widget-entry.js',
      );
      expect(widget).toContain('componentRegistry');

      // 常规组件目录照旧产出（镜像路径与源目录同名）
      expect(exists(base, 'components/component1/component1-entry.js')).toBe(
        true,
      );

      // sourceRoot 下还躺着测试工程的 spec / spec-component 入口，
      // 它们不在 tsconfig.app.json 的编译单元里，必须被过滤掉
      const emitted = fs
        .readdirSync(base, { recursive: true })
        .map((f) => String(f));
      expect(emitted.filter((f) => f.startsWith('spec'))).toEqual([]);
      expect(emitted.filter((f) => f.startsWith('spec-component'))).toEqual([]);
    }, 300000);

    it('入口没有 default export → 构建失败且错误可读', async () => {
      await setupFixture();
      // 手写注册调用的老写法不再被识别：入口只认 export default
      await write(
        'src/pages/broken/broken.entry.ts',
        [
          "import { bootstrapPage } from 'angular-miniprogram';",
          "import { Component } from '@angular/core';",
          '@Component({',
          '  standalone: true,',
          "  selector: 'app-broken',",
          "  template: '<view></view>',",
          '})',
          'export class BrokenComponent {}',
          '',
          'bootstrapPage(BrokenComponent);',
          '',
        ].join('\n'),
      );

      const result = await build('dist/vite-entry-broken');
      expect(result.result?.success).toBeFalsy();
      expect(errorText(result)).toContain('没声明入口组件');
    }, 300000);
  });
});
