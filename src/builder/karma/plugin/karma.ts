// import { statsErrorsToString } from '@angular-devkit/build-angular/src/webpack/utils/stats';
import { logging } from '@angular-devkit/core';
import { createConsoleLogger } from '@angular-devkit/core/node';
import { ConfigOptions, launcher } from 'karma';
import * as webpack from 'webpack';

launcher.Launcher.generateId = () => {
  return 'miniprogram';
};
let blocked: any[] = [];
let isBlocked = false;
let successCb: () => void;
let failureCb: () => void;

function init(
  config: ConfigOptions & {
    buildWebpack: {
      logger: logging.Logger;
      failureCb: () => void;
      successCb: () => void;
      testContext: { buildSuccess: (arg: webpack.Configuration) => void };
      webpackConfig: webpack.Configuration;
    };
    configFile?: string;
    webpack?: webpack.Configuration;
  },
  emitter: any
) {
  if (!config.buildWebpack) {
    throw new Error(
      `The '@angular-devkit/build-angular/plugins/karma' karma plugin is meant to` +
        ` be used from within Angular CLI and will not work correctly outside of it.`
    );
  }
  // const options = config.buildWebpack.options as BuildOptions;
  const logger: logging.Logger =
    config.buildWebpack.logger || createConsoleLogger();
  successCb = config.buildWebpack.successCb;
  failureCb = config.buildWebpack.failureCb;

  config.reporters?.unshift('@angular-devkit/build-angular--event-reporter');
  // todo 可能用不上,因为时本地
  // When using code-coverage, auto-add karma-coverage.
  // if (
  //   options!.codeCoverage &&
  //   !config.reporters.some((r: string) => r === 'coverage' || r === 'coverage-istanbul')
  // ) {
  //   config.reporters.push('coverage');
  // }

  // Add webpack config.
  const webpackConfig = config.buildWebpack
    .webpackConfig as webpack.Configuration;

  // Use existing config if any.
  config.webpack = { ...webpackConfig, ...config.webpack };

  // Our custom context and debug files list the webpack bundles directly instead of using
  // the karma files array.

  if (config.singleRun) {
    // There's no option to turn off file watching in webpack-dev-server, but
    // we can override the file watcher instead.
    (webpackConfig.plugins as any[]).unshift({
      apply: (compiler: any) => {
        compiler.hooks.afterEnvironment.tap('karma', () => {
          compiler.watchFileSystem = { watch: () => {} };
        });
      },
    });
  }
  webpackConfig.plugins!.push(
    new webpack.DefinePlugin({
      KARMA_CLIENT_CONFIG: JSON.stringify(config.client),
      KARMA_PORT: config.port,
    })
  );
  // Files need to be served from a custom path for Karma.
  const compiler = webpack.webpack(webpackConfig, (error, stats) => {
    if (error) {
      throw error;
    }

    if (stats?.hasErrors()) {
      // Only generate needed JSON stats and when needed.
      const statsJson = stats?.toJson({
        all: false,
        children: true,
        errors: true,
        warnings: true,
      });

      logger.error(JSON.stringify(statsJson));

      // Notify potential listeners of the compile error.
      emitter.emit('compile_error', {
        errors: statsJson.errors?.map((e) => e.message),
      });

      // Finish Karma run early in case of compilation error.
      emitter.emit('run_complete', [], { exitCode: 1 });

      // Emit a failure build event if there are compilation errors.
      failureCb();
      return;
    }
    // 仅测试时使用
    if (config.buildWebpack.testContext) {
      config.buildWebpack.testContext.buildSuccess(webpackConfig);
    }
  });

  function handler(callback?: () => void): void {
    isBlocked = true;
    callback?.();
  }

  compiler.hooks.invalid.tap('karma', () => handler(() => {}));
  compiler.hooks.watchRun.tapAsync('karma', (_: any, callback: () => void) =>
    handler(callback)
  );
  compiler.hooks.run.tapAsync('karma', (_: any, callback: () => void) =>
    handler(callback)
  );

  function unblock() {
    isBlocked = false;
    blocked.forEach((cb) => cb());
    blocked = [];
  }

  let lastCompilationHash: string | undefined;
  compiler.hooks.done.tap('karma', (stats) => {
    if (stats.hasErrors()) {
      lastCompilationHash = undefined;
    } else if (stats.hash != lastCompilationHash) {
      // Refresh karma only when there are no webpack errors, and if the compilation changed.
      lastCompilationHash = stats.hash;
      emitter.refreshFiles();
    }
    unblock();
  });

  emitter.on('exit', (done: any) => {
    done();
  });
}

init.$inject = ['config', 'emitter'];

// Block requests until the Webpack compilation is done.
function requestBlocker() {
  return function (_request: any, _response: any, next: () => void) {
    if (isBlocked) {
      blocked.push(next);
    } else {
      next();
    }
  };
}

// Copied from "karma-jasmine-diff-reporter" source code:
// In case, when multiple reporters are used in conjunction
// with initSourcemapReporter, they both will show repetitive log
// messages when displaying everything that supposed to write to terminal.
// So just suppress any logs from initSourcemapReporter by doing nothing on
// browser log, because it is an utility reporter,
// unless it's alone in the "reporters" option and base reporter is used.
function muteDuplicateReporterLogging(context: any, config: any) {
  context.writeCommonMsg = () => {};
  const reporterName = '@angular/cli';
  const hasTrailingReporters =
    config.reporters.slice(-1).pop() !== reporterName;

  if (hasTrailingReporters) {
    context.writeCommonMsg = () => {};
  }
}

// Emits builder events.
const eventReporter: any = function (
  this: any,
  baseReporterDecorator: any,
  config: any
) {
  baseReporterDecorator(this);

  muteDuplicateReporterLogging(this, config);

  this.onRunComplete = function (_browsers: any, results: any) {
    if (results.exitCode === 0) {
      successCb();
    } else {
      failureCb();
    }
  };

  // avoid duplicate failure message
  this.specFailure = () => {};
};

eventReporter.$inject = ['baseReporterDecorator', 'config'];

// When a request is not found in the karma server, try looking for it from the webpack server root.

export default {
  'framework:@angular-devkit/build-angular': ['factory', init],
  'reporter:@angular-devkit/build-angular--event-reporter': [
    'type',
    eventReporter,
  ],
};
