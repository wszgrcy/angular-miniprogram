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
import { memoize } from '../../../test/util/memoize';
import { PlatformType } from '../platform/platform';
import { runViteBuilder } from './index';

/**
 * 入口注册自动注入的构建集成验证。入口文件只声明「我是哪个组件」（`export default`），
 * `bootstrapPage` / `componentRegistry` / `bootstrapCustomTabbar` 由构建器补：
 *  - 入口类型由来源决定：pages 是页面，customTabbar 是 tabBar，其余全是组件
 *  - 自定义 tabBar 的产物路径固定为 `custom-tab-bar/index`
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

  /**
   * 「default export 注入 + 自定义 tabBar」与「不配组件范围 / 不招 tsconfig 外入口」
   * 是同一次构建的两个侧面：前者看注入与 tabBar 落盘，后者看 widgets 被收进来、spec 入口被挡在外面。
   */
  const load = memoize(async () => {
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
    // 一个文件两个组件、都没有入口：产物必须各注册各的
    await write(
      'src/widgets/multi/multi.component.ts',
      [
        "import { Component } from '@angular/core';",
        "@Component({ standalone: true, selector: 'app-multi-a', template: '<view>a</view>' })",
        'export class MultiAComponent {}',
        "@Component({ standalone: true, selector: 'app-multi-b', template: '<view>b</view>' })",
        'export class MultiBComponent {}',
        '',
      ].join('\n'),
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
          'widgets/**/*.component.ts',
        ],
      }),
    );

    const result = await build('dist/vite-entry-bootstrap', {
      appJson: 'src/app.config.json',
    });
    if (!result.result?.success) {
      console.log('ENTRY_ERR>>>' + errorText(result).slice(0, 4000));
    }
    expect(result.result?.success).toBeTruthy();

    const base = result.result!.baseOutputPath as string;
    /**
     * `readdirSync(..., { recursive: true })` 在 Windows 上交回的是反斜杠路径，
     * 而下面全按 `a/b/c` 查表，不归一就会「构建绿了但文件一个也找不到」。
     */
    const names = fs
      .readdirSync(base, { recursive: true })
      .map((n) => String(n).split(path.win32.sep).join(path.posix.sep));
    const files = new Map(
      names
        .filter((n) => fs.statSync(path.join(base, n)).isFile())
        .map((n) => [n, fs.readFileSync(path.join(base, n), 'utf8')]),
    );
    return { names, files };
  });

  describe('vite: 入口注册自动注入', () => {
    it('default export 入口被注入对应注册函数，tabBar 落 custom-tab-bar/index', async () => {
      const { names, files } = await load();

      // 页面入口：注入 bootstrapPage
      expect(files.get('pages/base-tap/base-tap-entry.js')).toContain(
        'bootstrapPage',
      );

      // 组件入口：注入 componentRegistry
      expect(files.get('components/component1/component1-entry.js')).toContain(
        'componentRegistry',
      );

      // 自定义 tabBar：产物路径固定，注入 bootstrapCustomTabbar
      expect(names).toContain('custom-tab-bar/index.js');
      expect(files.get('custom-tab-bar/index.js')).toContain(
        'bootstrapCustomTabbar',
      );
      // tabBar 组件的 json 必须带 component: true
      expect(
        (
          JSON.parse(files.get('custom-tab-bar/index.json')!) as {
            component?: boolean;
          }
        ).component,
      ).toBe(true);

      // app.js 不能 require 入口类 chunk：那等于在 app 上下文调 Page()/Component()
      const appJs = files.get('app.js')!;
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
      const { names, files } = await load();

      // 产物路径按 sourceRoot 镜像：src/widgets/... → widgets/...
      expect(names).toContain('widgets/widget/widget-entry.js');
      expect(files.get('widgets/widget/widget-entry.js')).toContain(
        'componentRegistry',
      );

      // 常规组件目录照旧产出（镜像路径与源目录同名）
      expect(names).toContain('components/component1/component1-entry.js');

      // sourceRoot 下还躺着测试工程的 spec / spec-component 入口，它们不在 tsconfig.app.json
      // 的编译单元里，必须被过滤掉
      expect(names.filter((f) => f.startsWith('spec'))).toEqual([]);
      expect(names.filter((f) => f.startsWith('spec-component'))).toEqual([]);
    }, 300000);

    /**
     * 一个文件多个组件。小程序的组件身份是「一个路径 + 同名的 js/json/wxml/wxss」，
     * 同一目录放多个组件合法，撞名才非法，所以同文件多组件拆成同目录下的多个产物就行。
     * 回归点：虚拟入口模块 id 一度只按源文件编码，同文件的第二个组件会和第一个塌进同一个
     * rollup 模块——前者注册了对方的类，后者只剩一句 require。
     */
    it('一个文件多个组件：拆成同目录多个产物，各注册各的类', async () => {
      const { files } = await load();

      const a = 'widgets/multi/multi.component-MultiAComponent';
      const b = 'widgets/multi/multi.component-MultiBComponent';
      expect(files.get(`${a}.js`)).toBeDefined();
      expect(files.get(`${b}.js`)).toBeDefined();

      for (const [key, name, other] of [
        [a, 'MultiAComponent', 'MultiBComponent'],
        [b, 'MultiBComponent', 'MultiAComponent'],
      ] as const) {
        const js = files.get(`${key}.js`)!;
        expect(js).toContain(name);
        expect(js).not.toContain(other);
        expect(
          (JSON.parse(files.get(`${key}.json`)!) as { component?: boolean })
            .component,
        ).toBe(true);
      }
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
