import { join, normalize, virtualFs } from '@angular-devkit/core';
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
 * app.json 合并的构建集成验证：
 *  - appJson 与 assets 里的静态 app.json 同时存在 = 合并（不再报错）
 *  - 静态那份写过的不动，appJson 里没写过的补进去
 *  - 校验对合并结果跑，静态那份的问题只警告
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

  // 入口文件 root.entry.ts 的产物路径是 pages/root/root-entry（点转横线），
  // 与 addPageEntry 写入 app.json 的 pages 命名一致
  const builtPages = ALL_PAGE_NAME_LIST.map((n) => `pages/${n}/${n}-entry`);

  /** assets 只拷 project.config.json，不带 app.json（避免冲突干扰） */
  const assetsWithoutAppJson = (
    DEFAULT_ANGULAR_CONFIG.assets as Array<{ glob: string }>
  ).filter((a) => a.glob !== 'app.json');

  const readOutput = async (p: string) =>
    virtualFs.fileBufferToString(
      await harness.host.read(join(harness.host.root(), p)).toPromise(),
    );

  const writeAppConfig = async (config: Record<string, unknown>) => {
    await harness.host
      .write(
        join(harness.host.root(), 'src', 'app.config.json'),
        virtualFs.stringToFileBuffer(JSON.stringify(config)),
      )
      .toPromise();
  };

  describe('vite: app.json 编译生成', () => {
    it('appJson 配置产出 app.json，内容含校验过的 pages/tabBar', async () => {
      await setupFixture();
      await writeAppConfig({
        pages: builtPages,
        window: { navigationBarTitleText: 'compiled' },
        tabBar: {
          list: [{ pagePath: builtPages[0], text: '首页' }],
        },
      });

      harness.useTarget('build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-app-json',
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        assets: assetsWithoutAppJson,
        appJson: 'src/app.config.json',
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      if (!result.result?.success) {
        const errLogs = (result.logs || [])
          .filter((l: { level: string }) => l.level === 'error')
          .map((l: { message?: string }) => String(l.message));
        console.log('APPJSON_ERR>>>' + errLogs.join(' ~~ ').slice(0, 4000));
      }
      expect(result.result?.success).toBeTruthy();

      const appJson = JSON.parse(
        await readOutput('dist/vite-app-json/app.json'),
      ) as {
        pages: string[];
        window: { navigationBarTitleText: string };
        tabBar: { list: Array<{ pagePath: string }> };
      };
      expect(appJson.pages).toEqual(builtPages);
      expect(appJson.window.navigationBarTitleText).toBe('compiled');
      expect(appJson.tabBar.list[0].pagePath).toBe(builtPages[0]);
    }, 300000);

    it('appJson 与 assets 静态 app.json 同时存在 → 合并，输出是两份的并集', async () => {
      await setupFixture();
      // 静态那份（addPageEntry 写的 pages + fixture 自带的 window/style）保留，
      // appJson 只补 tabBar 和一个静态里没写的字段
      await writeAppConfig({
        pages: [builtPages[0]],
        window: { navigationBarTitleText: '会被静态那份盖掉' },
        tabBar: { list: [{ pagePath: builtPages[0], text: '首页' }] },
        lazyCodeLoading: 'requiredComponents',
      });

      harness.useTarget('build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-app-json-merge',
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        assets: DEFAULT_ANGULAR_CONFIG.assets,
        appJson: 'src/app.config.json',
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      if (!result.result?.success) {
        const errLogs = (result.logs || [])
          .filter((l: { level: string }) => l.level === 'error')
          .map((l: { message?: string }) => String(l.message));
        console.log('MERGE_ERR>>>' + errLogs.join(' ~~ ').slice(0, 4000));
      }
      expect(result.result?.success).toBeTruthy();

      const appJson = JSON.parse(
        await readOutput('dist/vite-app-json-merge/app.json'),
      ) as {
        pages: string[];
        window: { navigationBarTitleText: string };
        style: string;
        tabBar: { list: Array<{ pagePath: string }> };
        lazyCodeLoading: string;
      };
      // 静态那份写过的一个字不动
      expect(appJson.pages).toEqual(builtPages);
      expect(appJson.window.navigationBarTitleText).toBe('Weixin');
      expect(appJson.style).toBe('v2');
      // 静态里没写的从 appJson 补进来
      expect(appJson.tabBar.list[0].pagePath).toBe(builtPages[0]);
      expect(appJson.lazyCodeLoading).toBe('requiredComponents');
    }, 300000);

    it('$schema 只给编辑器用，不会跟着进产物', async () => {
      await setupFixture();
      await writeAppConfig({
        $schema:
          './node_modules/angular-miniprogram/builder/schemas/app-config.schema.json',
        pages: [builtPages[0]],
      });

      harness.useTarget('build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-app-json-schema',
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        assets: assetsWithoutAppJson,
        appJson: 'src/app.config.json',
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      expect(result.result?.success).toBeTruthy();

      const appJson = JSON.parse(
        await readOutput('dist/vite-app-json-schema/app.json'),
      ) as Record<string, unknown>;
      expect('$schema' in appJson).toBe(false);
      expect(appJson.pages).toContain(builtPages[0]);
    }, 300000);

    it('静态 app.json 里 tabBar 指向不存在的页面 → 警告不拦构建', async () => {
      await setupFixture();
      await harness.host
        .write(
          join(harness.host.root(), 'src', 'app.json'),
          virtualFs.stringToFileBuffer(
            JSON.stringify({
              pages: builtPages,
              tabBar: {
                list: [{ pagePath: 'pages/ghost/ghost', text: '幽灵' }],
              },
            }),
          ),
        )
        .toPromise();

      harness.useTarget('build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-app-json-static-warn',
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        assets: DEFAULT_ANGULAR_CONFIG.assets,
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      expect(result.result?.success).toBeTruthy();
      const warnLogs = (result.logs || [])
        .filter((l: { level: string }) => l.level === 'warn')
        .map((l: { message?: string }) => String(l.message))
        .join(' ~~ ');
      expect(warnLogs).toContain('pages/ghost/ghost');
    }, 300000);

    it('两个配置源都没配时，输出的 app.json 只有构建器算出的 pages', async () => {
      await setupFixture();
      harness.useTarget('build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-app-json-derived',
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        assets: assetsWithoutAppJson,
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      expect(result.result?.success).toBeTruthy();
      const appJson = JSON.parse(
        await readOutput('dist/vite-app-json-derived/app.json'),
      ) as Record<string, unknown>;
      expect(Object.keys(appJson)).toEqual(['pages']);
      // 构建器扫出来的顺序就是 glob 展开顺序，只比内容不比顺序
      expect([...(appJson.pages as string[])].sort()).toEqual(
        [...builtPages].sort(),
      );
    }, 300000);

    it('tabBar 指向未构建页面 → 构建失败且错误可读', async () => {
      await setupFixture();
      await writeAppConfig({
        pages: builtPages,
        tabBar: {
          list: [{ pagePath: 'pages/ghost/ghost', text: '幽灵' }],
        },
      });

      harness.useTarget('build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-app-json-invalid',
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        assets: assetsWithoutAppJson,
        appJson: 'src/app.config.json',
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      expect(result.result?.success).toBeFalsy();
      const allLogs = (result.logs || [])
        .map((l: { message?: string }) => String(l.message))
        .join(' ~~ ');
      expect(allLogs).toContain('tabBar.pagePath');
      expect(allLogs).toContain('pages/ghost/ghost');
    }, 300000);
  });
});
