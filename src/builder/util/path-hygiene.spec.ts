import { readFileSync, readdirSync } from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

/**
 * 路径写法的防回归扫描。
 *
 * 这类 bug 在本仓库已经修过好几轮（`f36f671` 产物路径统一 posix、
 * `98a3f96` 分包归属统一盘符大小写、fileReplacements 在 Windows 上静默
 * 失配），每一轮都是「又有人手写了一遍分隔符翻转」。测试只能保证当前代码
 * 干净，挡不住下一次，所以这里直接把源码扫一遍。
 *
 * ## 规则一：不许在 `util/path.ts` 之外手写分隔符翻转
 *
 * 手写 `.replace(/\\/g, '/')` 的问题不是写不对，是**每个人写的都差一点**：
 * 有的忘了盘符、有的忘了尾斜杠、有的把该保留的前导 `/` 也剥了。仓库里曾经
 * 同时存在 6 份 `toPosix`，行为两两不同。统一走 `util/path` 之后，要改语义
 * 只有一处可改。
 *
 * ## 规则二：`pathKey` 的产物不许直接进 `fs` / node `path`
 *
 * `pathKey` 返回的是 devkit 的**身份形态**（Windows 上 `/C:/a/b`，开头多一个
 * 斜杠）。它只能用来比、当 key；交给 `fs` 或 `path.resolve` 会被当成
 * 「C 盘下的 `\C\a\b`」，Windows 上直接 ENOENT（posix 下反倒看不出来）。
 * 要变回可用路径用 `toNativePath` / `toAbsolutePosix`。
 *
 * 这条只能抓到**直接嵌套**的写法（`fs.readFileSync(pathKey(x))`）；先存进
 * 变量再传出去的抓不到，那种靠 review 和 Windows 上跑全量测试兜底。
 */

const BUILDER_ROOT = path.resolve(__dirname, '..');

/** 允许出现这些写法的文件（它们本身就是实现处 / 定义这些规则的地方） */
const ALLOWED = new Set([
  path.join('util', 'path.ts'),
  path.join('util', 'path-hygiene.spec.ts'),
]);

const FORBIDDEN: Array<{ name: string; re: RegExp }> = [
  {
    name: '手写反斜杠转正斜杠',
    re: /\.replace\(\s*\/\\\\\/g\s*,\s*['"]\/['"]\s*\)/,
  },
  {
    name: 'split(sep).join("/")',
    re: /split\(\s*(?:path\.)?sep\s*\)\s*\.join\(\s*['"]\/['"]\s*\)/,
  },
  {
    name: 'split("/").join(sep)',
    re: /split\(\s*['"]\/['"]\s*\)\s*\.join\(\s*(?:path\.)?sep\s*\)/,
  },
  {
    name: 'pathKey 产物直接进 fs / node path',
    re: /(?:fs\.\w+|path\.(?:resolve|dirname|join|relative|isAbsolute))\([^)]*\bpathKey\(/,
  },
];

function collectTsFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectTsFiles(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      out.push(full);
    }
  }
  return out;
}

describe('路径写法防回归', () => {
  const files = collectTsFiles(BUILDER_ROOT);

  it('扫到了源码（防止路径算错导致空扫、白过）', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  for (const { name, re } of FORBIDDEN) {
    it(`不出现「${name}」`, () => {
      const hits: string[] = [];
      for (const file of files) {
        const rel = path.relative(BUILDER_ROOT, file);
        if (ALLOWED.has(rel)) {
          continue;
        }
        const lines = readFileSync(file, 'utf8').split('\n');
        lines.forEach((line, i) => {
          // 注释里提到这些写法是在解释「为什么不许」，放行
          if (
            line.trimStart().startsWith('*') ||
            line.trimStart().startsWith('//')
          ) {
            return;
          }
          if (re.test(line)) {
            hits.push(`${rel}:${i + 1}: ${line.trim()}`);
          }
        });
      }
      expect(
        hits,
        `发现手写路径转换，改用 util/path 里的函数：\n${hits.join('\n')}`,
      ).toEqual([]);
    });
  }
});
