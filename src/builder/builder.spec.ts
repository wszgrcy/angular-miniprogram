import { Path, join, normalize } from '@angular-devkit/core';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Injector, inject } from 'static-injector';
import { describeBuilder } from '../../test/plugin-describe-builder';
import {
  BROWSER_BUILDER_INFO,
  DEFAULT_ANGULAR_CONFIG,
} from '../../test/test-builder/browser';
import {
  ALL_COMPONENT_NAME_LIST,
  ALL_PAGE_NAME_LIST,
} from '../../test/util/file';
import { runBuilder } from './browser';
import { BuildPlatform, PlatformType } from './platform/platform';
import { getBuildPlatformInjectConfig } from './platform/platform-info';

const angularConfig = {
  ...DEFAULT_ANGULAR_CONFIG,
  platform: PlatformType.wx,
  sourceMap: false,
  // buildOptimizer: true,
  // optimization: true,
};

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('builder-dev', () => {
    it('运行全部', async () => {
      const root = harness.host.root();
      const list = await harness.host.getFileList(
        normalize(join(root, 'src', '__pages'))
      );
      list.push(
        ...(await harness.host.getFileList(
          normalize(join(root, 'src', '__components'))
        ))
      );
      await harness.host.importPathRename(list);
      await harness.host.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
      await harness.host.moveDir(
        ALL_COMPONENT_NAME_LIST,
        '__components',
        'components'
      );
      await harness.host.addPageEntry(ALL_PAGE_NAME_LIST);
      harness.useTarget('build', angularConfig);
      const result = await harness.executeOnce();
      expect(result).toBeTruthy();
      expect(result.error).toBeFalsy();
      expect(result.logs[0].level !== 'error').toBeTruthy();
      expect(result.result?.success).toBeTruthy();
      const injectList = getBuildPlatformInjectConfig(angularConfig.platform);
      const injector = Injector.create({ providers: injectList });
      const buildPlatform = injector.get(BuildPlatform);
      harness
        .expectFile(
          join(
            normalize(DEFAULT_ANGULAR_CONFIG.outputPath),
            `app${buildPlatform.fileExtname.style}`
          )
        )
        .toExist();
      const realTestPath: string = result.result?.outputPath as string;
      const appTestPath = path.resolve(process.cwd(), '__test-app');
      fs.copySync(realTestPath, path.resolve(process.cwd(), '__test-app'));
      // ('等待断点放开');
      fs.removeSync(appTestPath);
    });
  });
});
