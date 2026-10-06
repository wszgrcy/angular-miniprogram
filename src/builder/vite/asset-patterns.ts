import type { AssetPattern } from '@angular-devkit/build-angular';
import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils';
import type { Path } from '@angular-devkit/core';
import { toNativePath } from '../util/path';

/**
 * `normalizeAssetPatterns` 的 Windows 安全包装。
 *
 * devkit 内部是这么校验的：
 *
 *   const resolvedInput = path.resolve(workspaceRoot, assetPattern.input);
 *   if (!resolvedInput.startsWith(workspaceRoot)) { throw ... }
 *
 * 它用的是 `node:path`——在 Windows 上 `resolve` 产出**反斜杠**。
 * 而我们手上的是 devkit 的 `Path`，是 **posix 正斜杠**。
 * 于是：
 *
 *   workspaceRoot : C:/code/proj/test-host-1234
 *   resolvedInput : C:\code\proj\test-host-1234\src\pages
 *   startsWith    -> false  -> 抛 "asset path must be within the workspace root"
 *
 * 直接把 devkit Path 传进去，Windows 上必炸。三个路径参数都得先转成
 * 原生形式，让 `resolve` 和 `startsWith` 两边分隔符一致。
 *
 * 真实 Angular CLI 不炸是因为它传的是 `BuilderContext.workspaceRoot`
 * （原生 string，Windows 下本来就带反斜杠），我们这边多绕了一层
 * devkit `normalize()` 才踩进去的。
 *
 * ## 为什么它不在 `util/path.ts` 里
 *
 * `@angular-devkit/build-angular/src/utils` 是个 barrel，顺着它能摸到
 * `@angular/build` 的 dev-server（连带 `@vitejs/plugin-basic-ssl` 那种
 * 只在 node 里跑得起来的包）。而 `util/path.ts` 会被打进**小程序侧**的
 * vitest 运行时，那边一 require 这个 barrel 就是整条 devkit 构建链进包，
 * 打包直接炸。所以这个包装只能待在构建器侧。
 */
export function normalizeAssetPatternsSafe(
  assetPatterns: AssetPattern[],
  workspaceRoot: string | Path,
  projectRoot: string | Path,
  projectSourceRoot: (string | Path) | undefined,
) {
  return normalizeAssetPatterns(
    assetPatterns,
    toNativePath(workspaceRoot),
    toNativePath(projectRoot),
    projectSourceRoot === undefined
      ? undefined
      : toNativePath(projectSourceRoot),
  );
}
