import { BuilderOutput } from '@angular-devkit/architect';
import { join, normalize } from '@angular-devkit/core';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  BuilderHarnessExecutionResult,
  describeBuilder,
} from '../../../test/plugin-describe-builder';
import {
  DEFAULT_ANGULAR_KARMA_CONFIG,
  KARMA_BUILDER_INFO,
} from '../../../test/test-builder';
import { runBuilder } from './index';

const angularConfig = {
  ...DEFAULT_ANGULAR_KARMA_CONFIG,
};
describeBuilder(runBuilder, KARMA_BUILDER_INFO, (harness) => {
  // 此测试仅能本地使用,并且只能一个测试用例单独开启
  xdescribe('karma', () => {
    it('运行', async () => {
      const root = harness.host.root();
      const list: string[] = [];

      list.push(
        ...(await harness.host.getFileList(
          normalize(join(root, 'src', '__components'))
        )),
        ...(await harness.host.getFileList(
          normalize(join(root, 'src', 'spec'))
        ))
      );
      await harness.host.importPathRename(list);
      await harness.host.moveDir(
        ['component1', 'component2'],
        '__components',
        'components'
      );
      await harness.host.addSpecEntry(['base-component']);
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

    it('watch', async () => {
      const root = harness.host.root();
      const list: string[] = [];

      list.push(
        ...(await harness.host.getFileList(
          normalize(join(root, 'src', '__components'))
        )),
        ...(await harness.host.getFileList(
          normalize(join(root, 'src', 'spec'))
        ))
      );
      await harness.host.importPathRename(list);
      await harness.host.moveDir(
        ['component1', 'component2'],
        '__components',
        'components'
      );
      await harness.host.addSpecEntry(['base-component']);
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
    const fileContent = harness.readFile(
      'src/spec/base-component/base-component.entry.spec.ts'
    );

    return harness.writeFiles({
      'src/spec/base-component/base-component.entry.spec.ts': `${fileContent}
      describe('test-add',()=>{it('main',()=>{expect(true).toBe(true)})});`,
    });
  }
});
