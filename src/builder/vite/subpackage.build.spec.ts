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
 * #2 分包体系构建集成验证：
 *  - 分包页面产物落进分包目录（packageA/...）
 *  - app.json 正确声明 subpackages
 *  - 跨分包静态 import 被检测报错
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

  /** 在 src/packageA 下创建一个分包页面 */
  const createSubPackagePage = async (name = 'sub-page') => {
    await write(
      `src/packageA/pages/${name}/${name}.component.ts`,
      [
        "import { Component } from '@angular/core';",
        "import { CommonModule } from '@angular/common';",
        '@Component({',
        '  standalone: true,',
        '  imports: [CommonModule],',
        `  selector: 'app-${name}',`,
        `  template: '<view>subpackage ${name}</view>',`,
        '})',
        `export class SubPageComponent {`,
        `  value = '${name}-value';`,
        '}',
        '',
      ].join('\n')
    );
    await write(
      `src/packageA/pages/${name}/${name}.entry.ts`,
      [
        "import { bootstrapPage } from 'angular-miniprogram';",
        `import { SubPageComponent } from './${name}.component';`,
        `bootstrapPage(SubPageComponent);`,
        '',
      ].join('\n')
    );
  };

  const builtMainPages = ALL_PAGE_NAME_LIST.map(
    (n) => `pages/${n}/${n}-entry`
  );

  describe('vite: 分包', () => {
    it('分包页面产物落进 packageA 目录，app.json 声明 subpackages', async () => {
      await setupBase();
      await createSubPackagePage('sub-page');
      await write(
        'src/app.config.json',
        JSON.stringify({
          pages: builtMainPages,
          subpackages: [
            { root: 'packageA', pages: ['pages/sub-page/sub-page-entry'] },
          ],
        })
      );

      harness.useTarget('build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-subpkg',
        main: DEFAULT_ANGULAR_CONFIG.main,
        pages: [
          ...DEFAULT_ANGULAR_CONFIG.pages,
          {
            glob: '**/*.entry.ts',
            input: './src/packageA',
            output: 'packageA',
          },
        ],
        components: DEFAULT_ANGULAR_CONFIG.components,
        assets: (
          DEFAULT_ANGULAR_CONFIG.assets as Array<{ glob: string }>
        ).filter((a) => a.glob !== 'app.json'),
        appJson: 'src/app.config.json',
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      if (!result.result?.success) {
        const errLogs = (result.logs || [])
          .filter((l: { level: string }) => l.level === 'error')
          .map((l: { message?: unknown }) => String(l.message));
        console.log('SUBPKG_ERR>>>' + errLogs.join(' ~~ ').slice(0, 4000));
      }
      expect(result.result?.success).toBeTruthy();

      // 分包页面产物在 packageA/ 下
      const subEntry = await readOutput(
        'dist/vite-subpkg/packageA/pages/sub-page/sub-page-entry.js'
      );
      expect(subEntry).toContain('subpackage sub-page');

      const appJson = JSON.parse(
        await readOutput('dist/vite-subpkg/app.json')
      ) as {
        pages: string[];
        subpackages: Array<{ root: string; pages: string[] }>;
      };
      expect(appJson.subpackages[0].root).toBe('packageA');
      expect(appJson.subpackages[0].pages).toContain(
        'pages/sub-page/sub-page-entry'
      );
    }, 300000);

    it('跨分包静态 import 被检测报错', async () => {
      await setupBase();
      await createSubPackagePage('sub-page');
      // 第二个分包 packageB，其组件 import packageA 的组件（跨分包）
      await write(
        'src/packageB/pages/sub-b/sub-b.component.ts',
        [
          "import { Component } from '@angular/core';",
          "import { CommonModule } from '@angular/common';",
          "import { SubPageComponent } from '../../../packageA/pages/sub-page/sub-page.component';",
          '@Component({',
          '  standalone: true,',
          '  // 真实引用跨分包组件，确保不被 tree-shake，触发跨分包依赖',
          '  imports: [CommonModule, SubPageComponent],',
          "  selector: 'app-sub-b',",
          "  template: '<view>sub-b<app-sub-page></app-sub-page></view>',",
          '})',
          'export class SubBComponent {}',
          '',
        ].join('\n')
      );
      await write(
        'src/packageB/pages/sub-b/sub-b.entry.ts',
        [
          "import { bootstrapPage } from 'angular-miniprogram';",
          "import { SubBComponent } from './sub-b.component';",
          'bootstrapPage(SubBComponent);',
          '',
        ].join('\n')
      );
      await write(
        'src/app.config.json',
        JSON.stringify({
          pages: builtMainPages,
          subpackages: [
            { root: 'packageA', pages: ['pages/sub-page/sub-page-entry'] },
            { root: 'packageB', pages: ['pages/sub-b/sub-b-entry'] },
          ],
        })
      );

      harness.useTarget('build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-subpkg-cross',
        main: DEFAULT_ANGULAR_CONFIG.main,
        pages: [
          ...DEFAULT_ANGULAR_CONFIG.pages,
          {
            glob: '**/*.entry.ts',
            input: './src/packageA',
            output: 'packageA',
          },
          {
            glob: '**/*.entry.ts',
            input: './src/packageB',
            output: 'packageB',
          },
        ],
        components: DEFAULT_ANGULAR_CONFIG.components,
        assets: (
          DEFAULT_ANGULAR_CONFIG.assets as Array<{ glob: string }>
        ).filter((a) => a.glob !== 'app.json'),
        appJson: 'src/app.config.json',
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      expect(result.result?.success).toBeFalsy();
      const allLogs = (result.logs || [])
        .map((l: { message?: unknown }) => String(l.message))
        .join(' ~~ ');
      expect(allLogs).toContain('跨分包静态依赖');
    }, 300000);
  });
});
