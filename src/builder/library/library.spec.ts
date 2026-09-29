import { join, normalize } from '@angular-devkit/core';
import * as fs from 'fs-extra';
import path from 'path';
import { describeBuilder } from '../../../test/plugin-describe-builder';
import {
  DEFAULT_ANGULAR_LIBRARY_CONFIG,
  LIBRARY_BUILDER_INFO,
} from '../../../test/test-builder';
import { execute } from './builder';
import {
  LIBRARY_META_FILE_NAME,
  LIBRARY_META_SCHEMA_VERSION,
  LibraryMetaFile,
} from './library-meta-schema';

describeBuilder(execute, LIBRARY_BUILDER_INFO, (harness) => {
  describe('test-library', () => {
    it('运行', async () => {
      harness.useTarget('library', DEFAULT_ANGULAR_LIBRARY_CONFIG);
      const result = await harness.executeOnce();
      expect(result).toBeTruthy();
      expect(result.result).toBeTruthy();
      if (!result.result.success) {
        // 先打日志再断言：否则断言先抛，错误内容永远看不到。
        console.error('[test-library 构建失败]', result.result.error);
      }
      expect(result.result.success).toBeTruthy();
      const workspaceRoot = (result.result as { workspaceRoot?: string })
        .workspaceRoot as string;
      const outputPath = normalize(`dist/test-library`);
      const output = path.join(workspaceRoot, outputPath);
      // ng-packagr 19 起不再把逐文件的 ESM（esm2022）产物写到磁盘，
      // 只输出打包后的 fesm2022（以及 .d.ts），因此断言改为 fesm2022 产物。
      const entryFile = harness.expectFile(
        join(outputPath, 'fesm2022', 'test-library.mjs'),
      );
      entryFile.toExist();

      /**
       * **库产物必须与「普通 Angular 库」一模一样。**
       *
       * 以前这里断言的是 `toContain('$self_Global_Template')` —— 即库 JS 里
       * 必须带 mp 内联标记。现在方向反过来了：库构建只出
       * `mp-library-meta.json`，JS 产物里一个 mp 痕迹都不能有。
       *
       * 四个 offender 各自对应一条已废弃的旧通道：
       *   - `angular-miniprogram`  —— 注入的 `import * as amp ...`
       *   - `propertyChange`       —— 注入的运行时 hook 调用
       *   - `_ExtraData`           —— 组件模板载荷内联变量
       *   - `Global_Template`      —— 全局模板内联变量
       */
      const fesm = fs.readFileSync(
        path.join(output, 'fesm2022', 'test-library.mjs'),
        'utf8',
      );
      const offenders = [
        'angular-miniprogram',
        'propertyChange',
        '_ExtraData',
        'Global_Template',
      ].filter((needle) => fesm.includes(needle));
      expect(offenders)
        .withContext('库 JS 产物不应被改写，不应出现任何 mp 内联标记')
        .toEqual([]);

      // 元数据全部在 sidecar 里，且带模板载荷
      const metaPath = path.join(output, LIBRARY_META_FILE_NAME);
      expect(fs.existsSync(metaPath))
        .withContext('库根应产出 sidecar')
        .toBeTrue();
      const meta: LibraryMetaFile = JSON.parse(
        fs.readFileSync(metaPath, 'utf8'),
      );
      expect(meta.schemaVersion).toBe(LIBRARY_META_SCHEMA_VERSION);
      const entry = meta.entries['types/test-library.d.ts'];
      expect(entry.fesm).toBe('fesm2022/test-library.mjs');
      expect(entry.selfTemplate?.template)
        .withContext('自引用模板应从 JS 搬进 sidecar')
        .toContain('$$mp$$__self__$$libraryFirst');
      const comp = entry.components.TestLibraryComponent;
      expect(typeof comp.content)
        .withContext('content 应是 ${} 插值模板串')
        .toBe('string');
      expect(comp.content).toContain('hasLoad');
      // 平台相关部分以 ${} 插值形式存在，而不是写死的平台前缀
      expect(comp.content).toContain('${directivePrefix}');
      expect(comp.useComponents?.['app-other']).toBe(
        '/library/test-library/other-component/other-component',
      );
      expect(comp.style).toContain('lib-test-library__body');

      /**
       * 二级出口（`test-library/src/secondary`）。
       *
       * 多 entry point 的库必须和一级出口走完全相同的链路，不能只测
       * 「能编译过」：每个 entry 各自有自己的 `fesm`，各自带组件，
       * 主构建要按**组件名**分别对上。
       */
      const secondary = Object.values(meta.entries).find((e) =>
        e.moduleId.endsWith('/secondary'),
      );
      expect(secondary)
        .withContext('sidecar 应多出二级出口的 entry')
        .toBeDefined();
      expect(secondary!.fesm).toBe('fesm2022/test-library-src-secondary.mjs');
      expect(Object.keys(secondary!.components)).toEqual([
        'SecondaryEntryComponent',
      ]);

      const secComp = secondary!.components.SecondaryEntryComponent;
      expect(secComp.listeners).toEqual(['tap']);
      expect(secComp.properties).toEqual(['class']);
      expect(secComp.style).toContain('.lib-secondary-entry__text');
      expect(typeof secComp.content)
        .withContext('二级出口 content 应是 ${} 插值模板串')
        .toBe('string');
      // 平台相关部分留成 ${} 插值；wxml 自己的 {{}} 是静态文本，**不需要转义**
      expect(secComp.content).toContain('${directivePrefix}');
      expect(secComp.content).toContain('${eventListConvert(["tap"])}');
      expect(secComp.content).toContain('{{hasLoad}}');
      expect(secComp.content).not.toContain('\\{{');
      // 绝不能出现写死的平台前缀
      expect(secComp.content).not.toContain('wx:');
      expect(secComp.content).not.toContain('a:');
      expect(secComp.content).toContain('secondary entry works!');

      // 二级出口的 fesm 同样必须是 vanilla 产物
      const secFesm = fs.readFileSync(
        path.join(output, 'fesm2022', 'test-library-src-secondary.mjs'),
        'utf8',
      );
      const secOffenders = [
        'angular-miniprogram',
        'propertyChange',
        '_ExtraData',
        'Global_Template',
      ].filter((needle) => secFesm.includes(needle));
      expect(secOffenders)
        .withContext('二级出口的 JS 产物同样不应被改写')
        .toEqual([]);

      fs.copySync(
        output,
        path.resolve(
          process.cwd(),
          'test',
          'hello-world-app',
          'node_modules',
          'test-library',
        ),
      );
    });
  });
});
