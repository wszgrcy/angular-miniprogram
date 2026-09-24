/**
 * `AssetPattern` —— 本地定义，替代 `@angular-devkit/build-angular` 的类型导入。
 *
 * ## 为什么本地定义
 *
 * 本仓库迁到 Vite 后，对 `@angular-devkit/build-angular` 的**唯一**用法就是
 * `import type { AssetPattern }`（6 个文件，全是类型）。而这个包是把整个
 * webpack 生态（webpack + babel-loader / copy-webpack-plugin / css-loader /
 * less-loader / mini-css-extract-plugin / postcss-loader / sass-loader /
 * source-map-loader / webpack-dev-middleware / webpack-dev-server /
 * @ngtools/webpack / @angular-devkit/build-webpack 等）拖进 node_modules
 * 的**唯一入口**。
 *
 * 类型导入不产生运行时依赖，所以把它本地化之后就能彻底移除
 * `@angular-devkit/build-angular`，连带清掉它下面那一整串 webpack 包。
 *
 * 结构照抄本仓库 `src/builder/vite/schema.json` 里的 `assetPattern`
 * 定义（`oneOf: [object, string]`），与 devkit 一致。
 */
export interface AssetPatternObject {
  /** The pattern to match. */
  glob: string;
  /** The input directory path in which to apply `glob`. Defaults to the project root. */
  input: string;
  /** Absolute path within the output. */
  output: string;
  /** An array of globs to ignore. */
  ignore?: string[];
  /**
   * Allow glob patterns to follow symlink directories. This allows
   * subdirectories of the symlink to be searched.
   */
  followSymlinks?: boolean;
}

export type AssetPattern = AssetPatternObject | string;
