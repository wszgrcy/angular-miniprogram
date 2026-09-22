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
/** devkit posix 化的 Windows 绝对路径，如 `/C:/code/x` */
const POSIXIFIED_WIN_ABS = /^[/\\]?([a-zA-Z]:[/\\])/;

/**
 * 是不是「绝对路径」——含当前平台原生绝对，以及 devkit posix 化的
 * `/C:/x`（win32 下它是无盘符绝对路径，posix 下它不是绝对）。
 */
export function isAbsoluteish(p: string): boolean {
  return path.isAbsolute(p) || POSIXIFIED_WIN_ABS.test(p);
}

/**
 * 转成**当前系统原生的绝对路径**字符串。
 *
 * 完全走 devkit 自己的转换，不要自己写正则猜形态：
 *
 *   normalize('C:\\code\\x')  ->  '/C:/code/x'   （path.js 显式把
 *                                                  `^[A-Z]:[/\\]` 转成
 *                                                  `/C:/...` 的 posix 形态）
 *   getSystemPath('/C:/code/x') ->  'C:\\code\\x'  （asWindowsPath 里
 *                                                    `/^(\\/(\\w)(?:\\/(.*))?$/`
 *                                                    把盘符还原回开头）
 *
 * 所以 normalize + getSystemPath 这一对，对
 * `C:\\x` / `C:/x` / `/C:/x` 三种输入都能收敛到 `C:\\x`。
 */
export function toNativePath(p: string | Path): string {
  return path.resolve(getSystemPath(normalize(p as string)));
}

/**
 * 以 base 为基准把 p 解析成原生绝对路径。
 *
 * p 已经是绝对的（含 /C:/x 形态）就直接归一后用它，
 * 否则相对 base 解析——不能直接 path.resolve(p)，那样会落到
 * process.cwd() 而不是 base。
 */
export function resolveNative(base: string | Path, p: string | Path): string {
  const pStr = p as string;
  if (isAbsoluteish(pStr)) {
    return toNativePath(pStr);
  }
  return path.resolve(toNativePath(base), pStr);
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
