import * as path from 'path';
import {
  normalizeFileReplacementList,
  normalizeOptimizationOptions,
  normalizeSourceMapOptions,
} from '../util/angular-build-compat';
import { toPosix } from '../util/path';

/**
 * 把 angular.json 里「一个选项多种写法」的字段归一成 builder 内部好用的形状。
 * 单独成模块是为了可测；归一规则尽量复用 @angular/build 的实现，避免同名不同义。
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
 * `optimization` → 三个开关。对象形态按子项取值。
 * 未配置按 false 处理：本包 schema 里 optimization 默认就是 false。
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
 * `sourceMap` → vite 的 `build.sourcemap`。vite 只有一个总开关，Angular 那边是四项，
 * 取并集：任一要 map 就出 map，`hidden` 优先。
 */
export function resolveSourcemap(
  sourceMap: SourceMapOption | undefined,
): boolean | 'hidden' {
  const normalized = normalizeSourceMapOptions((sourceMap ?? false) as never);
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
 * `outputHashing` → rollup 的文件名模板。小程序产物没有 HTTP 缓存，hash 本来就没意义，
 * 所以默认（none）就是不带 hash。
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
  const perLanguage = {
    ...(sass ?? {}),
    ...(includePaths ? { includePaths } : {}),
  };
  return { scss: perLanguage, sass: perLanguage };
}

/**
 * `fileReplacements` → 绝对路径的 `{replace, with}`。
 *
 * 交给 @angular-devkit 的实现：它同时认 `replace/with` 和老的
 * `src/replaceWith` 两种写法，并且会校验两边文件都存在 —— 路径写错时
 * 当场报错，比让替换静默不生效好查。
 *
 * 拿到结果后再把两侧统一成 posix 绝对路径（`C:/a/b.ts`），因为下游两个
 * 消费方比的都是 posix 形态的文件名：
 *
 *  - analog 的 `replaceFiles` 插件用 `resolvedId.endsWith(replace)` 匹配，
 *    而 vite 解析出的 id 在 Windows 上是 `C:/a/b.ts`；devkit 只做了
 *    `path.join(workspaceRoot, x)`，Windows 上得到 `C:\a\b.ts`，`endsWith`
 *    永不命中——**替换静默失效**，生产构建拿着 dev 的 environment 上线。
 *  - 同一个数组里 wxs-strip push 进来的替换项已经是 `toPosix()` 过的，
 *    两边必须同一个口径，否则同一批数据两种形状。
 *
 * Linux/macOS 上 `toPosix` 是恒等变换，行为不变。
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
  return normalizeFileReplacementList(
    fileReplacements as never,
    workspaceRoot,
  ).map((item) => ({
    replace: toPosix(path.resolve(item.replace)),
    with: toPosix(path.resolve(item.with)),
  }));
}
