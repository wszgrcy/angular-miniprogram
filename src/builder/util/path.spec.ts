import { normalize } from '@angular-devkit/core';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import {
  isAbsoluteish,
  isPathIn,
  isSamePath,
  pathKey,
  relativePosix,
  resolveNative,
  stripPathPrefix,
  toModuleSpecifier,
  toNativePath,
  toPosix,
  toPosixPath,
} from './path';

/**
 * `util/path` 的契约测试。这里刻意把 Windows 形态和 posix 形态都写进断言，而不是只断言当前平台——
 * 这些函数的价值就在于跨平台把几种形态并成一个，只测当前平台等于没测（Linux CI 上任何一版实现都能过）。
 */

const IS_WIN = process.platform === 'win32';

/** 盘符出现在非首位 => 双盘符 */
const DOUBLE_DRIVE = /[a-zA-Z]:[\\/][a-zA-Z]:[\\/]/;

/**
 * 复刻 devkit normalizeAssetPatterns 里的校验：
 *   path.resolve(workspaceRoot, input).startsWith(workspaceRoot)
 * 关键在于它用的是 `node:path`（平台相关），而我们手上的 devkit Path 是 posix 正斜杠。
 */
function devkitCheck(root: string, input: string, p: typeof path): boolean {
  return p.resolve(root, input).startsWith(root);
}

describe('toPosix（只翻分隔符）', () => {
  it('反斜杠全变正斜杠', () => {
    expect(toPosix('C:\\a\\b\\c.ts')).toBe('C:/a/b/c.ts');
    expect(toPosix('/a/b/c.ts')).toBe('/a/b/c.ts');
    expect(toPosix('a\\b\\c.ts')).toBe('a/b/c.ts');
  });

  it('不动盘符大小写、不动前导斜杠（交给别人比时这两样必须原样）', () => {
    expect(toPosix('C:\\a')).toBe('C:/a');
    expect(toPosix('c:\\a')).toBe('c:/a');
    expect(toPosix('/C:/a')).toBe('/C:/a');
    expect(toPosix('C:\\a\\')).toBe('C:/a/');
  });

  it('重斜杠一并归一，尾斜杠则原样留着', () => {
    expect(toPosix('a//b\\c')).toBe('a/b/c');
    expect(toPosix('a/b/')).toBe('a/b/');
  });
});

