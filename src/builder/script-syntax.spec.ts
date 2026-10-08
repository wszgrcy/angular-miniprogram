/**
 * 守卫：`script/*.ts` 的语法检查。
 *
 * `script/` 下的脚本不在任何构建/类型检查路径里：`npm run build` 不会去类型检查它们，
 * `script/tsconfig.json` 有既有 rootDir 问题不能当门禁。结果就是脚本里的语法错误要等到
 * 有人跑 `npm run sync` 才炸出来，而 build / lint / test 全绿。
 *
 * 这里用 `ts.transpileModule` 做纯语法检查——它不做类型检查，因此不会被 rootDir / 类型问题干扰，
 * 只抓真正让脚本无法编译的语法错。
 */
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT_DIR = path.join(REPO_ROOT, 'script');

describe('script/*.ts 语法守卫', () => {
  let files: string[];

  beforeAll(() => {
    expect(fs.existsSync(SCRIPT_DIR), `找不到 ${SCRIPT_DIR}`).toBe(true);
    files = fs
      .readdirSync(SCRIPT_DIR)
      .filter((f) => f.endsWith('.ts'))
      .sort();
  });

  it('应至少扫到 package-sync.ts 等脚本', () => {
    expect(
      files.length,
      'script/ 下没扫到 .ts 文件，本守卫空跑',
    ).toBeGreaterThan(3);
    expect(files).toContain('package-sync.ts');
    expect(files).toContain('ensure-sync.ts');
  });

  it('每个脚本都必须能通过 TypeScript 语法解析', () => {
    const failures: string[] = [];

    for (const f of files) {
      const full = path.join(SCRIPT_DIR, f);
      const src = fs.readFileSync(full, 'utf8');
      const out = ts.transpileModule(src, {
        reportDiagnostics: true,
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
        },
      });
      const diags = (out.diagnostics ?? []).filter(
        (d) => d.category === ts.DiagnosticCategory.Error,
      );
      for (const d of diags) {
        let where = f;
        if (d.file && typeof d.start === 'number') {
          const { line } = d.file.getLineAndCharacterOfPosition(d.start);
          where = `${f}:${line + 1}`;
        }
        failures.push(
          `${where}  ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`,
        );
      }
    }

    expect(failures).toEqual([]);
  });

  it('反向对照：故意注入语法错误，守卫必须抓到', () => {
    const bad = 'const a = 1;\n])  ]);\n';
    const out = ts.transpileModule(bad, {
      reportDiagnostics: true,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    });
    const diags = (out.diagnostics ?? []).filter(
      (d) => d.category === ts.DiagnosticCategory.Error,
    );
    expect(
      diags.length,
      '这段就是当初漏网的 `])  ]);`，若抓不到说明守卫无效',
    ).toBeGreaterThan(0);
  });
});
