import { BuilderContext } from '@angular-devkit/architect';
import {
  BrowserBuilderOptions,
  ExecutionTransformer,
  executeBrowserBuilder,
  AssetPattern,
  KarmaBuilderOptions,
} from '@angular-devkit/build-angular';
import * as path from 'path';
import * as webpack from 'webpack';
import { PlatformType } from '../../src/builder/platform';

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
  name: 'test-builder:application',
  schemaPath: path.resolve(__dirname, 'schema.json'),
};
export const LIBRARY_BUILDER_INFO = {
  name: 'test-builder:library',
  schemaPath: path.resolve(__dirname, 'schema.library.json'),
};
export const KARMA_BUILDER_INFO = {
  name: 'test-builder:karma',
  schemaPath: path.resolve(__dirname, 'schema.karma.json'),
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
      input: 'src/styles.css',
      bundleName: 'app1',
      inject: false,
    },
  ],
  scripts: [],
  aot: true,
};
export const DEFAULT_ANGULAR_KARMA_CONFIG: KarmaBuilderOptions & {
  pages: AssetPattern[];

  components: AssetPattern[];
  platform: PlatformType;
} = {
  karmaConfig: 'karma.conf.js',
  main: 'src/test.ts',
  tsConfig: 'src/tsconfig.spec.json',
  watch: false,
  components: [
    {
      glob: '**/*.entry.ts',
      input: './src/spec-component',
      output: 'spec-component',
    },
  ],
  styles: [
    {
      input: 'src/styles.css',
      bundleName: 'app1',
      inject: false,
    },
  ],
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
  platform: PlatformType.wx,
  sourceMap: false,
  pages: [{ glob: '**/*.entry.ts', input: './src/spec', output: 'spec' }],
};
export const DEFAULT_ANGULAR_LIBRARY_CONFIG = {
  project: 'projects/test-library/ng-package.json',
  tsConfig: 'projects/test-library/tsconfig.lib.json',
};
