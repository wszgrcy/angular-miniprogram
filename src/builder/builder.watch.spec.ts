import { join, normalize } from '@angular-devkit/core';
import { of } from 'rxjs';
import { concatMap, skip, take } from 'rxjs/operators';
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
  watch: true,
};

describeBuilder(
  runBuilder,
  { ...BROWSER_BUILDER_INFO, name: 'test-builder:watch' },
  (harness) => {
    describe('builder-watch-dev', () => {
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
              harness
                .writeFiles({
                  'src/pages/sub3/sub3.component.html': `<p>{{title}} works!</p>`,
                  'src/pages/sub3/sub3.component.ts': `import { Component } from '@angular/core';
              
              @Component({
                selector: 'app-sub3',
                templateUrl: './sub3.component.html',
              })
              export class Sub3Component {
                title = 'sub3组件';
               
              }
              `,
                  'src/pages/sub3/sub3.entry.json': `{
                "usingComponents": { }
              }
              `,
                  'src/pages/sub3/sub3.entry.ts': `import { pageStartup } from 'angular-miniprogram';
              import { Sub3Component } from './sub3.component';
              import { Sub3Module } from './sub3.module';
              
              pageStartup(Sub3Module, Sub3Component);
              `,
                  'src/pages/sub3/sub3.module.ts': `import { NgModule } from '@angular/core';
              import { Sub3Component } from './sub3.component';
              
              @NgModule({
                declarations: [Sub3Component],
              })
              export class Sub3Module {}
              `,
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
            expect(result.logs[0].message).toContain('sub3.entry.js');
            harness
              .expectFile(
                join(
                  normalize(DEFAULT_ANGULAR_CONFIG.outputPath),
                  'pages/sub3/sub3.entry.js'
                )
              )
              .toExist();
            harness
              .expectFile(
                join(
                  normalize(DEFAULT_ANGULAR_CONFIG.outputPath),
                  'pages/sub3/sub3.entry.json'
                )
              )
              .toExist();
            harness
              .expectFile(
                join(
                  normalize(DEFAULT_ANGULAR_CONFIG.outputPath),
                  'pages/sub3/sub3.entry.wxml'
                )
              )
              .toExist();
            harness
              .expectFile(
                join(
                  normalize(DEFAULT_ANGULAR_CONFIG.outputPath),
                  'pages/sub3/sub3.entry.wxss'
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
