import * as fs from 'fs-extra';
import path from 'path';
import { describeBuilder } from '../../../test/plugin-describe-builder';
import {
  DEFAULT_ANGULAR_LIBRARY_CONFIG,
  LIBRARY_BUILDER_INFO,
} from '../../../test/test-builder/browser';
import { execute } from './index';

describeBuilder(execute, LIBRARY_BUILDER_INFO, (harness) => {
  describe('', () => {
    it('运行', async () => {
      harness.useTarget('library', DEFAULT_ANGULAR_LIBRARY_CONFIG);
      const result = await harness.executeOnce();
      expect(result).toBeTruthy();
      expect(result.result).toBeTruthy();
      expect(result.result.success).toBeTruthy();
      let workspaceRoot: string = (result.result as any).workspaceRoot;
      let output = path.join(workspaceRoot, 'dist/test-library');
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
