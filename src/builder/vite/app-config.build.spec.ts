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
 * #1 app.json 编译生成的构建集成验证：
 *  - appJson 配置产出 app.json
 *  - 与 assets 静态 app.json 互斥
 *  - 校验失败时构建失败并给出可读错误
 */
describeBuilder(runViteBuilder, BROWSER_BUILDER_INFO, (harness) => {
  const setupFixture = async () => {
    const root = harness.host.root();
    const myTestProjectHost = new MyTestProjectHost(harness.host);
    const list = await myTestProjectHost.getFileList(
      normalize(join(root, 'src', '__pages'))
    );
    list.push(
      ...(await myTestProjectHost.getFileList(
        normalize(join(root, 'src', '__components'))
      ))
    );
    await myTestProjectHost.importPathRename(list);
    await myTestProjectHost.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
    await myTestProjectHost.moveDir(
      ALL_COMPONENT_NAME_LIST,
      '__components',
      'components'
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
      await harness.host
        .read(join(harness.host.root(), p))
        .toPromise()
    );

  const writeAppConfig = async (config: Record<string, unknown>) => {
    await harness.host
      .write(
        join(harness.host.root(), 'src', 'app.config.json'),
        virtualFs.stringToFileBuffer(JSON.stringify(config))
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
        components: DEFAULT_ANGULAR_CONFIG.components,
        assets: assetsWithoutAppJson,
        appJson: 'src/app.config.json',
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      if (!result.result?.success) {
        const errLogs = (result.logs || [])
          .filter((l: { level: string }) => l.level === 'error')
          .map((l: { message?: unknown }) => String(l.message));
        console.log('APPJSON_ERR>>>' + errLogs.join(' ~~ ').slice(0, 4000));
      }
      expect(result.result?.success).toBeTruthy();

      const appJson = JSON.parse(
        await readOutput('dist/vite-app-json/app.json')
      ) as {
        pages: string[];
        window: { navigationBarTitleText: string };
        tabBar: { list: Array<{ pagePath: string }> };
      };
      expect(appJson.pages).toEqual(builtPages);
      expect(appJson.window.navigationBarTitleText).toBe('compiled');
      expect(appJson.tabBar.list[0].pagePath).toBe(builtPages[0]);
    }, 300000);

    it('appJson 与 assets 静态 app.json 同时存在 → 构建失败', async () => {
      await setupFixture();
      await writeAppConfig({ pages: builtPages });

      harness.useTarget('build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-app-json-conflict',
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        components: DEFAULT_ANGULAR_CONFIG.components,
        assets: DEFAULT_ANGULAR_CONFIG.assets,
        appJson: 'src/app.config.json',
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      expect(result.result?.success).toBeFalsy();
      const allLogs = (result.logs || [])
        .map((l: { message?: unknown }) => String(l.message))
        .join(' ~~ ');
      expect(allLogs).toContain('冲突');
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
        components: DEFAULT_ANGULAR_CONFIG.components,
        assets: assetsWithoutAppJson,
        appJson: 'src/app.config.json',
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      expect(result.result?.success).toBeFalsy();
      const allLogs = (result.logs || [])
        .map((l: { message?: unknown }) => String(l.message))
        .join(' ~~ ');
      expect(allLogs).toContain('tabBar.pagePath');
      expect(allLogs).toContain('pages/ghost/ghost');
    }, 300000);
  });
});
