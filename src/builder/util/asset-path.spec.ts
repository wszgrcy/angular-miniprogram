import * as path from 'path';
import { toNativePath } from './asset-path';

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
