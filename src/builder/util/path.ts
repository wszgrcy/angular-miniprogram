import {
  NormalizedRoot,
  type Path,
  getSystemPath,
  normalize,
} from '@angular-devkit/core';
import isRelative from 'is-relative';
import normalizePath from 'normalize-path';
import * as path from 'path';

/**
 * 路径的统一词汇表（本仓库唯一的路径工具模块）。
 *
 * 一条路径在这条构建链上同时存在四种形态，混用会静默失配（比较失配不抛错，只会让匹配集合变空）：
 *
 * | 来源 | 形态 |
 * | ---- | ---- |
 * | vite / rolldown 的 module id | `C:/a/b.ts`（盘符大小写不保证） |
 * | TS 的 `sourceFile.fileName` | `C:/a/b.ts` |
 * | devkit 的 `Path` | `/C:/a/b.ts`（多一个前导斜杠） |
 * | `path.resolve` / `join` / `normalize` | `C:\a\b.ts`（反斜杠） |
 *
 * 用哪个：
 *
 * | 要做什么 | 用什么 |
 * | -------- | ------ |
 * | 把路径交给别人去比（第三方插件、`fs`、写进产物字符串） | `toPosix` |
 * | 我们自己比、当 Map key、拼复合 key | `pathKey` |
 * | 判断 a 是不是在 b 目录里 | `isPathIn` |
 * | 算产物相对路径 | `relativePosix` |
 * | 进产物的相对路径（`require('./x')`、app.json 的 pages） | `toPosixPath` |
 * | 写进产物的模块说明符 | `toModuleSpecifier` |
 * | 真的读写盘 | `toNativePath` / `resolveNative` |
 *
 * 底下分三层，各管一段，本模块是唯一出口：
 *
 *  - `normalize-path`：真实路径的分隔符归一（`toPosix` 及由它派生的那几个）。
 *  - `is-relative`：相对 / 绝对判定（`isAbsoluteish`），认得盘符与 UNC。
 *  - `@angular-devkit/core`：Host（virtual fs）那套路径的形态与身份，
 *    即 `pathKey` / `toNativePath`——`/C:/x` 这种 posix 化绝对路径只有它认得。
 *
 * Linux/macOS 上除了盘符那条，这里所有函数都是恒等变换。
 */

/* ------------------------------------------------------------------ *
 * 一、形态转换
 * ------------------------------------------------------------------ */

/**
 * 只翻分隔符：`C:\a\b` -> `C:/a/b`。绝对性、盘符大小写、前导斜杠都不动。
 * 自己比的时候用 `pathKey`，别用它。
 *
 * `stripTrailing=false`：尾分隔符是不是要留由调用方决定，这里只负责分隔符本身
 * （顺带把 `a//b` 这类重斜杠并掉）。
 */
export function toPosix(p: string): string {
  return normalizePath(p, false);
}

/**
 * 是不是绝对路径——含当前平台原生绝对、Windows 盘符、UNC，
 * 以及 devkit posix 化的 `/C:/x`（开头那个斜杠就够它判绝对了）。
 */
export function isAbsoluteish(p: string): boolean {
  return !isRelative(p);
}

/**
 * 转成当前系统原生的绝对路径字符串，完全走 devkit 的 normalize + getSystemPath，
 * 对 `C:\\x` / `C:/x` / `/C:/x` 三种输入都能收敛到 `C:\\x`。
 */
export function toNativePath(p: string | Path): string {
  return path.resolve(getSystemPath(normalize(p as string)));
}

/**
 * 拉成绝对 posix 形态：`C:\a\b` / `/C/a/b` / `./b` -> `C:/a/b`。
 * 这是 vite / rollup 里 module id 的形态。`pathKey` 的产物开头多一个斜杠，
 * node 的 `path` / `fs` 不认，要变回可用路径就走这里。
 */
export function toAbsolutePosix(p: string): string {
  return toPosix(toNativePath(p));
}

/**
 * 以 base 为基准把 p 解析成原生绝对路径。p 已经是绝对的就直接归一后用它，
 * 否则相对 base 解析。
 */
export function resolveNative(base: string | Path, p: string | Path): string {
  const pStr = p as string;
  if (isAbsoluteish(pStr)) {
    return toNativePath(pStr);
  }
  return path.resolve(toNativePath(base), pStr);
}

/**
 * 产物路径统一成 posix 正斜杠形式。这些路径会进 JS 字符串字面量和小程序的模块解析，
 * 两处都只认 `/`（反斜杠会被当成转义吃掉）。顺带剥掉前导 `/`，rollup 的 emitFile 不接受绝对路径。
 */
export function toPosixPath(p: string): string {
  return toPosix(p).replace(/^\/+/, '').replace(/^\.\//, '');
}

/**
 * 模块说明符形态：posix + 去前导 `./`。与 `toPosixPath` 的区别是不剥前导 `/`，
 * 剥掉绝对说明符就被当成裸模块名。
 */
export function toModuleSpecifier(p: string): string {
  return toPosix(p).replace(/^\.\//, '');
}

/**
 * 相对路径 + posix。相对计算本身只有 `path.relative` 会做，
 * 归一交给 `normalize-path`（Windows 上它给的是反斜杠）。
 */
export function relativePosix(from: string, to: string): string {
  return normalizePath(path.relative(from, to));
}

/* ------------------------------------------------------------------ *
 * 二、身份归一与比较
 * ------------------------------------------------------------------ */

/**
 * 身份归一：用来比较、当 Map / Set key、拼复合 key 的路径一律先过这里。
 * 直接拿 devkit 的 `normalize()` 当尺，分隔符、盘符大小写、`.` / `..`、重斜杠、尾斜杠一次搞定。
 * 盘符大小写必须归一：`sourceRoot` 与 bundler 回传的 module id 不保证一致，前缀匹配是大小写敏感的。
 *
 * 两个禁区：
 *  1. 不要拿结果去和别人的路径比，也别当模块 id 返回（同一个文件会以两种形态进模块图）。
 *  2. 不要过虚拟模块 id（`\0...`、带 `?query` 的 id），先脱壳再归一。
 */
export function pathKey(p: string): string {
  return normalize(p) as string;
}

/** 两个路径是不是同一个（形态、盘符大小写、`.` / `..`、尾斜杠都不敏感）。 */
export function isSamePath(a: string, b: string): boolean {
  return pathKey(a) === pathKey(b);
}

/** `child` 是不是 `parent` 本身或在其目录内。按整段对齐，所以 `src/a` 不会命中 `src/ab`。 */
export function isPathIn(parent: string, child: string): boolean {
  const p = pathKey(parent);
  const c = pathKey(child);
  return c === p || c.startsWith(`${p === NormalizedRoot ? '' : p}/`);
}

/** `child` 相对 `parent` 的那一段（posix、无前导 `./`），不在其内返回 undefined。 */
export function stripPathPrefix(
  parent: string,
  child: string,
): string | undefined {
  const p = pathKey(parent);
  const c = pathKey(child);
  if (c === p) {
    return '';
  }
  const prefix = p === NormalizedRoot ? '' : p;
  return c.startsWith(`${prefix}/`) ? c.slice(prefix.length + 1) : undefined;
}
