import type { AssetPattern } from '@angular-devkit/build-angular';
import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils';
import { type Path, getSystemPath, normalize } from '@angular-devkit/core';
import * as path from 'path';

/**
 * 剥掉 devkit posix 化 Windows 路径的前导斜杠。
 *
 * devkit 的 `Path` 是 posix 风格，Windows 路径会被写成 `/C:/code/...`。
 * 这在 win32 语义下是「**无盘符的绝对路径**」，一旦过
 * `path.resolve(workspaceRoot, x)`，会被当成相对当前盘重新拼，
 * 出来就是双盘符：
 *
 *   resolve('C:/code/proj/host',
 *           '/C:/code/proj/host/src/tsconfig.spec.json')
 *     => 'C:\C:\code\proj\host\src\tsconfig.spec.json'
 *
 * 把盘符前的斜杠去掉，它就变回 win32 认的真绝对路径。
 * 普通 unix 路径（`/workspace/...`）不匹配这个模式，不受影响。
 */
export function stripPosixDrivePrefix(p: string): string {
  return p.replace(/^[/\\]?([a-zA-Z]:[/\\])/, '$1');
}

/**
 * 转成**当前系统原生的绝对路径**字符串。
 *
 * 注意顺序：必须**先判绝对，再考虑 devkit normalize**。
 *
 * 如果先跑 devkit `normalize()`，它用 posix 语义，会把 `C:/x` 当成相对
 * 路径又补一个前导 `/` 变回 `/C:/x`，经 `getSystemPath` 后成为无盘符
 * 绝对路径，最后 `path.resolve` 再补一次盘——双盘符又回来了。
 * 所以绝对路径要短路，不进 normalize。
 *
 * 三步：
 * 1. `stripPosixDrivePrefix`：`/C:/x` -> `C:/x`，让 win32 认它是带盘符
 *    的绝对路径。普通 unix 路径不匹配此模式，原样过去。
 * 2. 已是当前平台认得的绝对路径 -> 直接 `path.resolve`，**不走 devkit
 *    normalize**（见上）。
 * 3. 否则才走 `getSystemPath(normalize(...))` + `resolve`，把 devkit Path
 *    / 相对路径统一拉成绝对原生路径。devkit `normalize('./x')` 会给个
 *    相对的 `x`，而 `resolve('x', './src/pages')` 是 `<cwd>/x/src/pages`，
 *    `startsWith('x')` 仍为 false，所以绝对化是必要的。
 */
export function toNativePath(p: string | Path): string {
  const stripped = stripPosixDrivePrefix(p as string);
  if (path.isAbsolute(stripped)) {
    return path.resolve(stripped);
  }
  return path.resolve(getSystemPath(normalize(stripped)));
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
