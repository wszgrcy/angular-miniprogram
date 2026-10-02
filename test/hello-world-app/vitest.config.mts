import { defineConfig } from 'vitest/config';
import { miniProgramVitest } from 'angular-miniprogram/vitest';

/**
 * 小程序运行时测试（vitest 链路）。
 *
 * 和仓库根的 `vitest.config.mts` 是**两件事**：
 *  - 根配置：跑本仓库 Node 侧逻辑（`npm test`）
 *  - 本配置：把 spec 推进微信开发者工具里的小程序运行时执行
 *
 * 用法：`npm run test:wechat`（= script/wechat-vitest.cjs）一条命令搞定：
 * 编产物 → 起 vitest（内部起 WS）→ 开发者工具打开产物 → 收结果。
 * 手动分步则是：
 *   1. npx ng run app:test        # 把 spec 编进小程序产物
 *   2. npx vitest run --config vitest.config.mts
 *   3. 开发者工具打开 dist/vitest/app（设备主动连回 ws://127.0.0.1:port）
 *
 * port 必须和 angular.json 里 test-vitest.options.port 一致（脚本会用
 * `MP_VITEST_PORT` 覆盖两边，见下）。
 */
/**
 * WS 端口。真正说数的是 angular.json 里 `test.options.port`：它会被 define
 * 进产物，设备就是连它。`script/wechat-vitest.cjs` 把 `--port` 透成
 * `MP_VITEST_PORT`，两边对不上就干脆连不上（而不是静默用另一个端口跑成功）。
 */
const port = Number(process.env.MP_VITEST_PORT ?? 17900);

/**
 * 等设备连回的毫秒数。`script/wechat-vitest.cjs` 会把它自己的
 * `--connect-timeout`（默认 20s）透过来，两边共用一个数；手跑 vitest 时
 * 退回这里的默认值。开发者工具冷启动慢到 20s 以上就
 * `--connect-timeout 60` 放宽，不致于把「没连上」和「连得慢」揉成一个报错。
 */
const connectTimeout = Number(process.env.MP_VITEST_CONNECT_TIMEOUT ?? 20_000);

export default defineConfig({
  plugins: [miniProgramVitest({ port, connectTimeout })],
  test: {
    // 没写 `globals`——`miniProgramVitest()` 默认就开了（设备端靠它
    // registerApiGlobally，裸 describe/it/expect 才存在）。这里显式写
    // `globals: false` 才会关掉，那时 spec 得自己 import。
    // spec 在小程序里执行，宿主进程不 import 它们，
    // 这里只是把「有哪些文件」告诉 vitest 的调度器。
    include: ['src/spec/**/*.spec.ts'],
    // 设备端一个常驻运行环境，串行跑，别并发抢同一个 slot。
    maxWorkers: 1,
    isolate: false,
    // 单条 spec / 单个钩子的上限。实测 13 条平均 ~1.3s，这里给的是「卡住了
    // 就早断」的上限，不是性能预算。
    //
    // testTimeout 必须 **大于** `componentTestComplete` 自带的 15s（见
    // src/spec/util/page-info.ts）：页面 onReady 没完成时，那条路径会抛
    // 「onReady 未在 15000ms 内完成 testFinish$$」这种带信息的错，被 vitest
    // 先掉就只剩一旬没头没尾的 `Test timed out in 20000ms`。
    testTimeout: 20_000,
    // 钩子就是 `beforeEach` 里的 `openComponent`（reLaunch + 等一个
    // onAppRoute 事件），正常几十毫秒；真卡住就是路由事件没发过，
    // 多等不会变好。见 src/spec/util/open-component.ts。
    hookTimeout: 20_000,
  },
});
