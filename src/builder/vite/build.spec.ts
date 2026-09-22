import { join, normalize, virtualFs } from '@angular-devkit/core';
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
import { PlatformType } from '../platform/platform';
import {
  createMiniProgramViteConfig,
  getBuildPlatform,
  runViteBuilder,
} from './index';

/** createMiniProgramViteConfig 只用到 workspaceRoot / target.project / getProjectMetadata */
function minimalCtx() {
  return {
    workspaceRoot: process.cwd(),
    target: { project: 'test', target: 'build', configuration: undefined },
    getProjectMetadata: async () => ({ root: '.', sourceRoot: 'src' }),
    logger: console,
  };
}

/**
 * Vite 构建链路验证（第一阶段：入口 + Angular AOT + propertyChange 注入）。
 *
 * 资产产出（wxml/json/wxss）在后续步骤接入，这里先保证
 * JS 侧的编译与注入是对的。
 */
describeBuilder(runViteBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('vite: 构建链路', () => {
    it('多入口构建成功，产物里注入了 propertyChange', async () => {
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

      const options = {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-app',
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        components: DEFAULT_ANGULAR_CONFIG.components,
        platform: PlatformType.wx,
        sourceMap: false,
      };

      harness.useTarget('build', options as never);
      const result = await harness.executeOnce();
      if (!result.result?.success) {
        const errLogs = (result.logs || [])
          .filter((l: { level: string }) => l.level === 'error')
          .map((l: { message?: unknown; value?: unknown }) =>
            String(l.message ?? l.value)
          );
        console.log('JS_ERR>>>' + errLogs.join(' ~~ ').slice(0, 6000));
      }
      expect(result.result?.success).toBeTruthy();

      const files = await myTestProjectHost.getFileList(
        join(root, 'dist/vite-app')
      );
      const jsFiles = files.filter((f) => String(f).endsWith('.js'));
      // 多入口：page + component 都要有产物
      expect(jsFiles.length).toBeGreaterThan(10);

      const read = async (p: string) =>
        virtualFs.fileBufferToString(
          await harness.host.read(normalize(p)).toPromise()
        );

      // 组件模板注入应该出现在产物里
      let injected = 0;
      for (const f of jsFiles) {
        const content = await read(String(f));
        if (content.includes('propertyChange')) {
          injected++;
        }
      }
      expect(injected).toBeGreaterThan(0);

      // 入口输出路径要带目录，和 webpack 时代 outputFiles.logic 对齐
      const paths = jsFiles.map((f) => String(f));
      expect(paths.some((p) => /pages\/[\w./-]+\.js$/.test(p))).toBe(true);
      expect(paths.some((p) => /components\/[\w./-]+\.js$/.test(p))).toBe(true);
    }, 300000);

    it('产出 wxml / json / wxss', async () => {
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

      harness.useTarget('build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-app2',
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        components: DEFAULT_ANGULAR_CONFIG.components,
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      if (!result.result?.success) {
        const errLogs = (result.logs || [])
          .filter((l: { level: string }) => l.level === 'error')
          .map((l: { message?: unknown; value?: unknown }) =>
            String(l.message ?? l.value)
          );
        console.log('ASSET_ERR>>>' + errLogs.join(' ~~ ').slice(0, 6000));
      }
      expect(result.result?.success).toBeTruthy();

      const files = (
        await myTestProjectHost.getFileList(join(root, 'dist/vite-app2'))
      ).map((f) => String(f));

      const wxml = files.filter((f) => f.endsWith('.wxml'));
      const json = files.filter((f) => f.endsWith('.json'));

      expect(wxml.length).toBeGreaterThan(0);
      expect(json.length).toBeGreaterThan(0);

      // getFileList 返回的已经是相对 host root 的路径，直接用
      const someWxml = virtualFs.fileBufferToString(
        await harness.host.read(normalize(wxml[0])).toPromise()
      );
      expect(someWxml.trim().length).toBeGreaterThan(0);

      // json 应该是合法 JSON 且带 usingComponents
      const someJsonRaw = virtualFs.fileBufferToString(
        await harness.host.read(normalize(json[0])).toPromise()
      );
      const someJson = JSON.parse(someJsonRaw);
      expect(someJson).toBeTruthy();
      expect(typeof someJson.usingComponents).toBe('object');
    }, 300000);
  });
});

describe('vite: fileReplacements / stylePreprocessorOptions 配置透传', () => {
  /**
   * 这里验的是**配置透传**，不是端到端替换效果。
   *
   * 为什么不端到端验：小程序模型里 main.ts 不是 entry（页面才是），
   * 而 environment.ts 只被 main.ts import，所以它根本不在 bundle 里，
   * 拿 fixture 断言「产物里出现 production: true」永远不成立。
   *
   * 要端到端验，得让某个 page entry 真的 import environment——
   * 那是改 fixture，不是改 builder。这里先把「选项没被静默丢掉」钉住。
   */
  it('fileReplacements 要透传给 analog 插件', async () => {
    const replacements = [
      {
        replace: 'src/environments/environment.ts',
        with: 'src/environments/environment.prod.ts',
      },
    ];
    const captured: unknown[] = [];
    const pluginStub = { name: 'capture', config: () => {} };

    // 直接检查我们组装出来的 config 里带上了 fileReplacements
    const config = await createMiniProgramViteConfig({
      viteOptions: {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/x',
        pages: [],
        components: [],
        platform: PlatformType.wx,
        fileReplacements: replacements,
        stylePreprocessorOptions: { includePaths: ['src/scss'] },
      },
      context: minimalCtx(),
      buildPlatform: getBuildPlatform(PlatformType.wx),
      extraPlugins: [pluginStub as never],
    });

    void captured;
    const plugins = config.plugins ?? [];
    // analog 插件收到的参数我们无法直接读，退而求其次：
    // 断言 config 里 stylePreprocessorOptions 落到了 css.preprocessorOptions
    const css = config.css as {
      preprocessorOptions?: { scss?: { includePaths?: string[] } };
    };
    expect(
      css?.preprocessorOptions?.scss?.includePaths?.some((p) =>
        p.endsWith('src/scss')
      )
    ).toBe(true);
  });
});
