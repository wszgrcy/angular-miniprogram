import type { Plugin, ViteUserConfig as UserConfig } from 'vitest/config';
import type { PoolRunnerInitializer, VitestPluginContext } from 'vitest/node';
import type { MiniProgramVitestPluginOptions } from './options';
import { resolveMiniProgramVitestPluginOptions } from './options';
import { MiniProgramPoolWorker } from './pool-worker';
import { MiniProgramVitestSession } from './session';

/**
 * 就是 vite 的 `Plugin`，不另造形状。
 *
 * `configureVitest` 和 `UserConfig.test` 都是 vitest 用 module augmentation
 * 直接加在 vite 上的（见 `vitest/dist/config.d.ts` 里的
 * `declare module "vite"`）。注意得从 **`vitest/config`** 取这两个类型：
 * 那段 augmentation 就写在这个入口里，从 `vite` 直接拿是干净的 `Plugin`，
 * 没有 `configureVitest`，`config.test` 也报 TS2339。
 *
 * 自己重声明一遍只会得到一个「编译过但跟 vite 对不上」的假保险。
 */
export type MiniProgramVitestPlugin = Plugin;

/**
 * 把 vitest 的文件执行搬到微信开发者工具里的小程序运行时。
 *
 * **为什么不是 browser provider。** vitest 的 browser 模式要求被测试页面
 * 从 Vite dev server 以 `<script type=module>` 逐个拉 ES 模块
 * （provider 只负责 `openPage`，模块图由浏览器自己走）。
 * 小程序运行时不执行远程 ES 模块，只能事先把 spec 全部编进包，
 * 所以走 **自定义 pool**：宿主照常跑 vitest，只是「执行一个文件」这件事
 * 变成往 WebSocket 发一条 `WorkerRequest`。
 *
 * 用法：
 *
 * ```ts
 * // vitest.config.mts
 * import { defineConfig } from 'vitest/config';
 * import { miniProgramVitest } from 'angular-miniprogram/vitest';
 *
 * export default defineConfig({
 *   plugins: [miniProgramVitest({ port: 17900 })],
 * });
 * ```
 */
export function miniProgramVitest(
  options: MiniProgramVitestPluginOptions = {},
): MiniProgramVitestPlugin {
  const resolved = resolveMiniProgramVitestPluginOptions(options);

  return {
    name: 'vitest-miniprogram-pool',
    /**
     * 默认打开 `test.globals`。
     *
     * 设备端只认序列化过去的 `config.globals`：`setupCommonEnv` 就靠它决定
     * 要不要 `registerApiGlobally()`。没升则小程序里裸 `describe` 直接
     * `wx.__window.describe is not a function`，而宿主只能干等——一个开关
     * 忘了写就整轮超时，不值得留这个坑。编译期那半（`vitest/globals` 的
     * 类型声明）在测试工程自己的 d.ts 里，跟这里无关。
     *
     * 只补「没写」的：显式 `globals: false` 照旧尊重。
     */
    /**
     * 就地改原始配置（不是返回部分配置）：返回会被 merge 到最终配置，
     * 那就成了「插件覆盖用户」，显式 `globals: false` 也压不回来了。
     */
    config(config: UserConfig): void {
      const test = (config.test ??= {});
      if (test.globals === undefined) {
        test.globals = true;
      }
    },
    configureVitest({ project }: VitestPluginContext): void {
      const session = new MiniProgramVitestSession(resolved);

      const poolRunner: PoolRunnerInitializer = {
        name: 'miniprogram',
        // 不传序号：设备端就一个常驻运行环境、一条 socket，所有 PoolWorker
        // 都是同一个 worker 的代理。
        createPoolWorker: () => new MiniProgramPoolWorker(session),
      };

      project.config.pool = poolRunner.name;
      project.config.poolRunner = poolRunner;
      // 并发固定为 1：小程序一个 appservice 进程只有一个运行环境，
      // 而 session 只存一条 socket（新连接顶掉旧连接），多开一个 PoolWorker
      // 只会多一个永远等不到 worker-ready 的份。真并发得是多台设备各连一条，
      // 那条路现在没接。
      project.config.maxWorkers = 1;
      // 设备端是常驻运行环境，不是可丢弃进程。
      // 隔离掉会让每个文件都重新等一次 worker-ready，白等。
      project.config.isolate = false;
      if (resolved.include) {
        project.config.include = resolved.include;
      }
      if (resolved.exclude) {
        project.config.exclude = resolved.exclude;
      }
    },
  };
}
