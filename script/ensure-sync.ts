/**
 * 构建前置检查：
 *
 * `src/library/forms/src/**`（除少量手写的 value accessor 之外）不进版本库
 * （见 src/library/forms/.gitignore），而是由 `npm run sync`（code-recycle）
 * 从 angular/angular 同步生成。
 *
 * 如果没执行过 sync 就直接构建，ng-packagr 会报
 * `TS6053: File '.../src/library/forms/src/validators.ts' not found`。
 *
 * 这里在构建 library 之前自动检测一次，缺失时自动补跑 `npm run sync`。
 *
 * 注：`src/library/common/**` 以前也在这里，现已不再同步也不保留
 * 转发层——库与测试应用都直接 import 官方 `@angular/common`。
 */
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');

const requiredFiles = [
  // 只有 forms 还走 sync。`common` / `common/http` 已不再同步
  // （库直接用官方 @angular/common），所以不再要求它们的文件。
  'src/library/forms/src/validators.ts',
];

const missing = requiredFiles.filter(
  (file) => !fs.existsSync(path.join(root, file)),
);

if (missing.length === 0) {
  process.exit(0);
}

console.log(`[ensure-sync] 缺少由 sync 生成的源码: ${missing.join(', ')}`);
console.log(
  '[ensure-sync] 自动执行 `npm run sync`（需要网络，首次约 1 分钟）...',
);

const result = spawnSync('npm', ['run', 'sync'], {
  cwd: root,
  stdio: 'inherit',
});

if (result.status !== 0) {
  console.error(
    '[ensure-sync] 自动同步失败，请手动执行 `npm run sync` 后重试构建。',
  );
  process.exit(result.status === null ? 1 : result.status);
}

const stillMissing = requiredFiles.filter(
  (file) => !fs.existsSync(path.join(root, file)),
);

if (stillMissing.length > 0) {
  console.error(`[ensure-sync] 同步后仍然缺少: ${stillMissing.join(', ')}`);
  process.exit(1);
}

console.log('[ensure-sync] 同步完成');
