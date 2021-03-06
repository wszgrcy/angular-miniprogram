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
import { getBuildPlatformInjectConfig } from '../platform/platform-inject-config';
import { WebpackConfigurationChangeService } from './webpack-configuration-change.service';

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
            provide: WebpackConfigurationChangeService,
            useFactory: (injector: Injector) => {
              return new WebpackConfigurationChangeService(
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
      const config = injector.get(WebpackConfigurationChangeService);
      config.init();
      await config.change();
      return options;
    },
  });
}
