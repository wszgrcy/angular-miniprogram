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
 * #3 条件编译（define 方案）构建集成验证：
 *  - 文件级：foo.ts + foo.wx.ts → wx 构建取 wx 变体
 *  - 代码级：__MP_WX__ 常量替换后死分支被 DCE 移除
 *  - 非 wx 平台（zfb）：无变体文件时回落 foo.ts，走 else 分支
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

  const write = async (rel: string, content: string) => {
    await harness.host
      .write(
        join(harness.host.root(), rel),
        virtualFs.stringToFileBuffer(content)
      )
      .toPromise();
  };

  const readOutput = async (rel: string) =>
    virtualFs.fileBufferToString(
      await harness.host.read(join(harness.host.root(), rel)).toPromise()
    );

  /** 写入平台常量 d.ts + 变体文件 + 探针入口 */
  const writePlatformProbe = async () => {
    await write(
      'src/platform-flags.d.ts',
      [
        'declare const __MP_PLATFORM__: string;',
        'declare const __MP_WX__: boolean;',
        'declare const __MP_ZFB__: boolean;',
        '',
      ].join('\n')
    );
    await write(
      'src/pages/root/platform-value.ts',
      "export const PLATFORM_VALUE = 'base-value';\n"
    );
    await write(
      'src/pages/root/platform-value.wx.ts',
      "export const PLATFORM_VALUE = __MP_WX__ ? 'wx-branch' : 'other-branch';\n"
    );
    await write(
      'src/pages/root/root.entry.ts',
      [
        "import { bootstrapPage } from 'angular-miniprogram';",
        "import { RootComponent } from './root.component';",
        "import { PLATFORM_VALUE } from './platform-value';",
        'bootstrapPage(RootComponent, { useComponent: true });',
        '// 全局赋值是副作用，不会被 tree-shaking 移除，作为产物探针',
        '(globalThis as any).__platformProbe = PLATFORM_VALUE;',
        '',
      ].join('\n')
    );
  };

  const buildWith = async (platform: PlatformType, outputPath: string) => {
    harness.useTarget('build', {
      tsConfig: 'src/tsconfig.app.json',
      outputPath,
      main: DEFAULT_ANGULAR_CONFIG.main,
      pages: DEFAULT_ANGULAR_CONFIG.pages,
      components: DEFAULT_ANGULAR_CONFIG.components,
      assets: (
        DEFAULT_ANGULAR_CONFIG.assets as Array<{ glob: string }>
      ).filter((a) => a.glob !== 'app.json'),
      platform,
      optimization: true,
      sourceMap: false,
    } as never);
    const result = await harness.executeOnce();
    if (!result.result?.success) {
      const errLogs = (result.logs || [])
        .filter((l: { level: string }) => l.level === 'error')
        .map((l: { message?: unknown }) => String(l.message));
      console.log('FLAGS_ERR>>>' + errLogs.join(' ~~ ').slice(0, 4000));
    }
    expect(result.result?.success).toBeTruthy();
  };

  describe('vite: 条件编译', () => {
    it('wx 平台：取 .wx.ts 变体文件，且 __MP_WX__ 死分支被 DCE', async () => {
      await setupFixture();
      await writePlatformProbe();
      await buildWith(PlatformType.wx, 'dist/vite-flags-wx');

      const entryJs = await readOutput(
        'dist/vite-flags-wx/pages/root/root-entry.js'
      );
      // 文件级：wx 变体生效
      expect(entryJs).toContain('wx-branch');
      // 代码级：base 文件未被引用，true 分支保留、else 分支移除
      expect(entryJs).not.toContain('base-value');
      expect(entryJs).not.toContain('other-branch');
    }, 300000);

    it('zfb 平台：无 .zfb.ts 变体回落 base 文件，走 else 分支', async () => {
      await setupFixture();
      await writePlatformProbe();
      await buildWith(PlatformType.zfb, 'dist/vite-flags-zfb');

      const entryJs = await readOutput(
        'dist/vite-flags-zfb/pages/root/root-entry.js'
      );
      // 无变体 → base 文件生效（其值原样）
      expect(entryJs).toContain('base-value');
      // wx 变体没被 zfb 误取
      expect(entryJs).not.toContain('wx-branch');
    }, 300000);
  });
});
