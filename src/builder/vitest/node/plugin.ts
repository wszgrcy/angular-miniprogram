import type { PoolRunnerInitializer, VitestPluginContext } from 'vitest/node';
import type { MiniProgramVitestPluginOptions } from './options';
import { resolveMiniProgramVitestPluginOptions } from './options';
import { MiniProgramPoolWorker } from './pool-worker';
import { MiniProgramVitestSession } from './session';

export interface MiniProgramVitestPlugin {
  name: 'vitest-miniprogram-pool';
  configureVitest(context: VitestPluginContext): void;
}

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
  const slotCount = resolved.slots;

  return {
    name: 'vitest-miniprogram-pool',
    configureVitest({ project }: VitestPluginContext): void {
      const session = new MiniProgramVitestSession(resolved);
      let nextSlot = 0;

      const poolRunner: PoolRunnerInitializer = {
        name: 'miniprogram',
        createPoolWorker: () => {
          const slot = nextSlot % slotCount;
          nextSlot += 1;
          return new MiniProgramPoolWorker(slot, session);
        },
      };

      project.config.pool = poolRunner.name;
      project.config.poolRunner = poolRunner;
      project.config.maxWorkers = slotCount;
      // slot 是设备上的常驻运行环境，不是可丢弃进程。
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
