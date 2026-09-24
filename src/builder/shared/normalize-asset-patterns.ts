/**
 * `normalizeAssetPatterns` —— 本地实现，替代
 * `@angular-devkit/build-angular/src/utils` 的同名导出。
 *
 * ## 为什么本地实现
 *
 * 迁到 Vite 后，本仓库对 `@angular-devkit/build-angular` 的运行时依赖
 * 只剩这一个函数（其余是已本地化的 `AssetPattern` 类型）。只要还从
 * build-angular 引，它下面那一整串 webpack 生态就得留在 node_modules
 * （webpack / babel-loader / copy-webpack-plugin / css-loader / sass-loader /
 * less-loader / postcss-loader / mini-css-extract-plugin / source-map-loader /
 * webpack-dev-middleware / webpack-dev-server / @ngtools/webpack /
 * @angular-devkit/build-webpack …）。
 *
 * 而这个函数本身跟 webpack **完全无关** —— 只是把 `angular.json` 里的
 * `assets` 条目（字符串或对象）规整成 `{glob, input, output}` 对象，
 * 并做「不能写到输出目录之外」等校验。逻辑照抄 devkit 实现
 * （Angular CLI，MIT 许可）。
 *
 * 只依赖 node 内置模块。
 */
import assert from 'node:assert';
import { statSync } from 'node:fs';
import * as nodePath from 'node:path';

import type { AssetPattern, AssetPatternObject } from './asset-pattern';

export class MissingAssetSourceRootException extends Error {
  constructor(path: string) {
    super(`The ${path} asset path must start with the project source root.`);
  }
}

export function normalizeAssetPatterns(
  assetPatterns: AssetPattern[],
  workspaceRoot: string,
  projectRoot: string,
  projectSourceRoot: string | undefined,
): (AssetPatternObject & { output: string })[] {
  if (assetPatterns.length === 0) {
    return [];
  }

  // When sourceRoot is not available, we default to ${projectRoot}/src.
  const sourceRoot = projectSourceRoot || nodePath.join(projectRoot, 'src');
  const resolvedSourceRoot = nodePath.resolve(workspaceRoot, sourceRoot);

  return assetPatterns.map((assetPattern) => {
    // Normalize string asset patterns to objects.
    if (typeof assetPattern === 'string') {
      const assetPath = nodePath.normalize(assetPattern);
      const resolvedAssetPath = nodePath.resolve(workspaceRoot, assetPath);

      // Check if the string asset is within sourceRoot.
      if (!resolvedAssetPath.startsWith(resolvedSourceRoot)) {
        throw new MissingAssetSourceRootException(assetPattern);
      }

      let glob: string;
      let input: string;
      let isDirectory: boolean;
      try {
        isDirectory = statSync(resolvedAssetPath).isDirectory();
      } catch {
        isDirectory = true;
      }

      if (isDirectory) {
        // Folders get a recursive star glob.
        glob = '**/*';
        // Input directory is their original path.
        input = assetPath;
      } else {
        // Files are their own glob.
        glob = nodePath.basename(assetPath);
        // Input directory is their original dirname.
        input = nodePath.dirname(assetPath);
      }

      // Output directory for both is the relative path from source root to input.
      const output = nodePath.relative(
        resolvedSourceRoot,
        nodePath.resolve(workspaceRoot, input),
      );
      assetPattern = { glob, input, output };
    } else {
      const resolvedInput = nodePath.resolve(workspaceRoot, assetPattern.input);
      if (!resolvedInput.startsWith(workspaceRoot)) {
        throw new Error(
          `The ${assetPattern.input} asset path must be within the workspace root.`,
        );
      }
      assetPattern.output = nodePath.join('.', assetPattern.output ?? '');
    }

    assert(assetPattern.output !== undefined);

    if (assetPattern.output.startsWith('..')) {
      throw new Error(
        'An asset cannot be written to a location outside of the output path.',
      );
    }

    return assetPattern;
  });
}
