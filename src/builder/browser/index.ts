import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import {
  BrowserBuilderOptions,
  executeBrowserBuilder,
} from '@angular-devkit/build-angular';
import * as webpack from 'webpack';
import { WebpackConfigurationChange } from '../webpack-configuration-change';
export default createBuilder(
  (
    angularOptions: BrowserBuilderOptions,
    context: BuilderContext
  ): ReturnType<typeof executeBrowserBuilder> => {
    return executeBrowserBuilder(angularOptions, context, {
      webpackConfiguration: async (options: webpack.Configuration) => {
        let config = new WebpackConfigurationChange(
          angularOptions as any,
          context,
          options
        );
        await config.change();
        return options;
      },
    });
  }
);
