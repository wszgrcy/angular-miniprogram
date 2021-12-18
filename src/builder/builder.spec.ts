import { Path, join, normalize } from '@angular-devkit/core';
import {
  fileBufferToString,
  stringToFileBuffer,
} from '@angular-devkit/core/src/virtual-fs/host';
import * as fs from 'fs-extra';
import * as path from 'path';
import { describeBuilder } from '../../test/plugin-describe-builder';
import {
  BROWSER_BUILDER_INFO,
  DEFAULT_ANGULAR_CONFIG,
} from '../../test/test-builder/browser';
import {
  ALL_COMPONENT_NAME_LIST,
  ALL_PAGE_NAME_LIST,
  addPageEntry,
  copySpecifiedComponents,
  copySpecifiedPages,
  getAllFile,
  importPathRename,
} from '../../test/util/file';
import { runBuilder } from './browser';
import { PlatformType } from './platform/platform';

const angularConfig = {
  ...DEFAULT_ANGULAR_CONFIG,
  platform: PlatformType.qq,
  sourceMap: false,
  // buildOptimizer: true,
  // optimization: true,
};

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('builder-dev', () => {
    it('运行全部', async () => {
      const root = harness.host.root();
      const list = await getAllFile(
        harness,
        normalize(join(root, 'src', '__pages'))
      );
      list.push(
        ...(await getAllFile(
          harness,
          normalize(join(root, 'src', '__components'))
        ))
      );
      await importPathRename(harness, list);
      await copySpecifiedPages(harness, ALL_PAGE_NAME_LIST);
      await copySpecifiedComponents(harness, ALL_COMPONENT_NAME_LIST);
      await addPageEntry(harness, ALL_PAGE_NAME_LIST);
      harness.useTarget('build', angularConfig);
      const result = await harness.executeOnce();
      expect(result).toBeTruthy();
      expect(result.error).toBeFalsy();
      expect(result.logs[0].level !== 'error').toBeTruthy();
      expect(result.result?.success).toBeTruthy();
      // harness
      //   .expectFile(
      //     join(normalize(DEFAULT_ANGULAR_CONFIG.outputPath), 'app.wxss')
      //   )
      //   .toExist();
      const realTestPath: string = result.result?.outputPath as string;
      const appTestPath = path.resolve(process.cwd(), '__test-app');
      fs.copySync(realTestPath, path.resolve(process.cwd(), '__test-app'));
      // ('等待断点放开');
      fs.removeSync(appTestPath);
    });
  });
});
