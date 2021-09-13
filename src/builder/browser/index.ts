import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import {
  AssetPattern,
  BrowserBuilderOptions,
  executeBrowserBuilder,
} from '@angular-devkit/build-angular';
import * as webpack from 'webpack';
import { PlatformType } from '../platform/platform';
import { WebpackConfigurationChange } from '../webpack-configuration-change';

export default createBuilder(
  (
    angularOptions: BrowserBuilderOptions & {
      pages: AssetPattern[];
      components: AssetPattern[];
      platform: PlatformType;
    },
    context: BuilderContext
  ): ReturnType<typeof executeBrowserBuilder> => {
    return executeBrowserBuilder(angularOptions, context, {
      webpackConfiguration: async (options: webpack.Configuration) => {
        const config = new WebpackConfigurationChange(
          angularOptions,
          context,
          options
        );
        await config.change();
        return options;
      },
    });
  }
);
