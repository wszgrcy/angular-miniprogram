import {
  NormalizedRoot,
  type Path,
  getSystemPath,
  normalize,
} from '@angular-devkit/core';
import * as path from 'path';

/**
 * 路径的统一词汇表（本仓库**唯一**的路径工具模块）。
 *
 * ## 为什么要有这个文件
 *
 * 一条路径在这条构建链上同时存在**四种形态**，混用就会静默失配。Windows 实测：
 *
 * | 来源 | 形态 |
 * | ---- | ---- |
 * | vite / rolldown 的 module id | `C:/a/b.ts`（正斜杠；盘符大小写取决于解析入口，不保证） |
 * | TS 的 `sourceFile.fileName` | `C:/a/b.ts`（正斜杠） |
 * | devkit 的 `Path` | `/C:/a/b.ts`（posix 化，多一个前导斜杠） |
 * | `path.resolve` / `join` / `normalize` | `C:\a\b.ts`（反斜杠） |
 *
 * 「静默」是这里最贵的一点：路径比较失配不会抛错，只会让匹配集合变空 ——
 * 于是 `fileReplacements` 不生效（生产构建拿着 dev 的 environment 上线）、
 * 分包 chunk 不再归位、组件查不到自己的样式、产物里的 `require` 路径被
 * JS 转义吃掉。历史上已经为此单独修过好几次（`f36f671` 产物路径统一 posix、
 * `98a3f96` 分包归属统一盘符大小写），每次都是新代码又抄一份本地 `toPosix`，
 * 各修各的那一处 —— 本模块存在的意义就是把那把尺收成一把。
 *
 * ## 用哪个
 *
 * | 要做什么 | 用什么 |
 * | -------- | ------ |
 * | 把路径交给**别人**去比（第三方插件的 `endsWith`、`fs`、写进产物字符串） | `toPosix` —— 只翻分隔符，别动盘符大小写，否则和 vite 给的 id 对不上 |
 * | **我们自己**比、存 Map key、拼复合 key | `pathKey` —— 直接拿 devkit `normalize()` 当尺 |
 * | 判断 a 是不是在 b 目录里 | `isPathIn`（按段对齐，不会让 `src/a` 命中 `src/ab`） |
 * | 算产物相对路径 | `relativePosix` |
 * | 进产物的相对路径（`require('./x')`、`app.json` 的 pages、rollup `emitFile`） | `toPosixPath`（额外剥前导 `/`） |
 * | 写进产物的模块说明符 | `toModuleSpecifier`（剥 `./`，保留前导 `/`） |
 * | 真的读写盘、或喂给只认原生路径的 devkit 内部函数 | `toNativePath` / `resolveNative` |
 *
 * ## 底下就是 devkit 的路径层，不是又一套
 *
 * `@angular-devkit/core` 自带一套完整的路径 API（`normalize` / `join` /
 * `relative` / `getSystemPath` / `asPosixPath` / `asWindowsPath`），它的
 * `normalize()` 已经把「分隔符 + 盘符大小写 + `.` / `..` / 重斜杠 / 尾斜杠」
 * 全归了，本仓库本来就处处在用 devkit 的 `Path`。所以：
 *
 *  - `pathKey` = devkit `normalize()`（身份形态 `/C:/a/b`，盘符统大写）
 *  - `toNativePath` = `path.resolve(getSystemPath(normalize(p)))`
 *
 * 本模块只补 devkit **给不了**的那几样：vite 要的 `C:/a/b` 形态（devkit 的
 * posix 形态是 `/C:/a/b`，开头多一个斜杠）、产物相对路径、以及按段对齐的
 * 目录包含判定。
 *
 * Linux/macOS 上除了盘符那条，这里所有函数都是恒等变换，行为不变。
 */

/* ------------------------------------------------------------------ *
 * 一、形态转换
 * ------------------------------------------------------------------ */

/**
 * 只翻分隔符：`C:\a\b` -> `C:/a/b`。
 *
 * 绝对性、盘符大小写、前导斜杠都不动 —— 给「对端也有一份路径、对方自己比」
 * 的场合用（第三方插件、`fs`、产物字符串）。
 * 自己比的时候别用它，用 `pathKey`。
 */
export function toPosix(p: string): string {
  return p.replace(/\\/g, '/');
}

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
 * 拉成**绝对 posix** 形态：`C:\a\b` / `/C/a/b` / `./b` -> `C:/a/b`。
 *
 * 这是 vite / rollup 里 module id 的形态，也是 `fileReplacements` 里该写的
 * 形态。`pathKey` 的产物（`/C/a/b`）不能直接拿来用 —— 那是身份令牌，
 * 开头多一个斜杠，node 的 `path` / `fs` 不认；要变回可用路径就走这里
 * （内部用 devkit 自己的 `getSystemPath` 还原盘符）。
 */
