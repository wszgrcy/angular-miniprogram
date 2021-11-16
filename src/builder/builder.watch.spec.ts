import { join, normalize } from '@angular-devkit/core';
import { of } from 'rxjs';
import { concatMap, skip, take } from 'rxjs/operators';
import { describeBuilder } from '../../test/plugin-describe-builder';
import {
  BROWSER_BUILDER_INFO,
  DEFAULT_ANGULAR_CONFIG,
} from '../../test/test-builder/browser';
import { runBuilder } from './browser';
import { PlatformType } from './platform/platform';

const angularConfig = {
  ...DEFAULT_ANGULAR_CONFIG,
  platform: PlatformType.wx,
  watch: true,
};

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('builder-watch-dev', () => {
    it('运行', async (cb) => {
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
                'src/pages/sub3/sub3.entry.ts': `import { pageStartup } from '../../../../../src/platform';
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
          expect(result.result.success).toBeTruthy();
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
          cb();
        });
    });
  });
});
