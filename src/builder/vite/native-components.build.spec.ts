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
 * #4 原生自定义组件接入构建集成验证：
 *  - 原生组件目录整体拷进产物
 *  - 页面 wxml 命中原生标签 → 页面 json 注入 usingComponents
 */
describeBuilder(runViteBuilder, BROWSER_BUILDER_INFO, (harness) => {
  const setupBase = async () => {
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

  describe('vite: 原生组件', () => {
    it('原生组件目录拷进产物，页面命中标签注入 usingComponents', async () => {
      await setupBase();
      // 原生组件：wxcomponents/van-button/van-button.{json,wxml,js}
      await write(
        'src/wxcomponents/van-button/van-button.json',
        JSON.stringify({ component: true })
      );
      await write(
        'src/wxcomponents/van-button/van-button.wxml',
        '<view>native van-button</view>'
      );
      await write(
        'src/wxcomponents/van-button/van-button.js',
        'Component({ properties: {} });'
      );
      // 使用原生组件的页面
      await write(
        'src/pages/native-host/native-host.component.ts',
        [
          "import { Component } from '@angular/core';",
          "import { CommonModule } from '@angular/common';",
          "import { NO_ERRORS_SCHEMA } from '@angular/core';",
          '@Component({',
          '  standalone: true,',
          '  imports: [CommonModule],',
          '  schemas: [NO_ERRORS_SCHEMA],',
          "  selector: 'app-native-host',",
          "  template: '<view><van-button>点我</van-button></view>',",
          '})',
          'export class NativeHostComponent {}',
          '',
        ].join('\n')
      );
      await write(
        'src/pages/native-host/native-host.entry.ts',
        [
          "import { bootstrapPage } from 'angular-miniprogram';",
          "import { NativeHostComponent } from './native-host.component';",
          'bootstrapPage(NativeHostComponent);',
          '',
        ].join('\n')
      );
      // app.json 补上这个页面
      await write(
        'src/app.config.json',
        JSON.stringify({
          pages: [
            ...ALL_PAGE_NAME_LIST.map((n) => `pages/${n}/${n}-entry`),
            'pages/native-host/native-host-entry',
          ],
        })
      );

      harness.useTarget('build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-native',
        main: DEFAULT_ANGULAR_CONFIG.main,
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        components: DEFAULT_ANGULAR_CONFIG.components,
        assets: (
          DEFAULT_ANGULAR_CONFIG.assets as Array<{ glob: string }>
        ).filter((a) => a.glob !== 'app.json'),
        appJson: 'src/app.config.json',
        nativeComponentsDir: 'src/wxcomponents',
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      if (!result.result?.success) {
        const errLogs = (result.logs || [])
          .filter((l: { level: string }) => l.level === 'error')
          .map((l: { message?: unknown }) => String(l.message));
        console.log('NATIVE_ERR>>>' + errLogs.join(' ~~ ').slice(0, 4000));
      }
      expect(result.result?.success).toBeTruthy();

      // 原生组件文件被拷进产物
      const copiedWxml = await readOutput(
        'dist/vite-native/wxcomponents/van-button/van-button.wxml'
      );
      expect(copiedWxml).toContain('native van-button');

      // 页面 json 注入了 usingComponents
      const pageJson = JSON.parse(
        await readOutput(
          'dist/vite-native/pages/native-host/native-host-entry.json'
        )
      ) as { usingComponents: Record<string, string> };
      expect(pageJson.usingComponents['van-button']).toBe(
        '../../wxcomponents/van-button/van-button'
      );
    }, 300000);
  });
});
