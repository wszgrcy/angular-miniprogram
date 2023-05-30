import { join, normalize } from '@angular-devkit/core';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Injector } from 'static-injector';
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
  TEST_LIBRARY_COMPONENT_LIST,
} from '../../test/util/file';
import { runBuilder } from './application';
import { LIBRARY_OUTPUT_ROOTDIR } from './library';
import { BuildPlatform, PlatformType } from './platform/platform';
import { getBuildPlatformInjectConfig } from './platform/platform-inject-config';

const angularConfig = {
  ...DEFAULT_ANGULAR_CONFIG,
  platform: PlatformType.wx,
  sourceMap: false,
  // buildOptimizer: true,
  // optimization: true,
};
describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('builder-dev', () => {
    for (const platform of [
      PlatformType.wx,
      PlatformType.bdzn,
      PlatformType.dd,
      PlatformType.jd,
      PlatformType.qq,
      PlatformType.zfb,
      PlatformType.zj,
    ]) {
      it(`运行${PlatformType[platform]}`, async () => {
        angularConfig.platform = platform;
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
        const libraryPath = join(
          normalize(DEFAULT_ANGULAR_CONFIG.outputPath),
          LIBRARY_OUTPUT_ROOTDIR,
          'test-library'
        );
        const librarySelfTemplateFile = harness.expectFile(
          join(libraryPath, `self${buildPlatform.fileExtname.contentTemplate}`)
        );
        librarySelfTemplateFile.toExist();
        librarySelfTemplateFile.content.toContain(`$$mp$$__self__$$`);
        TEST_LIBRARY_COMPONENT_LIST.forEach((item) => {
          const componentPath = join(libraryPath, item, item);
          harness
            .expectFile(componentPath + buildPlatform.fileExtname.logic)
            .toExist();
          harness
            .expectFile(
              componentPath + (buildPlatform.fileExtname.config || '.json')
            )
            .toExist();
          harness
            .expectFile(componentPath + buildPlatform.fileExtname.content)
            .toExist();
        });
        const realTestPath: string = result.result?.baseOutputPath as string;
        const appTestPath = path.resolve(process.cwd(), '__test-app');
        fs.copySync(realTestPath, path.resolve(process.cwd(), '__test-app'));
        // ('等待断点放开');
        fs.removeSync(appTestPath);
      });
    }
  });
});
