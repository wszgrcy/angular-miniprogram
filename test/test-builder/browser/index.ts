import { BuilderContext } from '@angular-devkit/architect';
import {
  BrowserBuilderOptions,
  executeBrowserBuilder,
  ExecutionTransformer,
} from '@angular-devkit/build-angular';
import * as webpack from 'webpack';
import * as path from 'path';
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
    {
      glob: '**/*.entry.json',
      input: './src',
      output: './',
    },
  ],
  components: [
    { glob: '**/*.entry.ts', input: './src/components', output: 'components' },
  ],
  pages: [{ glob: '**/*.entry.ts', input: './src/pages', output: 'pages' }],
  styles: ['src/styles.css'],
  scripts: [],
  aot: true,
};
