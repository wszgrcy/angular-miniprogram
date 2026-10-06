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
import {
  BUILD_TIMEOUT_MS,
  executeOnceShared,
} from '../../../test/util/shared-build';
import { PlatformType } from '../platform/platform';
import { buildPlatformDefine, getBuildPlatform, runViteBuilder } from './index';

/**
 * AbortController polyfill 的接入验证。
 *
 * ## 背景
 *
 * 微信没有 `AbortController`，而 `abortcontroller-polyfill` 的默认入口
 * 靠给 `self` / `global` 赋值挂载——这两个标识符在小程序里都不存在，
 * 装了也不生效。
 *
 * 方案是两步配套：
 *   1. **手动导出**：`polyfill-entry.ts` 用纯 ponyfill
 *      `dist/abortcontroller`（只 exports 不碰全局），把类塞进
 *      app-template 建出的全局能力表 `obj`。
 *   2. **define 重定向**：`buildPlatformDefine` 把源码里的裸
 *      `AbortController` / `AbortSignal` 换成 `<平台>.__window.AbortController`。
 *
 * 两步缺一不可，所以这里两侧都要盯住。
 */
describe('AbortController polyfill 接入', () => {
  describe('define 重定向（单元）', () => {
    const define = buildPlatformDefine(
      // static-injector 7 下 BuildPlatform.templateTransform 靠 inject() 解析，
      // 不能再 `new WxBuildPlatform(new WxTransform())`，走真实的 provider 配置。
      getBuildPlatform(PlatformType.wx),
      false,
    );

    it('裸 AbortController 被重定向到全局能力表', () => {
      expect(define['AbortController']).toBe('wx.__window.AbortController');
    });

    it('裸 AbortSignal 同样被重定向', () => {
      expect(define['AbortSignal']).toBe('wx.__window.AbortSignal');
    });

    it('重定向目标与模板建出的表一致（__window 与 __global 同一对象）', () => {
      // 模板里是 `wx.__global = wx.__window = obj`，两者指向同一个 obj。
      // define 里 global 走 __global、window/globalThis 走 __window，
      // 所以 polyfill 挂哪儿都能被取到。
      expect(define['global']).toBe('wx.__global');
      expect(define['globalThis']).toBe('wx.__window');
    });
  });

  describeBuilder(runViteBuilder, BROWSER_BUILDER_INFO, (harness) => {
    it('polyfills.js 产出，且 app.js 把它 require 在第一位', async () => {
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

      const result = await executeOnceShared(harness, 'build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-polyfill',
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        platform: PlatformType.wx,
        sourceMap: false,
        // 与 localize-polyfill.build 用完全相同的输入，两边共用一份构建产物
        polyfills: ['@angular/localize/init'],
      });
      if (!result.result?.success) {
        const errLogs = (result.logs || [])
          .filter((l: { level: string }) => l.level === 'error')
          .map((l: { message?: string; value?: string }) =>
            String(l.message ?? l.value),
          );
        console.log('JS_ERR>>>' + errLogs.join(' ~~ ').slice(0, 4000));
      }
      expect(result.result?.success).toBeTruthy();

      const files = await myTestProjectHost.getFileList(
        join(root, 'dist/vite-polyfill'),
      );
      const names = files.map((f) => String(f));

      // 1. polyfill chunk 确实落盘了
      expect(names.some((n) => n.endsWith('polyfills.js'))).toBeTruthy();

      const appJsPath = names.find((n) => n.endsWith('/app.js'));
      expect(appJsPath).toBeTruthy();

      const polyfillPath = names.find((n) => n.endsWith('polyfills.js'));
      expect(polyfillPath).toBeTruthy();

      /**
       * define 生效的直接证据：入口里的 `globalThis` 已被换成
       * `wx.__window`，ponyfill 的类挂到了全局能力表上。
       */
      const polyfillJs = virtualFs.fileBufferToString(
        await harness.host.read(normalize(polyfillPath!)).toPromise(),
      );
      expect(polyfillJs).toContain('wx.__window');
      expect(polyfillJs).toContain('AbortController');
      // 盯实际赋值语句（注释里本来就含 globalThis 字样，不能直接
      // 用 not.toContain）。编译后的入口应该是 `var globalTable = wx.__window`，
      // 而不是 `globalThis`。
      expect(polyfillJs).toMatch(/var globalTable\s*=\s*wx\.__window/);
      expect(polyfillJs).not.toMatch(/var globalTable\s*=\s*globalThis/);

      const appJs = virtualFs.fileBufferToString(
        await harness.host.read(normalize(appJsPath!)).toPromise(),
      );

      // 2. app.js 里 importTemplate 在前（建 obj），polyfills 紧随其后
      const templateIdx = appJs.indexOf('wx.__global = wx.__window = obj');
      const polyfillIdx = appJs.indexOf("require('./polyfills.js')");
      expect(templateIdx).toBeGreaterThan(-1);
      expect(polyfillIdx).toBeGreaterThan(-1);
      expect(templateIdx).toBeLessThan(polyfillIdx);

      // 3. polyfills 是 require 列表的第一项
      const firstRequire = appJs.slice(polyfillIdx);
      expect(firstRequire.startsWith("require('./polyfills.js')")).toBeTruthy();

      // 反向对照：polyfills 之前不得出现别的 require
      const between = appJs.slice(templateIdx, polyfillIdx);
      expect(between).not.toContain('require(');
    });
  });

  describeBuilder(runViteBuilder, BROWSER_BUILDER_INFO, (harness) => {
    /**
     * `polyfills` 里声明的本地文件要真的进产物。
     *
     * 对齐 `@angular/build` 的 `getEsBuildCommonPolyfillsOptions`：数组每条
     * 一个 `import`，包名和本地文件都走普通解析。以前本包只从数组里挑
     * localize 那一条，写 `polyfills: ["src/polyfills.ts"]` 是配了不生效。
     */
    it(
      'polyfills 声明的本地文件被打进 polyfills.js',
      async () => {
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

        await harness.host
          .write(
            normalize(join(root, 'src', 'my-polyfill.ts')),
            virtualFs.stringToFileBuffer(
              'globalThis.__MP_PROBE_POLYFILL__ = 1;\n',
            ),
          )
          .toPromise();

        const result = await executeOnceShared(harness, 'build', {
          tsConfig: 'src/tsconfig.app.json',
          outputPath: 'dist/vite-polyfill-file',
          pages: DEFAULT_ANGULAR_CONFIG.pages,
          platform: PlatformType.wx,
          sourceMap: false,
          polyfills: ['src/my-polyfill.ts'],
        });
        expect(result.result?.success).toBeTruthy();

        const names = (
          await myTestProjectHost.getFileList(
            join(root, 'dist/vite-polyfill-file'),
          )
        ).map(String);
        const polyfillPath = names.find((n) => n.endsWith('polyfills.js'));
        expect(polyfillPath).toBeTruthy();
        const code = virtualFs.fileBufferToString(
          await harness.host.read(normalize(polyfillPath!)).toPromise(),
        );
        // define 已把 globalThis 换成 wx.__window，探针落在那张表上
        expect(code).toContain('__MP_PROBE_POLYFILL__');
        // 我们那份仍在同一个产物里，且排在用户条目之前（入口内执行顺序
        // = import 声明顺序，全局能力表必须先于任何用户 polyfill）
        expect(code).toContain('AbortController');
        expect(code.indexOf('AbortController')).toBeLessThan(
          code.indexOf('__MP_PROBE_POLYFILL__'),
        );
      },
      BUILD_TIMEOUT_MS,
    );
  });
});