describe('toNativePath（原生绝对路径）', () => {
  const posixRoot = 'C:/code/proj/test-host-1234';
  const input = './src/pages';

  it('复现 bug：posix 正斜杠 root 过 win32 resolve，startsWith 为 false', () => {
    // 这就是用户在 Windows 上看到的 "asset path must be within the workspace root."
    expect(devkitCheck(posixRoot, input, path.win32)).toBe(false);
  });

  it('转成原生反斜杠后，同一个校验通过', () => {
    const native = posixRoot.replace(/\//g, '\\');
    expect(devkitCheck(native, input, path.win32)).toBe(true);
  });

  it('toNativePath 在当前平台下必须让校验成立', () => {
    // Linux/macOS 上 getSystemPath 不改变分隔符；Windows 上会把 / 换成 \，两边对齐。两个平台都该通过。
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

  it('toNativePath 对普通 posix 路径幂等（当前平台）', () => {
    const once = toNativePath('/workspace/proj/x');
    expect(toNativePath(once)).toBe(once);
  });
});

describe('isAbsoluteish / resolveNative（devkit posix 化的 /C:/...）', () => {
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

  it('UNC 算绝对，盘符没跟分隔符不算，裸子目录算相对', () => {
    expect(isAbsoluteish('\\\\server\\share\\x')).toBe(true);
    expect(isAbsoluteish('C:')).toBe(false);
    expect(isAbsoluteish('a/b')).toBe(false);
    expect(isAbsoluteish('')).toBe(false);
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
});

describe('toPosixPath（产物路径归一）', () => {
  it('反斜杠全部转成正斜杠', () => {
    expect(toPosixPath('components\\component1\\component1-entry')).toBe(
      'components/component1/component1-entry',
    );
  });

  it('剥掉前导 / 和 ./', () => {
    expect(toPosixPath('/self-template/self.wxml')).toBe(
      'self-template/self.wxml',
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
      './componentscomponent-need-templatecomponent-need-template-entry',
    );
    const fixed: string = new Function(`return './${toPosixPath(raw)}'`)();
    expect(fixed).toBe(
      './components/component-need-template/component-need-template-entry',
    );
  });
});

describe('toModuleSpecifier（模块说明符）', () => {
  it('去前导 ./，但保留开头的 /（剥掉就成裸模块名了）', () => {
    expect(toModuleSpecifier('./spec/a.spec.ts')).toBe('spec/a.spec.ts');
    expect(toModuleSpecifier('/workspace/spec/a.spec.ts')).toBe(
      '/workspace/spec/a.spec.ts',
    );
    expect(toModuleSpecifier('spec\\a.spec.ts')).toBe('spec/a.spec.ts');
  });

  it('比 toPosixPath 少剥一层', () => {
    expect(toModuleSpecifier('/a/b')).not.toBe(toPosixPath('/a/b'));
  });
});

describe('relativePosix', () => {
  it('结果永远是正斜杠（path.relative 在 Windows 上给反斜杠）', () => {
    const rel = relativePosix(
      path.resolve('/root/src/pages'),
      path.resolve('/root/src/pages/a/b.ts'),
    );
    expect(rel).not.toContain('\\');
    expect(rel.split('/').filter(Boolean).join('/')).toBe('a/b.ts');
  });

  it('同一个目录给空串而不是 .', () => {
    const dir = path.resolve('/root/src');
    expect(relativePosix(dir, dir)).toBe('');
  });
});

describe('pathKey（身份归一：比较 / Map key）', () => {
  it('分隔符写法不同的同一个路径，key 相同', () => {
    expect(pathKey('C:\\a\\b.ts')).toBe(pathKey('C:/a/b.ts'));
    expect(pathKey('/a/b.ts')).toBe(pathKey('/a/b.ts'));
  });

  it('盘符大小写不同也判同一个（Windows 盘符大小写不保证一致）', () => {
    expect(pathKey('C:\\a\\b.ts')).toBe(pathKey('c:/a/b.ts'));
  });

  it('尾斜杠不参与身份', () => {
    expect(pathKey('C:/a/b')).toBe(pathKey('C:/a/b/'));
  });

  /** devkit normalize 比手写分隔符翻转多出来的部分 */
  it('`.` / `..` / 重斜杠 / 尾斜杠一起归一', () => {
    expect(pathKey('C:/a/./b.ts')).toBe(pathKey('C:/a/b.ts'));
    expect(pathKey('C:/a/x/../b.ts')).toBe(pathKey('C:/a/b.ts'));
    expect(pathKey('C://a//b.ts')).toBe(pathKey('C:/a/b.ts'));
  });

  it('不同文件不会被并成一个（盘符归一，但段的大小写仍敏感）', () => {
    expect(pathKey('C:/A/B.ts')).not.toBe(pathKey('C:/a/b.ts'));
  });

  it('posix 下盘符规则是 no-op，大小写仍然敏感', () => {
    expect(pathKey('/a/b')).toBe('/a/b');
    expect(pathKey('/A/b')).not.toBe(pathKey('/a/b'));
  });

  it('身份形态就是 devkit 的 Path 形态（不是又造一套）', () => {
    expect(pathKey('/a/b.ts')).toBe(normalize('/a/b.ts'));
    expect(pathKey('a/b.ts')).toBe(normalize('a/b.ts'));
  });
});

describe('isSamePath', () => {
  it('认得跨形态的同一个路径', () => {
    expect(isSamePath('C:\\a\\b.ts', 'C:/a/b.ts')).toBe(true);
    expect(isSamePath('c:/a/b.ts', 'C:\\a\\b.ts')).toBe(true);
    expect(isSamePath('/a/b', '/a/b/')).toBe(true);
  });

  it('不同路径判否', () => {
    expect(isSamePath('/a/b', '/a/c')).toBe(false);
    expect(isSamePath('/a/b', '/a/b/c')).toBe(false);
  });
});

describe('isPathIn（按段对齐的前缀判定）', () => {
  it('目录本身算在内', () => {
    expect(isPathIn('/a/b', '/a/b')).toBe(true);
  });

  it('子路径在内，兄弟前缀不算', () => {
    expect(isPathIn('/a/b', '/a/b/c.ts')).toBe(true);
    // 裸 startsWith 会误判成 true 的那一类
    expect(isPathIn('/a/b', '/a/bc.ts')).toBe(false);
    expect(isPathIn('/a/b', '/a/b.ts')).toBe(false);
  });

  it('跨形态 + 盘符大小写都认', () => {
    expect(isPathIn('C:\\code\\src', 'C:/code/src/pages/a.ts')).toBe(true);
    expect(isPathIn('c:/code/src', 'C:\\code\\src\\pages\\a.ts')).toBe(true);
  });
});

describe('stripPathPrefix', () => {
  it('剥掉前缀给出相对段', () => {
    expect(stripPathPrefix('/a', '/a/pages/x.ts')).toBe('pages/x.ts');
    expect(stripPathPrefix('C:\\code\\src', 'C:/code/src/pages/x.ts')).toBe(
      'pages/x.ts',
    );
  });

  it('目录自身剥出空串，不在其内给 undefined', () => {
    expect(stripPathPrefix('/a', '/a')).toBe('');
    expect(stripPathPrefix('/a', '/ab/x')).toBeUndefined();
    expect(stripPathPrefix('/a', '/b/x')).toBeUndefined();
  });
});

describe('实测的四种路径形态（钉住本模块开头那张表）', () => {
  it('Windows 上 path.* 产出反斜杠，而 vite id / TS fileName 是正斜杠', () => {
    if (!IS_WIN) {
      return;
    }
    // 这一条是整份词汇表存在的前提：两者形态确实不同
    expect(path.resolve('C:/a/b.ts')).toBe('C:\\a\\b.ts');
    expect(path.normalize('C:/a/b.ts')).toBe('C:\\a\\b.ts');
    // 归一之后才可比
    expect(pathKey(path.resolve('C:/a/b.ts'))).toBe(pathKey('C:/a/b.ts'));
  });
});
