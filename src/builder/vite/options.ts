import * as path from 'path';
import {
  normalizeFileReplacementList,
  normalizeOptimizationOptions,
  normalizeSourceMapOptions,
} from '../util/angular-build-compat';

/**
 * 把 angular.json 里「一个选项多种写法」的字段归一成 builder 内部好用的形状。
 *
 * 单独成模块是为了可测：这些函数全是纯函数，跑一次几毫秒，
 * 不用起整条 vite 构建链路。归一规则本身尽量直接复用 @angular/build
 * 的实现（见 util/angular-build-compat），避免「同名不同义」。
 */

/** `optimization` 支持布尔和对象两种写法（上游 schema 就是 oneOf）。 */
export type OptimizationOption = boolean | Record<string, unknown>;
/** `sourceMap` 同上。 */
export type SourceMapOption =
  | boolean
  | {
      scripts?: boolean;
      styles?: boolean;
      hidden?: boolean;
      vendor?: boolean;
    };

export interface OptimizationFlags {
  /** 决定 vite 的 mode（production 才做 DCE / 去掉 ngDevMode 分支） */
  isProduction: boolean;
  minifyScripts: boolean;
  minifyStyles: boolean;
}

/**
 * `optimization` → 三个开关。
 *
 * 以前是 `!!options.optimization`，于是 `{ scripts: false }` 这种**对象写法
 * 恒为真** —— 想关压缩反而开了压缩。归一之后对象形态按子项取值。
 *
 * 未配置按 false 处理：本包 schema 里 optimization 默认就是 false
 * （上游默认 true，这里刻意不同，理由见 script/gen-builder-schema.ts）。
 */
export function resolveOptimization(
  optimization: OptimizationOption | undefined,
): OptimizationFlags {
  if (optimization === undefined || optimization === false) {
    return { isProduction: false, minifyScripts: false, minifyStyles: false };
  }
  const normalized = normalizeOptimizationOptions(
    optimization === true ? true : (optimization as never),
  );
  return {
    isProduction: true,
    minifyScripts: !!normalized.scripts,
    minifyStyles: !!normalized.styles.minify,
  };
}

/**
 * `sourceMap` → vite 的 `build.sourcemap`。
 *
 * vite 只有一个总开关（boolean | 'hidden'），Angular 那边是 scripts / styles /
 * hidden / vendor 四项，取并集：任一要 map 就出 map，`hidden` 优先。
 */
export function resolveSourcemap(
  sourceMap: SourceMapOption | undefined,
): boolean | 'hidden' {
  const normalized = normalizeSourceMapOptions(
    (sourceMap ?? false) as never,
  );
  if (normalized.hidden) {
    return 'hidden';
  }
  return !!(normalized.scripts || normalized.styles);
}

export type OutputHashing = 'none' | 'all' | 'media' | 'bundles';

export interface OutputNames {
  chunkFileNames: string;
  assetFileNames: string;
}

/**
 * `outputHashing` → rollup 的文件名模板。
 *
 * 以前 `chunkFileNames` 写死 `[name]-[hash].js`，schema 里那句
 * `"outputHashing": "none"` 是假的。小程序产物没有 HTTP 缓存，hash 本来
 * 就没意义（还让路径变长），所以默认（none）就是不带 hash。
 */
export function resolveOutputNames(outputHashing?: OutputHashing): OutputNames {
  const hashChunks = outputHashing === 'all' || outputHashing === 'bundles';
  const hashAssets = outputHashing === 'all' || outputHashing === 'media';
  return {
    chunkFileNames: hashChunks ? '[name]-[hash].js' : '[name].js',
    assetFileNames: hashAssets ? '[name]-[hash].[ext]' : '[name].[ext]',
  };
}

/**
 * `externalDependencies` 的匹配规则跟 @angular/build 一致：
 * `@foo/bar` 连 `@foo/bar/baz` 一起算外部。
 */
export function isExternalSpecifier(
  id: string,
  externalDependencies: string[],
): boolean {
  return externalDependencies.some(
    (name) => id === name || id.startsWith(`${name}/`),
  );
}

/**
 * define 合并顺序：用户的在前，平台的在后。
 *
 * `global` / `window` / `wx` / `ngDevMode` 这些是运行时能不能跑的关键，
 * 用户配同名 key 也不能把它们换掉。
 */
export function mergeDefine(
  userDefine: Record<string, string> | undefined,
  ...platformDefines: Record<string, string>[]
): Record<string, string> {
  return Object.assign({}, userDefine, ...platformDefines);
}

/**
 * `stylePreprocessorOptions` → vite 的 `css.preprocessorOptions`。
 *
 * `includePaths` 相对 workspaceRoot；上游的 `sass.fatalDeprecations` 等
 * 子项直接透传给 sass（scss / sass 两种语法都吃同一套 sass 选项）。
 */
export function resolveCssPreprocessorOptions(
  stylePreprocessorOptions:
    | { includePaths?: string[]; sass?: Record<string, unknown> }
    | undefined,
  workspaceRoot: string,
): Record<string, Record<string, unknown>> {
  const includePaths = stylePreprocessorOptions?.includePaths?.length
    ? stylePreprocessorOptions.includePaths.map((include) =>
        path.resolve(workspaceRoot, include),
      )
    : undefined;
  const sass = stylePreprocessorOptions?.sass;
  if (!includePaths && !sass) {
    return {};
  }
  const perLanguage = { ...(sass ?? {}), ...(includePaths ? { includePaths } : {}) };
  return { scss: perLanguage, sass: perLanguage };
}

/**
 * `fileReplacements` → 绝对路径的 `{replace, with}`。
 *
 * 交给 @angular-devkit 的实现：它同时认 `replace/with` 和老的
 * `src/replaceWith` 两种写法，并且会校验两边文件都存在 —— 路径写错时
 * 当场报错，比让替换静默不生效好查。
 */
export function toAbsoluteFileReplacements(
  fileReplacements:
    | { replace?: string; with?: string; src?: string; replaceWith?: string }[]
    | undefined,
  workspaceRoot: string,
): { replace: string; with: string }[] {
  if (!fileReplacements?.length) {
    return [];
  }
  return normalizeFileReplacementList(fileReplacements as never, workspaceRoot);
}
