import { BuilderContext } from '@angular-devkit/architect';
import {
  BrowserBuilderOptions,
  ExecutionTransformer,
  executeBrowserBuilder,
} from '@angular-devkit/build-angular';
import * as path from 'path';
import * as webpack from 'webpack';

export type CustomWebpackBrowserSchema = BrowserBuilderOptions;

export function buildWebpackBrowserGenerate(
  webpackConfiguration: (
    options: BrowserBuilderOptions,
    context: BuilderContext
  ) => ExecutionTransformer<webpack.Configuration>
) {
  return (
    options: CustomWebpackBrowserSchema,
    context: BuilderContext
  ): ReturnType<typeof executeBrowserBuilder> => {
    return executeBrowserBuilder(options, context, {
      webpackConfiguration: webpackConfiguration(options, context),
    });
  };
}

export const BROWSER_BUILDER_INFO = {
  name: 'test-builder:browser',
  schemaPath: path.resolve(__dirname, 'schema.json'),
};
export const LIBRARY_BUILDER_INFO = {
  name: 'test-builder:library',
  schemaPath: path.resolve(__dirname, 'schema.json'),
};

export const DEFAULT_ANGULAR_CONFIG = {
  outputPath: 'dist/testProject',
  index: '',
  main: 'src/main.ts',
  polyfills: '',
  tsConfig: 'src/tsconfig.app.json',
  progress: false,
  assets: [
    {
      glob: 'project.config.json',
      input: './src',
      output: './',
    },
    {
      glob: 'app.json',
      input: './src',
      output: './',
    },
  ],
  components: [
    { glob: '**/*.entry.ts', input: './src/components', output: 'components' },
  ],
  pages: [{ glob: '**/*.entry.ts', input: './src/pages', output: 'pages' }],
  styles: [
    {
      input: 'src/app.css',
      bundleName: 'app',
      inject: false,
    },
  ],
  scripts: [],
  aot: true,
};

export const DEFAULT_ANGULAR_LIBRARY_CONFIG = {
  project: 'projects/test-library/ng-package.json',
  tsConfig: 'projects/test-library/tsconfig.lib.json',
};
