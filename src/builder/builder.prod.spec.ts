import { join, normalize } from '@angular-devkit/core';
import {
  MyTestProjectHost,
  describeBuilder,
  setWorkspaceRoot,
} from '../../test/plugin-describe-builder';
import {
  BROWSER_BUILDER_INFO,
  DEFAULT_ANGULAR_CONFIG,
} from '../../test/test-builder';
import {
  ALL_COMPONENT_NAME_LIST,
  ALL_PAGE_NAME_LIST,
} from '../../test/util/file';
import { runBuilder } from './application';
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
      harness.useTarget('build', angularConfig);
      const result = await harness.executeOnce();
      expect(result).toBeTruthy();
      expect(result.error).toBeFalsy();
      expect(result.logs[0].level !== 'error').toBeTruthy();
      expect(result.result?.success).toBeTruthy();
    });
  });
});
