import { describeBuilder } from '../../test/plugin-describe-builder';
import {
  DEFAULT_ANGULAR_CONFIG,
  buildWebpackBrowserGenerate,
  BROWSER_BUILDER_INFO,
} from '../../test/test-builder/browser';
import { WebpackConfigurationChange } from '../builder/webpack-configuration-change';
import * as fs from 'fs-extra';
import * as path from 'path';
let angularConfig = { ...DEFAULT_ANGULAR_CONFIG, platform: 'wx' };

describeBuilder(
  buildWebpackBrowserGenerate((options, context) => {
    return async (config) => {
      let webpackConfigurationChange = new WebpackConfigurationChange(
        options as any,
        context,
        config
      );
      await webpackConfigurationChange.change();
      return config;
    };
  }),
  BROWSER_BUILDER_INFO,
  (harness) => {
    describe('builder-dev', () => {
      it('运行', async () => {
        harness.useTarget('build', angularConfig);
        let result = await harness.executeOnce();
        expect(result).toBeTruthy();
        expect(result.error).toBeFalsy();
        expect(result.logs[0].level !== 'error').toBeTruthy();
        expect(result.result.success).toBeTruthy();
        const realTestPath: string = result.result.outputPath as string;
        let appTestPath = path.resolve(process.cwd(), '__test-app');
        fs.copySync(realTestPath, path.resolve(process.cwd(), '__test-app'));
        ('等待断点放开');
        fs.removeSync(appTestPath);
      });
    });
  }
);
