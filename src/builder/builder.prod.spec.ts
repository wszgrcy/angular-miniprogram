import { describeBuilder } from '../../test/plugin-describe-builder';
import {
  BROWSER_BUILDER_INFO,
  DEFAULT_ANGULAR_CONFIG,
  buildWebpackBrowserGenerate,
} from '../../test/test-builder/browser';
import { WebpackConfigurationChange } from '../builder/webpack-configuration-change';

const angularConfig = {
  ...DEFAULT_ANGULAR_CONFIG,
  platform: 'wx',
  buildOptimizer: true,
  optimization: true,
};

describeBuilder(
  buildWebpackBrowserGenerate((options, context) => {
    return async (config) => {
      const webpackConfigurationChange = new WebpackConfigurationChange(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    describe('builder-prod', () => {
      it('运行', async () => {
        harness.useTarget('build', angularConfig);
        const result = await harness.executeOnce();
        expect(result).toBeTruthy();
        expect(result.error).toBeFalsy();
        expect(result.logs[0].level !== 'error').toBeTruthy();
        expect(result.result.success).toBeTruthy();
      });
    });
  }
);
