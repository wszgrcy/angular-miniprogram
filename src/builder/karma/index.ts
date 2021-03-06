import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import {
  AssetPattern,
  KarmaBuilderOptions,
} from '@angular-devkit/build-angular';
import { Injector } from 'static-injector';
import * as webpack from 'webpack';
import { WebpackConfigurationChangeService } from '../application/webpack-configuration-change.service';
import {
  BuildPlatform,
  PlatformType,
  getBuildPlatformInjectConfig,
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
      const buildPlatform = injector.get(BuildPlatform);
      options.plugins!.push(
        new webpack.DefinePlugin({
          describe: `${buildPlatform.globalVariablePrefix}.describe`,
          xdescribe: `${buildPlatform.globalVariablePrefix}.xdescribe`,
          fdescribe: `${buildPlatform.globalVariablePrefix}.fdescribe`,
          it: `${buildPlatform.globalVariablePrefix}.it`,
          xit: `${buildPlatform.globalVariablePrefix}.xit`,
          fit: `${buildPlatform.globalVariablePrefix}.fit`,
          beforeEach: `${buildPlatform.globalVariablePrefix}.beforeEach`,
          afterEach: `${buildPlatform.globalVariablePrefix}.afterEach`,
          beforeAll: `${buildPlatform.globalVariablePrefix}.beforeAll`,
          afterAll: `${buildPlatform.globalVariablePrefix}.afterAll`,
          setSpecProperty: `${buildPlatform.globalVariablePrefix}.setSpecProperty`,
          setSuiteProperty: `${buildPlatform.globalVariablePrefix}.setSuiteProperty`,
          expect: `${buildPlatform.globalVariablePrefix}.expect`,
          expectAsync: `${buildPlatform.globalVariablePrefix}.expectAsync`,
          pending: `${buildPlatform.globalVariablePrefix}.pending`,
          fail: `${buildPlatform.globalVariablePrefix}.fail`,
          spyOn: `${buildPlatform.globalVariablePrefix}.spyOn`,
          spyOnProperty: `${buildPlatform.globalVariablePrefix}.spyOnProperty`,
          spyOnAllFunctions: `${buildPlatform.globalVariablePrefix}.spyOnAllFunctions`,
          jsApiReporter: `${buildPlatform.globalVariablePrefix}.jsApiReporter`,
          jasmine: `${buildPlatform.globalVariablePrefix}.jasmine`,
        })
      );
      options.output!.path += '/dist';
      return options;
    },
  });
}
