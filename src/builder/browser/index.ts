import type { BuilderContext } from '@angular-devkit/architect';
import { createBuilder } from '@angular-devkit/architect';
import type {
  AssetPattern,
  BrowserBuilderOptions,
} from '@angular-devkit/build-angular';
import { executeBrowserBuilder } from '@angular-devkit/build-angular';
import { Injector } from 'static-injector';
import * as webpack from 'webpack';
import { BuildPlatform, PlatformType } from '../platform/platform';
import { getBuildPlatform } from '../platform/platform-info';
import { WxTransform } from '../platform/template-transform-strategy/wx.transform';
import { WxBuildPlatform } from '../platform/wx/wx-platform';
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
          { provide: WxTransform },
          { provide: WxBuildPlatform },
          {
            provide: BuildPlatform,
            useClass: getBuildPlatform(angularOptions.platform),
          },
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
      await config.change();
      return options;
    },
  });
}
