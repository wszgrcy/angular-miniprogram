import { defineConfig } from 'vitest/config';
import { miniProgramVitest } from 'angular-miniprogram/vitest';

/**
 * 小程序运行时测试（vitest 链路）。
 *
 * 和仓库根的 `vitest.config.mts` 是**两件事**：
 *  - 根配置：跑本仓库 Node 侧逻辑（`npm test`）
 *  - 本配置：把 spec 推进微信开发者工具里的小程序运行时执行
 *
 * 用法（两个进程）：
 *   1. npx ng run app:test-vitest        # 把 spec 编进小程序产物
 *   2. 微信开发者工具打开 test/hello-world-app/dist/vitest/app
 *   3. npx vitest run --config vitest.config.mts   # 起 WS、等连接、收结果
 *
 * port 必须和 angular.json 里 test-vitest.options.port 一致。
 */
export default defineConfig({
  plugins: [miniProgramVitest({ port: 17900, connectTimeout: 180_000 })],
  test: {
    // spec 在小程序里执行，宿主进程不 import 它们，
    // 这里只是把「有哪些文件」告诉 vitest 的调度器。
    include: ['src/spec/**/*.spec.ts'],
    // 设备端一个常驻运行环境，串行跑，别并发抢同一个 slot。
    maxWorkers: 1,
    isolate: false,
    // 小程序冷启动 + 开发者工具连回 socket 都很慢。
    testTimeout: 120_000,
    hookTimeout: 180_000,
  },
});
