import * as path from 'path';
import { PlatformType } from '../../src/builder/platform';
import type { AssetPattern } from '../../src/builder/shared/asset-pattern';

/**
 * `DEFAULT_ANGULAR_KARMA_CONFIG` 用到的 karma 选项子集。
 *
 * 原本标的是 `@angular-devkit/build-angular` 的 `KarmaBuilderOptions`，
 * 但迁 Vite 后本仓库已不再依赖该包（它是把整串 webpack 生态拖进
 * node_modules 的唯一入口）。而且消费方（`karma/vite/build.spec.ts`）
 * 拿到后立刻 `as KarmaViteBuilderOptions` 转掉，这里的类型只是
 * 供字面量自检，所以只声明真正用到的字段。
 */
interface KarmaConfigFields {
  karmaConfig: string;
  main: string;
  tsConfig: string;
  watch: boolean;
  styles: unknown[];
  assets: AssetPattern[];
  sourceMap: boolean;
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
export const DEFAULT_ANGULAR_KARMA_CONFIG: KarmaConfigFields & {
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
