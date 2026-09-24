import * as path from 'path';
import { ngPackagrFactory } from '../src/builder/library/ng-packagr-factory';

async function main() {
  let packagr = await ngPackagrFactory(
    path.resolve(process.cwd(), './src/library/ng-package.json'),
    path.resolve(process.cwd(), './tsconfig.library.json'),
  );

  await packagr.build();
}

// 之前是裸调 `main()`，失败时靠 Node 15+ 的 unhandled rejection
// 默认崩溃来传播退出码。虽然结果正确（退出 1），但：
//   - 输出是一串裸栈回溯，不是可读的错误信息
//   - 一旦上游有人加了 try/catch，或 Node 的默认行为变化，
//     失败就会被吞掉、重新变成「假成功」
// 这里显式接管，保证失败一定反映到退出码上。
main().catch((err) => {
  console.error(
    '[build:library] 库构建失败：' +
      ((err && (err.message || err.stack)) || String(err)),
  );
  process.exitCode = 1;
});
