import type { AssetPattern } from '@angular-devkit/build-angular';
import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils';
import { type Path, getSystemPath, normalize } from '@angular-devkit/core';
import * as path from 'path';

/**
 * 转成**当前系统原生的绝对路径**字符串。
 *
 * 两步缺一不可：
 * 1. `getSystemPath(normalize(...))`：devkit Path 是 posix 正斜杠，
 *    Windows 上要换成 `\`，否则跟 `node:path.resolve` 的产出对不上。
 * 2. `path.resolve(...)`：拿成绝对。devkit `normalize('./x')` 会给你
 *    个相对的 `x`，而 `path.resolve('x', './src/pages')` 是
 *    `<cwd>/x/src/pages`，`startsWith('x')` 仍为 false。
 *
 * 实际上传进来的 workspaceRoot / projectRoot / sourceRoot 都应该是绝对的，
 * 这里兼一下把契约收紧：进什么都出绝对原生路径。
 */
export function toNativePath(p: string | Path): string {
  return path.resolve(getSystemPath(normalize(p as string)));
}

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
 */
export function normalizeAssetPatternsSafe(
  assetPatterns: AssetPattern[],
  workspaceRoot: string | Path,
  projectRoot: string | Path,
  projectSourceRoot: (string | Path) | undefined
) {
  return normalizeAssetPatterns(
    assetPatterns,
    toNativePath(workspaceRoot),
    toNativePath(projectRoot),
    projectSourceRoot === undefined
      ? undefined
      : toNativePath(projectSourceRoot)
  );
}
