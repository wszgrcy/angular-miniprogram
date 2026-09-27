/**
 * 守卫：`script/*.ts` 的语法检查。
 *
 * ## 为什么需要
 *
 * `script/` 下的脚本（`package-sync.ts`、`build.ts` 等）**不在任何
 * 构建/类型检查路径里**：
 *
 *   - `npm run build` 走 `script/build.ts` / `start-build-library`，
 *     不会去类型检查 `package-sync.ts`
 *   - `script/tsconfig.json` 有既有 rootDir 问题，不能当门禁
 *   - `package-sync.ts` 只在 `npm run sync` 时由 ts-node 现场编译
 *
 * 结果就是：`package-sync.ts` 里的语法错误要等到有人跑 `npm run sync`
 * 才炸出来（实际发生过：改 changeList 时留下 `])  ]);` 重复闭合，
 * build / lint / test:ci 全绿，sync 直接 TS1005）。
 *
 * 这里用 `ts.transpileModule` 做**纯语法**检查 —— 它不做类型检查，
 * 因此不会被 script/tsconfig.json 那些 rootDir / 类型问题干扰，
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
    expect(fs.existsSync(SCRIPT_DIR))
      .withContext(`找不到 ${SCRIPT_DIR}`)
      .toBeTrue();
    files = fs
      .readdirSync(SCRIPT_DIR)
      .filter((f) => f.endsWith('.ts'))
      .sort();
  });

  it('应至少扫到 package-sync.ts 等脚本', () => {
    expect(files.length)
      .withContext('script/ 下没扫到 .ts 文件，本守卫空跑')
      .toBeGreaterThan(3);
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
        (d) => d.category === ts.DiagnosticCategory.Error
      );
      for (const d of diags) {
        let where = f;
        if (d.file && typeof d.start === 'number') {
          const { line } = d.file.getLineAndCharacterOfPosition(d.start);
          where = `${f}:${line + 1}`;
        }
        failures.push(`${where}  ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
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
      (d) => d.category === ts.DiagnosticCategory.Error
    );
    expect(diags.length)
      .withContext('这段就是当初漏网的 `])  ]);`，若抓不到说明守卫无效')
      .toBeGreaterThan(0);
  });
});
