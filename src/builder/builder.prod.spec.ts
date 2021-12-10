import { join, normalize } from '@angular-devkit/core';
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
  platform: PlatformType.wx,
  buildOptimizer: true,
  optimization: true,
  extractLicenses: true,
};

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('builder-prod', () => {
    it('运行', async () => {
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
    });
  });
});
