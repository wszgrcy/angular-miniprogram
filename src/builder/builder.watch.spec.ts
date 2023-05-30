import { join, normalize } from '@angular-devkit/core';
import fs from 'node:fs';
import path from 'node:path';
import { of } from 'rxjs';
import { concatMap, skip, take } from 'rxjs/operators';
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
  watch: true,
};
describeBuilder(
  runBuilder,
  { ...BROWSER_BUILDER_INFO, name: 'test-builder:watch' },
  (harness) => {
    describe('builder-watch-dev', () => {
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
        let finish: Function;
        const waitFinish = new Promise((res) => {
          finish = res;
        });
        harness.useTarget('build', angularConfig);
        harness
          .execute()
          .pipe(
            concatMap((result, index) => {
              if (index) {
                return of(result);
              }
              const value = JSON.parse(harness.readFile('src/app.json'));
              value.pages.push(`pages/sub3/sub3-entry`);
              const data = readFixture('watch/sub3', 'src/pages/sub3');
              harness
                .writeFiles({
                  'src/app.json': JSON.stringify(value),
                  ...data,
                })
                .then(
                  (res) => {},
                  (rej) => {
                    throw rej;
                  }
                );
              return of(result);
            }),
            take(2),
            skip(1)
          )
          .subscribe((result) => {
            expect(result.logs[0].level !== 'error').toBeTruthy();
            expect(result).toBeTruthy();
            expect(result.error).toBeFalsy();
            expect(result.result?.success).toBeTruthy();
            expect(result.logs[0].message).toContain('sub3-entry.js');
            harness
              .expectFile(
                join(
                  normalize(DEFAULT_ANGULAR_CONFIG.outputPath),
                  'pages/sub3/sub3-entry.js'
                )
              )
              .toExist();
            harness
              .expectFile(
                join(
                  normalize(DEFAULT_ANGULAR_CONFIG.outputPath),
                  'pages/sub3/sub3-entry.json'
                )
              )
              .toExist();
            harness
              .expectFile(
                join(
                  normalize(DEFAULT_ANGULAR_CONFIG.outputPath),
                  'pages/sub3/sub3-entry.wxml'
                )
              )
              .toExist();
            harness
              .expectFile(
                join(
                  normalize(DEFAULT_ANGULAR_CONFIG.outputPath),
                  'pages/sub3/sub3-entry.wxss'
                )
              )
              .toExist();
            harness
              .expectFile(
                join(
                  normalize(DEFAULT_ANGULAR_CONFIG.outputPath),
                  'library/test-library/lib-comp1-component/lib-comp1-component.js'
                )
              )
              .toExist();
            finish();
          });
        await waitFinish;
      });
    });
  }
);
function readFixture(dir: string, to: string) {
  const dirPath = path.resolve(__dirname, 'test/fixture', dir);
  const list = fs.readdirSync(dirPath);
  const fileObject: Record<string, string> = {};
  for (const item of list) {
    const filePath = path.resolve(dirPath, item);
    const content = fs.readFileSync(filePath, { encoding: 'utf8' });
    fileObject[`${path.posix.join(to, item)}`] = content;
  }
  return fileObject;
}
