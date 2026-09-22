import * as path from 'path';
import { stripPosixDrivePrefix, toNativePath } from './asset-path';

/**
 * 复刻 devkit normalizeAssetPatterns 里的校验：
 *   path.resolve(workspaceRoot, input).startsWith(workspaceRoot)
 *
 * 关键在于它用的是 `node:path`（平台相关），而我们手上的 devkit Path
 * 是 posix 正斜杠。Windows 上这两者分隔符不一致，startsWith 直接 false。
 */
function devkitCheck(root: string, input: string, p: typeof path): boolean {
  return p.resolve(root, input).startsWith(root);
}

describe('util/asset-path: Windows 路径分隔符', () => {
  const posixRoot = 'C:/code/proj/test-host-1234';
  const input = './src/pages';

  it('复现 bug：posix 正斜杠 root 过 win32 resolve，startsWith 为 false', () => {
    // 这就是用户在 Windows 上看到的
    // "The ./src/pages asset path must be within the workspace root."
    expect(devkitCheck(posixRoot, input, path.win32)).toBe(false);
  });

  it('转成原生反斜杠后，同一个校验通过', () => {
    const native = posixRoot.replace(/\//g, '\\');
    expect(devkitCheck(native, input, path.win32)).toBe(true);
  });

  it('toNativePath 在当前平台下必须让校验成立', () => {
    // Linux/macOS 上 getSystemPath 不改变分隔符，本来一致；
    // Windows 上会把 / 换成 \，两边对齐。两个平台都该通过。
    const root = toNativePath(posixRoot);
    expect(devkitCheck(root, input, path)).toBe(true);
  });

  it('toNativePath 幂等', () => {
    const once = toNativePath(posixRoot);
    expect(toNativePath(once)).toBe(once);
  });

  it('相对路径输入也成立（真实 CLI 场景 workspaceRoot 常是相对）', () => {
    const root = toNativePath('./some/workspace');
    expect(devkitCheck(root, input, path)).toBe(true);
  });
});

/** 盘符出现在非首位 => 双盘符 */
const DOUBLE_DRIVE = /[a-zA-Z]:[\\/][a-zA-Z]:[\\/]/;

describe('util/asset-path: devkit posix 化的 Windows 路径（/C:/...）', () => {
  const posixified = '/C:/code/proj/host/src/tsconfig.spec.json';
  const root = 'C:/code/proj/host';

  it('复现双盘符：不剥斜杠直接 win32 resolve 会拼出 C:\\C\\...', () => {
    // 这就是用户看到的 C:\C\code\... 的来源：
    // `/C:/...` 在 win32 下是「无盘符绝对路径」，resolve 时重新补盘
    const doubled = path.win32.resolve(root, posixified);
    // 双盘符的特征是「盘符出现在非首位」，即 X:\Y:\ 这种。
    // 不能用 toContain('c:\\c')——正常路径 c:\code 里就有 c:\c，误报。
    expect(doubled).toMatch(DOUBLE_DRIVE);
  });

  it('stripPosixDrivePrefix 把 /C:/ 变回 C:/，win32 认它是带盘符的绝对路径', () => {
    const stripped = stripPosixDrivePrefix(posixified);
    expect(stripped).toBe('C:/code/proj/host/src/tsconfig.spec.json');
    expect(path.win32.isAbsolute(stripped)).toBe(true);
    // 盘符只出现一次
    expect(/c:[\\/]?c:/i.test(stripped)).toBe(false);
  });

  it('剥完之后 win32 resolve 不再双盘符', () => {
    const joined = path.win32.resolve(
      stripPosixDrivePrefix(root),
      stripPosixDrivePrefix(posixified)
    );
    expect(joined).not.toMatch(DOUBLE_DRIVE);
    expect(joined.toLowerCase()).toBe(
      'c:\\code\\proj\\host\\src\\tsconfig.spec.json'
    );
  });

  it('普通 unix 路径不被 strip 影响', () => {
    const unix = '/workspace/miniprogram/proj/src/tsconfig.spec.json';
    expect(stripPosixDrivePrefix(unix)).toBe(unix);
  });

  it('相对路径不被 strip 影响，仍走 resolve 补 cwd', () => {
    const rel = 'src/tsconfig.spec.json';
    expect(stripPosixDrivePrefix(rel)).toBe(rel);
    expect(path.isAbsolute(toNativePath(rel))).toBe(true);
  });

  it('toNativePath 对当前平台的绝对路径直接短路，不进 devkit normalize', () => {
    // 关键回归点：先 normalize 会把 C:/x 补成 /C:/x，双盘符复活。
    // 所以绝对路径必须在 normalize 之前短路掉。
    const abs = path.resolve('src/tsconfig.spec.json');
    expect(toNativePath(abs)).toBe(abs);
  });
});
