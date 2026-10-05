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
 * 分包体系构建集成验证：
 *  - 分包页面产物落进分包目录（packageA/...）
 *  - app.json 正确声明 subpackages（手写的 / 由 subpackages 选项派生的）
 *  - 跨分包静态 import 被检测报错
 */
describeBuilder(runViteBuilder, BROWSER_BUILDER_INFO, (harness) => {
  const setupBase = async () => {
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
      ].join('\n'),
    );
    await write(
      `src/packageA/pages/${name}/${name}.entry.ts`,
      [
        `export { SubPageComponent as default } from './${name}.component';`,
        '',
      ].join('\n'),
    );
  };

  const builtMainPages = ALL_PAGE_NAME_LIST.map((n) => `pages/${n}/${n}-entry`);

  /** 写一个最小页面（组件 + 入口），`imports` / `body` 用来插共享依赖 */
  const writePage = async (
    baseDir: string,
    name: string,
    imports: string[],
    body: string[],
  ) => {
    const cls =
      name
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map((s) => s[0].toUpperCase() + s.slice(1))
        .join('') + 'Component';
    await write(
      `${baseDir}/${name}/${name}.component.ts`,
      [
        "import { Component } from '@angular/core';",
        "import { CommonModule } from '@angular/common';",
        ...imports,
        '@Component({',
        '  standalone: true,',
        '  imports: [CommonModule],',
        `  selector: 'app-${name}',`,
        `  template: '<view>${name}</view>',`,
        '})',
        `export class ${cls} {`,
        ...body,
        '}',
        '',
      ].join('\n'),
    );
    await write(
      `${baseDir}/${name}/${name}.entry.ts`,
      `export { ${cls} as default } from './${name}.component';\n`,
    );
  };

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
        }),
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
          .map((l: { message?: string }) => String(l.message));
        console.log('SUBPKG_ERR>>>' + errLogs.join(' ~~ ').slice(0, 4000));
      }
      expect(result.result?.success).toBeTruthy();

      // 分包页面产物在 packageA/ 下
      const subEntry = await readOutput(
        'dist/vite-subpkg/packageA/pages/sub-page/sub-page-entry.js',
      );
      expect(subEntry).toContain('subpackage sub-page');

      const appJson = JSON.parse(
        await readOutput('dist/vite-subpkg/app.json'),
      ) as {
        pages: string[];
        subpackages: Array<{ root: string; pages: string[] }>;
      };
      expect(appJson.subpackages[0].root).toBe('packageA');
      expect(appJson.subpackages[0].pages).toContain(
        'pages/sub-page/sub-page-entry',
      );
    }, 300000);

    it('subpackages 选项：app.json 不写分包，构建器自己派生出来', async () => {
      await setupBase();
      await createSubPackagePage('sub-page');
      await createSubPackagePage('sub-b');

      harness.useTarget('build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-subpkg-auto',
        main: DEFAULT_ANGULAR_CONFIG.main,
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        subpackages: [
          {
            glob: '**/*.entry.ts',
            input: './src/packageA',
            output: 'packageA',
          },
        ],
        assets: DEFAULT_ANGULAR_CONFIG.assets,
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      if (!result.result?.success) {
        const errLogs = (result.logs || [])
          .filter((l: { level: string }) => l.level === 'error')
          .map((l: { message?: string }) => String(l.message));
        console.log('SUBPKG_AUTO_ERR>>>' + errLogs.join(' ~~ ').slice(0, 4000));
      }
      expect(result.result?.success).toBeTruthy();

      const appJson = JSON.parse(
        await readOutput('dist/vite-subpkg-auto/app.json'),
      ) as {
        pages: string[];
        subpackages: Array<{ root: string; pages: string[] }>;
      };
      expect(appJson.subpackages).toEqual([
        {
          root: 'packageA',
          pages: ['pages/sub-b/sub-b-entry', 'pages/sub-page/sub-page-entry'],
        },
      ]);
      // 分包页没被当成主包页
      expect(appJson.pages).not.toContain(
        'packageA/pages/sub-page/sub-page-entry',
      );
      expect(
        await readOutput(
          'dist/vite-subpkg-auto/packageA/pages/sub-page/sub-page-entry.js',
        ),
      ).toContain('subpackage sub-page');
    }, 300000);

    it('共享模块只产一份：分包内共用的归进分包，跨主包/分包的留主包', async () => {
      const { root, myTestProjectHost } = await setupBase();
      await write(
        'src/packageA/shared/a-shared.ts',
        `export const A_SHARED = 'A_SHARED_MARKER_7f3';\n`,
      );
      await write(
        'src/shared/main-shared.ts',
        `export const MAIN_SHARED = 'MAIN_SHARED_MARKER_9c1';\n`,
      );
      // 分包内两个页面共用一个模块
      await writePage(
        'src/packageA/pages',
        'sub-page',
        ["import { A_SHARED } from '../../shared/a-shared';"],
        ['  value = A_SHARED;'],
      );
      await writePage(
        'src/packageA/pages',
        'sub-b',
        ["import { A_SHARED } from '../../shared/a-shared';"],
        ['  value = A_SHARED;'],
      );
      // 主包页 + 分包页共用一个模块
      await writePage(
        'src/packageA/pages',
        'sub-c',
        ["import { MAIN_SHARED } from '../../../shared/main-shared';"],
        ['  value = MAIN_SHARED;'],
      );
      await writePage(
        'src/pages',
        'probe-main',
        ["import { MAIN_SHARED } from '../../shared/main-shared';"],
        ['  value = MAIN_SHARED;'],
      );

      harness.useTarget('build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-subpkg-shared',
        main: DEFAULT_ANGULAR_CONFIG.main,
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        subpackages: [
          {
            glob: '**/*.entry.ts',
            input: './src/packageA',
            output: 'packageA',
          },
        ],
        assets: DEFAULT_ANGULAR_CONFIG.assets,
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      if (!result.result?.success) {
        const errLogs = (result.logs || [])
          .filter((l: { level: string }) => l.level === 'error')
          .map((l: { message?: string }) => String(l.message));
        console.log(
          'SUBPKG_SHARED_ERR>>>' + errLogs.join(' ~~ ').slice(0, 4000),
        );
      }
      expect(result.result?.success).toBeTruthy();

      const outDir = 'dist/vite-subpkg-shared';
      const files = (
        await myTestProjectHost.getFileList(join(root, outDir))
      ).map(String);
      const cut = `/${outDir}/`;
      const relOf = (f: string) => {
        const p = f.replace(/\\/g, '/');
        const at = p.lastIndexOf(cut);
        return at === -1 ? p : p.slice(at + cut.length);
      };
      const js = new Map<string, string>();
      for (const f of files.filter((f) => f.endsWith('.js'))) {
        js.set(relOf(f), await readOutput(`${outDir}/${relOf(f)}`));
      }
      const hits = (marker: string) =>
        [...js].filter(([, text]) => text.includes(marker)).map(([p]) => p);

      // 只产一份，而且位置跟源码位置一致
      const inSub = hits('A_SHARED_MARKER_7f3');
      expect(inSub).toHaveLength(1);
      expect(inSub[0].startsWith('packageA/')).toBe(true);
      const inMain = hits('MAIN_SHARED_MARKER_9c1');
      expect(inMain).toHaveLength(1);
      expect(inMain[0].startsWith('packageA/')).toBe(false);
    }, 300000);

    it('分包只写在静态 app.json 里 → 分包插件照样生效', async () => {
      await setupBase();
      await createSubPackagePage('sub-page');
      // 不用 appJson 选项：分包信息只在 assets 的静态 app.json 里。
      // 以前分包插件在构建开始前自己读 appJson 选项的文件，这份它看不见，
      // 结果就是「写了分包但没拆」且零报错。
      await write(
        'src/app.json',
        JSON.stringify({
          pages: builtMainPages,
          subpackages: [
            { root: 'packageA', pages: ['pages/sub-page/sub-page-entry'] },
          ],
        }),
      );

      harness.useTarget('build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-subpkg-static',
        main: DEFAULT_ANGULAR_CONFIG.main,
        pages: [
          ...DEFAULT_ANGULAR_CONFIG.pages,
          {
            glob: '**/*.entry.ts',
            input: './src/packageA',
            output: 'packageA',
          },
        ],
        assets: DEFAULT_ANGULAR_CONFIG.assets,
        platform: PlatformType.wx,
        sourceMap: false,
      } as never);
      const result = await harness.executeOnce();
      if (!result.result?.success) {
        const errLogs = (result.logs || [])
          .filter((l: { level: string }) => l.level === 'error')
          .map((l: { message?: string }) => String(l.message));
        console.log(
          'SUBPKG_STATIC_ERR>>>' + errLogs.join(' ~~ ').slice(0, 4000),
        );
      }
      expect(result.result?.success).toBeTruthy();

      const appJson = JSON.parse(
        await readOutput('dist/vite-subpkg-static/app.json'),
      ) as { subpackages: Array<{ root: string }> };
      expect(appJson.subpackages[0].root).toBe('packageA');
      // 分包页面的产物落在分包目录（入口本身按 pattern 就在那里，
      // 这里要的是分包信息真的被构建器读到了，而不是默默当主包）
      expect(
        await readOutput(
          'dist/vite-subpkg-static/packageA/pages/sub-page/sub-page-entry.js',
        ),
      ).toContain('subpackage sub-page');
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
        ].join('\n'),
      );
      await write(
        'src/packageB/pages/sub-b/sub-b.entry.ts',
        [
          "export { SubBComponent as default } from './sub-b.component';",
          '',
        ].join('\n'),
      );
      await write(
        'src/app.config.json',
        JSON.stringify({
          pages: builtMainPages,
          subpackages: [
            { root: 'packageA', pages: ['pages/sub-page/sub-page-entry'] },
            { root: 'packageB', pages: ['pages/sub-b/sub-b-entry'] },
          ],
        }),
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
        .map((l: { message?: string }) => String(l.message))
        .join(' ~~ ');
      expect(allLogs).toContain('跨分包静态依赖');
    }, 300000);
  });
});
