import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import {
  AssetPattern,
  KarmaBuilderOptions,
} from '@angular-devkit/build-angular';
import { Injector } from 'static-injector';
import * as webpack from 'webpack';
import { WebpackConfigurationChangeService } from '../application/webpack-configuration-change.service';
import {
  PlatformType,
  getBuildPlatformInjectConfig,
  BuildPlatform,
} from '../platform';
import { execute } from './index.origin';
export default createBuilder(
  (
    angularOptions: KarmaBuilderOptions & {
      pages: AssetPattern[];
      components: AssetPattern[];
      platform: PlatformType;
    },
    context: BuilderContext
  ): ReturnType<typeof execute> => {
    return runBuilder(angularOptions, context);
  }
);

export function runBuilder(
  angularOptions: KarmaBuilderOptions & {
    pages: AssetPattern[];
    components: AssetPattern[];
    platform: PlatformType;
  },
  context: BuilderContext
): ReturnType<typeof execute> {
  return execute(angularOptions, context, {
    webpackConfiguration: async (options: webpack.Configuration) => {
      const injector = Injector.create({
        providers: [
          ...getBuildPlatformInjectConfig(PlatformType.wx),
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
      let buildPlatform = injector.get(BuildPlatform);
      options.plugins!.push(
        new webpack.DefinePlugin({
          describe: `${buildPlatform.globalVariablePrefix}.describe`,
          it: `${buildPlatform.globalVariablePrefix}.it`,
          jasmine: `${buildPlatform.globalVariablePrefix}.jasmine`,
          expect: `${buildPlatform.globalVariablePrefix}.expect`,
        })
      );
      options.output!.path += '/dist';
      return options;
    },
  });
}
