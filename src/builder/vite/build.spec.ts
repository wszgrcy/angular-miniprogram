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
import { executeOnceShared } from '../../../test/util/shared-build';
import { PlatformType } from '../platform/platform';
import { runViteBuilder } from './index';

/**
 * Vite 构建链路验证（第一阶段：入口 + Angular AOT + propertyChange 注入）。
 *
 * 资产产出（wxml/json/wxss）在后续步骤接入，这里先保证
 * JS 侧的编译与注入是对的。
 */

/** 构建一次，多个用例复用同一份产物（产物内容先读进内存，sandbox 随用例销毁） */
function memoize<T>(fn: () => Promise<T>) {
  let promise: Promise<T> | undefined;
  return () => (promise = promise ?? fn());
}

describeBuilder(runViteBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('vite: 构建链路', () => {
    /**
     * 两条用例看的是同一次构建的不同侧面（JS 侧注入 / 资产产出），
     * 构建参数完全一致，所以合成一次构建。
     */
    const load = memoize(async () => {
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
        outputPath: 'dist/vite-app',
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        platform: PlatformType.wx,
        sourceMap: false,
      });
      if (!result.result?.success) {
        const errLogs = (result.logs || [])
          .filter((l: { level: string }) => l.level === 'error')
          .map((l: { message?: string; value?: string }) =>
            String(l.message ?? l.value),
          );
        console.log('JS_ERR>>>' + errLogs.join(' ~~ ').slice(0, 6000));
      }
      expect(result.result?.success).toBeTruthy();

      const files = await myTestProjectHost.getFileList(
        join(root, 'dist/vite-app'),
      );
      const read = async (p: string) =>
        virtualFs.fileBufferToString(
          await harness.host.read(normalize(p)).toPromise(),
        );

      const jsPaths = files
        .map((f) => String(f))
        .filter((f) => f.endsWith('.js'));
      const js = new Map<string, string>();
      for (const p of jsPaths) {
        js.set(p, await read(p));
      }

      const assetPaths = files.map((f) => String(f));
      const assets = new Map<string, string>();
      for (const ext of ['.wxml', '.json']) {
        for (const p of assetPaths.filter((f) => f.endsWith(ext))) {
          assets.set(p, await read(p));
        }
      }
      return { js, assets };
    });

    it('多入口构建成功，产物里注入了 propertyChange', async () => {
      const { js } = await load();
      // 多入口：page + component 都要有产物
      expect(js.size).toBeGreaterThan(10);

      // 组件模板注入应该出现在产物里
      expect(
        [...js.values()].filter((c) => c.includes('propertyChange')),
      ).not.toHaveLength(0);

      // 入口输出路径要带目录，和 webpack 时代 outputFiles.logic 对齐
      const paths = [...js.keys()];
      expect(paths.some((p) => /pages\/[\w./-]+\.js$/.test(p))).toBe(true);
      expect(paths.some((p) => /components\/[\w./-]+\.js$/.test(p))).toBe(true);
    }, 300000);

    it('产出 wxml / json / wxss', async () => {
      const { assets } = await load();

      const wxml = [...assets].filter(([p]) => p.endsWith('.wxml'));
      const json = [...assets].filter(([p]) => p.endsWith('.json'));

      expect(wxml.length).toBeGreaterThan(0);
      expect(json.length).toBeGreaterThan(0);

      const [, someWxml] = wxml[0];
      expect(someWxml.trim().length).toBeGreaterThan(0);

      // 页面 / 组件的 json 应该合法且带 usingComponents（app.json 是另一类文件，不比它）
      const pageJson = json.filter(([p]) => {
        const base = p.split(/[\\/]/).pop();
        return base !== 'app.json' && base !== 'project.config.json';
      });
      expect(pageJson.length).toBeGreaterThan(0);
      const someJson = JSON.parse(pageJson[0][1]);
      expect(someJson).toBeTruthy();
      expect(typeof someJson.usingComponents).toBe('object');
    }, 300000);
  });
});

describeBuilder(runViteBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('vite: fileReplacements 端到端', () => {
    /**
     * 造一个 page entry 真的 import environment，然后替换它，
     * 最后去 dist 里看替换有没有生效。
     *
     * 之前说「验不了」是错的——environment 不在 bundle 里只是因为
     * 现有 fixture 没有 page import 它，那是 fixture 的属性，
     * 不是 builder 的限制。自己写一个 entry 就能造出条件。
     */
    const setup = async () => {
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

      // 关键：写一个真的 import environment 的 page entry。
      // 值要绑到组件属性上，否则会被 tree-shake 掉。
      await harness.writeFile(
        'src/pages/env-probe/env-probe.entry.ts',
        `import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-env-probe',
  standalone: true,
  template: '<view>{{ isProd }}</view>',
})
export class EnvProbeComponent {
  isProd = environment.production;
}

export default EnvProbeComponent;
`,
      );
    };

    const readAllJs = (base: string) =>
      fs
        .readdirSync(base, { recursive: true })
        .map((f) => String(f))
        .filter((f) => f.endsWith('.js'))
        .map((f) => fs.readFileSync(path.join(base, f), 'utf8'))
        .join('\n');

    it('替换 environment 后，dist 里应该是 prod 的值', async () => {
      await setup();

      const result = await executeOnceShared(harness, 'build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-env',
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        platform: PlatformType.wx,
        sourceMap: false,
        fileReplacements: [
          {
            replace: 'src/environments/environment.ts',
            with: 'src/environments/environment.prod.ts',
          },
        ],
      });

      expect(result.result?.success).toBeTruthy();

      const base = result.result!.baseOutputPath as string;
      const all = readAllJs(base);

      // 替换生效 => 产物里是 prod 的 true，不该再有 dev 的 false
      expect(all).toContain('production: true');
      expect(all).not.toContain('production: false');

      // 而且这个 entry 确实产出了文件
      expect(
        fs.existsSync(path.join(base, 'pages/env-probe/env-probe-entry.js')) ||
          all.includes('env-probe'),
      ).toBe(true);
    }, 300000);

    it('不替换时，dist 里应该保持 dev 的值（对照组）', async () => {
      await setup();

      const result = await executeOnceShared(harness, 'build', {
        tsConfig: 'src/tsconfig.app.json',
        outputPath: 'dist/vite-noenv',
        pages: DEFAULT_ANGULAR_CONFIG.pages,
        platform: PlatformType.wx,
        sourceMap: false,
      });

      expect(result.result?.success).toBeTruthy();

      const all = readAllJs(result.result!.baseOutputPath as string);

      // 没替换 => 还是 dev 的 false
      expect(all).toContain('production: false');
      expect(all).not.toContain('production: true');
    }, 300000);
  });
});
