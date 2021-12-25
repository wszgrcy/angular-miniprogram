import type { BuilderContext } from '@angular-devkit/architect';
import { createBuilder } from '@angular-devkit/architect';
import type {
  AssetPattern,
  BrowserBuilderOptions,
} from '@angular-devkit/build-angular';
import { executeBrowserBuilder } from '@angular-devkit/build-angular';
import { Injector } from 'static-injector';
import * as webpack from 'webpack';
import { PlatformType } from '../platform/platform';
import { getBuildPlatformInjectConfig } from '../platform/platform-info';
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
    return runBuilder(angularOptions, context);
  }
);

export function runBuilder(
  angularOptions: BrowserBuilderOptions & {
    pages: AssetPattern[];
    components: AssetPattern[];
    platform: PlatformType;
  },
  context: BuilderContext
): ReturnType<typeof executeBrowserBuilder> {
  return executeBrowserBuilder(angularOptions, context, {
    webpackConfiguration: async (options: webpack.Configuration) => {
      const injector = Injector.create({
        providers: [
          ...getBuildPlatformInjectConfig(angularOptions.platform),
          {
            provide: WebpackConfigurationChange,
            useFactory: (injector: Injector) => {
              return new WebpackConfigurationChange(
                angularOptions,
                context,
                options,
                injector
              );
            },
            deps: [Injector],
          },
        ],
      });
      const config = injector.get(WebpackConfigurationChange);
      config.init();
      await config.change();
      return options;
    },
  });
}