export function toAbsolutePosix(p: string): string {
  return toPosix(toNativePath(p));
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
 * 产物路径统一成 posix 正斜杠形式。
 *
 * **必须做，不是洁癖。** 这些路径最终会进两个只认 `/` 的地方：
 *
 * 1. **JS 字符串字面量**。app.js 里生成 `require('./components\c\x.js')`，
 *    `\c` 在 JS 里是无效转义，会被吃成 `c`，路径直接变成
 *    `./componentscxs.js`，运行时找不到模块。
 * 2. **小程序自己的模块解析 / wxml 的 src 引用**，一律正斜杠。
 *
 * 而 `path.join` 在 Windows 上产出的是反斜杠，所以凡是
 * 「参与产物命名」的路径都要过这个函数。
 *
 * 顺带剥掉前导 `/`——rollup 的 emitFile fileName 不接受绝对路径。
 */
export function toPosixPath(p: string): string {
  return toPosix(p).replace(/^\/+/, '').replace(/^\.\//, '');
}

/**
 * 模块说明符形态：posix + 去前导 `./`。
 *
 * 用于「写进产物的相对说明符」与「按后缀反查的模块 key」。
 * 与 `toPosixPath` 的区别：这里**不剥前导 `/`**（绝对说明符得留着开头的 `/`，
 * 剥掉就被当成裸模块名，解析不到）。
 */
export function toModuleSpecifier(p: string): string {
  return toPosix(p).replace(/^\.\//, '');
}

/**
 * 相对路径 + posix。
 *
 * `path.relative` 在 Windows 上产出反斜杠，直接拿去当 key / 写进产物就错，
 * 所以必须再 `split(path.sep).join('/')` 一次 —— 这个尾巴很容易忘，包一层。
 */
export function relativePosix(from: string, to: string): string {
  return toPosix(path.relative(from, to));
}

/* ------------------------------------------------------------------ *
 * 二、身份归一与比较
 * ------------------------------------------------------------------ */

/**
 * **身份归一**：用来比较、当 Map / Set key、拼复合 key 的路径一律先过这里。
 *
 * 直接拿 devkit 的 `normalize()` 当尺，不自己写正则：它把
 * `C:\a` / `C:/a` / `c:/a` / `/C:/a` / `C:/a/./x/..` / `C://a//` 全归成同一个
 * `/C:/a`（分隔符、盘符大小写、`.` / `..` / 重斜杠 / 尾斜杠一次搞定），
 * 而且带缓存。本仓库已经处处在用 devkit 的 `Path`，再手开一套只会又多一把尺。
 *
 * 盘符大小写这一条是必须的：`sourceRoot` 走 `getSystemPath()` 拿到的是
 * `C:\...`，而 bundler 回传的 module id 盘符大小写不保证一致，前缀匹配是
 * 大小写敏感的，一旦不一致整批静默失配（见 `98a3f96`）。
 *
 * **两个禁区**：
 *  1. 不要拿 `pathKey` 的结果去和**别人**的路径比（第三方插件的 `endsWith`）——
 *     对方不跟着我们归一，那种场合用 `toPosix`。同理别把归一后的 key 当模块 id
 *     返回：同一个文件以两种形态进模块图，会被 bundler 当成两个模块。
 *  2. 不要过虚拟模块 id（`\0...`、`mp-entry:...`、带 `?query` 的 id）——
 *     devkit 会把它们当相对路径拆。先脱壳（`unwrapEntryVirtualId`）再归一。
 */
export function pathKey(p: string): string {
  return normalize(p) as string;
}

/** 两个路径是不是同一个（形态、盘符大小写、`.` / `..`、尾斜杠都不敏感）。 */
export function isSamePath(a: string, b: string): boolean {
  return pathKey(a) === pathKey(b);
}

/**
 * `child` 是不是 `parent` 本身或在其目录内。
 *
 * 按**整段**对齐，所以 `src/a` 不会命中 `src/ab`——直接 `startsWith` 会。
 */
export function isPathIn(parent: string, child: string): boolean {
  const p = pathKey(parent);
  const c = pathKey(child);
  return c === p || c.startsWith(`${p === NormalizedRoot ? '' : p}/`);
}

/**
 * `child` 相对 `parent` 的那一段（posix、无前导 `./`），不在其内返回 undefined。
 *
 * 用来替 `child.startsWith(`${parent}/`) ? child.slice(parent.length + 1) : child`
 * 这类手写前缀剥离。
 */
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
