import * as path from 'path';
import {
  isAbsoluteish,
  resolveNative,
  toNativePath,
  toPosixPath,
} from './asset-path';

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
  const posixified = '/C/code/proj/host/src/tsconfig.spec.json';
  const root = 'C:/code/proj/host';

  it('isAbsoluteish 认得原生绝对 + posix 化绝对', () => {
    expect(isAbsoluteish(posixified)).toBe(true);
    expect(isAbsoluteish('C:/code/x')).toBe(true);
    expect(isAbsoluteish('C:\\code\\x')).toBe(true);
    expect(isAbsoluteish('/workspace/x')).toBe(true);
    expect(isAbsoluteish('src/tsconfig.spec.json')).toBe(false);
    expect(isAbsoluteish('./src/x')).toBe(false);
  });

  it('resolveNative：绝对输入不再跟 base 拼，且不会双盘符', () => {
    const out = resolveNative(root, posixified);
    expect(out).not.toMatch(DOUBLE_DRIVE);
  });

  it('resolveNative：相对输入相对 base 解析，而不是 process.cwd()', () => {
    const out = resolveNative('/base/dir', 'src/tsconfig.spec.json');
    expect(out).toBe(path.resolve('/base/dir/src/tsconfig.spec.json'));
    expect(out).not.toBe(path.resolve('src/tsconfig.spec.json'));
  });

  it('toNativePath 幂等（当前平台）', () => {
    const once = toNativePath('/workspace/proj/x');
    expect(toNativePath(once)).toBe(once);
  });
});

describe('util/asset-path: toPosixPath（产物路径归一）', () => {
  it('反斜杠全部转成正斜杠', () => {
    expect(toPosixPath('components\\component1\\component1-entry')).toBe(
      'components/component1/component1-entry'
    );
  });

  it('剥掉前导 / 和 ./', () => {
    expect(toPosixPath('/self-template/self.wxml')).toBe(
      'self-template/self.wxml'
    );
    expect(toPosixPath('./pages/a.js')).toBe('pages/a.js');
  });

  it('混合分隔符也干净', () => {
    expect(toPosixPath('a/b\\c/d')).toBe('a/b/c/d');
  });

  /**
   * 真正的动机：JS 字符串字面量里 `\c` 是无效转义，反斜杠被**静默吃掉**，
   * `./components\component-need-template\x` 直接变成
   * `./componentscomponent-need-templatex`——不报错，运行时才找不到模块。
   * （更糟的如 `\x` 开头还会直接 SyntaxError。）
   */
  it('归一后的路径放进 require 字面量不会被转义吃掉', () => {
    const raw =
      'components\\component-need-template\\component-need-template-entry';
    const broken: string = new Function(`return './${raw}'`)();
    // 反斜杠被静默吃掉：原本 3 层目录只剩开头 `./` 那一个 `/`，
    // 层级全丢，且字符串变短了。不报错，运行时才找不到模块。
    expect((broken.match(/\//g) || []).length).toBe(1);
    expect(broken).toBe(
      './componentscomponent-need-templatecomponent-need-template-entry'
    );
    const fixed: string = new Function(`return './${toPosixPath(raw)}'`)();
    expect(fixed).toBe(
      './components/component-need-template/component-need-template-entry'
    );
  });
});
