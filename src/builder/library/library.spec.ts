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
      const entryFile = harness.expectFile(
        join(outputPath, 'esm2022', 'test-library.mjs')
      );
      entryFile.toExist();
      entryFile.content.toContain(`$self_Global_Template`);
      const globalSelfTemplate = harness.expectFile(
        join(
          outputPath,
          'esm2022',
          'global-self-template',
          'global-self-template.component.mjs'
        )
      );
      globalSelfTemplate.toExist();
      globalSelfTemplate.content.toContain(
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
