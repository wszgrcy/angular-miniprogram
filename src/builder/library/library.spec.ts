/* eslint-disable @typescript-eslint/no-explicit-any */
import { join, normalize } from '@angular-devkit/core';
import * as fs from 'fs-extra';
import path from 'path';
import { describeBuilder } from '../../../test/plugin-describe-builder';
import {
  DEFAULT_ANGULAR_LIBRARY_CONFIG,
  LIBRARY_BUILDER_INFO,
} from '../../../test/test-builder';
import { execute } from './builder';
import { LIBRARY_COMPONENT_METADATA_SUFFIX } from './const';

describeBuilder(execute, LIBRARY_BUILDER_INFO, (harness) => {
  describe('test-library', () => {
    it('运行', async () => {
      harness.useTarget('library', DEFAULT_ANGULAR_LIBRARY_CONFIG);
      const result = await harness.executeOnce();
      expect(result).toBeTruthy();
      expect(result.result).toBeTruthy();
      expect(result.result.success).toBeTruthy();
      if (!result.result.success) {
        console.error(result.result.error);
      }
      const workspaceRoot: string = (result.result as any).workspaceRoot;
      const outputPath = normalize(`dist/test-library`);
      const output = path.join(workspaceRoot, outputPath);
      // ng-packagr 19 起不再把逐文件的 ESM（esm2022）产物写到磁盘，
      // 只输出打包后的 fesm2022（以及 .d.ts），因此断言改为 fesm2022 产物。
      const entryFile = harness.expectFile(
        join(outputPath, 'fesm2022', 'test-library.mjs')
      );
      entryFile.toExist();
      entryFile.content.toContain(`$self_Global_Template`);
      entryFile.content.toContain(
        `GlobalSelfTemplateComponent_${LIBRARY_COMPONENT_METADATA_SUFFIX}`
      );
      fs.copySync(
        output,
        path.resolve(
          process.cwd(),
          'test',
          'hello-world-app',
          'node_modules',
          'test-library'
        )
      );
    });
  });
});
