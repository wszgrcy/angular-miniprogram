import type { AssetPattern } from '@angular-devkit/build-angular';
import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils';
import type { Path } from '@angular-devkit/core';
import { toNativePath } from '../util/path';

/**
 * `normalizeAssetPatterns` 的 Windows 安全包装。
 *
 * devkit 内部用 `node:path` 校验：`path.resolve(workspaceRoot, input).startsWith(workspaceRoot)`。
 * 在 Windows 上 `resolve` 产出反斜杠，而我们手上的是 devkit 的 `Path`（posix 正斜杠），
 * 于是 `startsWith` 为 false，抛 "asset path must be within the workspace root"。
 * 三个路径参数都得先转成原生形式，让两边分隔符一致。
 *
 * 这个包装不在 `util/path.ts` 里：`@angular-devkit/build-angular/src/utils` 是个 barrel，
 * 顺着它能摸到只在 node 里跑得起来的包；而 `util/path.ts` 会被打进小程序侧的 vitest 运行时。
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
