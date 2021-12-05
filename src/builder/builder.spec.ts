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
import { runBuilder } from './browser';
import { PlatformType } from './platform/platform';

const angularConfig = { ...DEFAULT_ANGULAR_CONFIG, platform: PlatformType.wx };
const ALL_PAGE_NAME_LIST = [
  `root`,
  `base-component`,
  `base-directive`,
  `base-tap`,
  `complex-property-event`,
  `complex-structure`,
  `custom-structural-directive`,
  `default-structural-directive`,
  `ng-content`,
];
describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  async function getAllFile(dirPath: Path): Promise<string[]> {
    const fileList: string[] = [];
    const list = await harness.host.list(dirPath).toPromise();
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const filePath = join(dirPath, element);
      if (await harness.host.isDirectory(filePath).toPromise()) {
        fileList.push(...(await getAllFile(filePath)));
      } else {
        fileList.push(filePath);
      }
    }
    return fileList;
  }
  async function changeAllFile(list: string[]) {
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const content = await harness.host.read(normalize(element)).toPromise();
      let contentString = Buffer.from(content).toString();

      contentString = contentString
        .replace(/\/__components\//g, '/components/')
        .replace(/\/__pages\//g, '/pages/');

      await harness.host
        .write(normalize(element), stringToFileBuffer(contentString))
        .toPromise();
    }
  }
  async function addPageEntry(list: string[]) {
    const configPath = join(normalize(harness.host.root()), 'src', 'app.json');
    const file = await harness.host.read(configPath).toPromise();
    const json = JSON.parse(fileBufferToString(file));
    const entryList = ALL_PAGE_NAME_LIST.map(
      (item) => `pages/${item}/${item}.entry`
    );
    json.pages = entryList;
    await harness.host
      .write(configPath, stringToFileBuffer(JSON.stringify(json)))
      .toPromise();
  }
  describe('builder-dev', () => {
    it('运行全部', async () => {
      harness.useTarget('build', angularConfig);
      const root = harness.host.root();
      const list = await getAllFile(normalize(join(root, 'src', '__pages')));
      list.push(
        ...(await getAllFile(normalize(join(root, 'src', '__components'))))
      );
      await changeAllFile(list);
      await harness.host
        .rename(
          normalize(join(root, 'src', '__pages')),
          normalize(join(root, 'src', 'pages'))
        )
        .toPromise();
      await harness.host
        .rename(
          normalize(join(root, 'src', '__components')),
          normalize(join(root, 'src', 'components'))
        )
        .toPromise();
      await addPageEntry(ALL_PAGE_NAME_LIST);
      const result = await harness.executeOnce();
      expect(result).toBeTruthy();
      expect(result.error).toBeFalsy();
      expect(result.logs[0].level !== 'error').toBeTruthy();
      expect(result.result?.success).toBeTruthy();
      harness
        .expectFile(
          join(normalize(DEFAULT_ANGULAR_CONFIG.outputPath), 'styles.wxss')
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
