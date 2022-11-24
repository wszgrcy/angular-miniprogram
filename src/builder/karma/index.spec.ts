import { BuilderOutput } from '@angular-devkit/architect';
import { join, normalize } from '@angular-devkit/core';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  BuilderHarnessExecutionResult,
  MyTestProjectHost,
  describeBuilder,
} from '../../../test/plugin-describe-builder';
import {
  DEFAULT_ANGULAR_KARMA_CONFIG,
  KARMA_BUILDER_INFO,
} from '../../../test/test-builder';
import { runBuilder } from './index';

const angularConfig = {
  ...DEFAULT_ANGULAR_KARMA_CONFIG,
  watch: true,
};
describeBuilder(runBuilder, KARMA_BUILDER_INFO, (harness) => {
  // 此测试仅能本地使用,并且只能一个测试用例单独开启
  xdescribe('karma', () => {
    it('运行', async () => {
      const root = harness.host.root();
      const myTestProjectHost = new MyTestProjectHost(harness.host);
      await myTestProjectHost.addSpecEntry([
        'empty',
        'tag-view-convert-spec',
        'style-class-spec',
        'life-time-spec',
        'ng-if-spec',
        'http-spec',
        'ng-content-spec',
        'ng-for-spec',
        'ng-library-import-spec',
        'ng-switch-spec',
        'ng-template-outlet-spec',
        'self-template-spec',
      ]);
      harness.useTarget('build', angularConfig);
      let appTestPath: string;
      const result = new Promise<BuilderHarnessExecutionResult<BuilderOutput>>(
        (res) => {
          let result;
          harness
            .execute({
              testContext: {
                buildSuccess: async (webpackConfig) => {
                  const realTestPath: string = webpackConfig.output!
                    .path as string;
                  appTestPath = path.resolve(process.cwd(), '__test-app');
                  fs.removeSync(appTestPath);
                  fs.copySync(realTestPath, appTestPath);
                },
              },
            })
            .subscribe({
              next: (value) => (result = value),
              complete: () => res(result),
            });
        }
      );
      await result;
      expect((await result).error).toBe(undefined);
      expect((await result).result.success).toBe(true);
      fs.removeSync(appTestPath);
    });

    xit('watch', async () => {
      const root = harness.host.root();
      const myTestProjectHost = new MyTestProjectHost(harness.host);
      await myTestProjectHost.addSpecEntry([
        'empty',
        'tag-view-convert-spec',
        'style-class-spec',
        'life-time-spec',
        'ng-if-spec',
        'http-spec',
        'ng-content-spec',
        'ng-for-spec',
        'ng-library-import-spec',
        'ng-switch-spec',
        'ng-template-outlet-spec',
        'self-template-spec',
      ]);
      harness.useTarget('build', { ...angularConfig, watch: true });
      let appTestPath: string;
      const result = new Promise<BuilderHarnessExecutionResult<BuilderOutput>>(
        (res) => {
          let first = true;
          harness
            .execute({
              testContext: {
                buildSuccess: async (webpackConfig) => {
                  const realTestPath: string = webpackConfig.output!
                    .path as string;
                  appTestPath = path.resolve(process.cwd(), '__test-app');
                  if (!first) {
                    fs.removeSync(appTestPath);
                    fs.copySync(realTestPath, appTestPath);
                    return;
                  }
                  first = false;
                  fs.removeSync(appTestPath);
                  fs.copySync(realTestPath, appTestPath);
                  setTimeout(async () => {
                    await writeFile();
                  }, 0);
                },
              },
            })
            .subscribe({
              next: (value) => res(value),
            });
        }
      );
      await result;
      expect((await result).error).toBe(undefined);
      expect((await result).result.success).toBe(true);
      fs.removeSync(appTestPath);
    });
  });

  function writeFile() {
    const fileContent = harness.readFile('src/spec/ng-if-spec/ng-if.spec.ts');

    return harness.writeFiles({
      'src/spec/ng-if-spec/ng-if.spec.ts': `${fileContent}
      describe('test-add',()=>{it('main',()=>{expect(true).toBe(true)})});`,
    });
  }
});
