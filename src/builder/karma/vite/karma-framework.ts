import type { ConfigOptions } from 'karma';

/**
 * Vite 链路的 karma framework 插件（不跑 webpack）。
 *
 * 原 `plugin/karma.ts` 里那一大堆 webpack compiler 编排（自建 compiler、
 * hooks.done → refreshFiles、requestBlocker 等）在 Vite 链路下都不需要：
 *
 *   - 打包由 builder 里的 vite.build() 完成，产物直接落盘
 *   - 小程序侧的 bundle 是微信开发者工具从**磁盘**读的，不走 karma 的
 *     HTTP 文件服务（client 只靠 KARMA_PORT 连 socket）
 *   - 所以 karma 这边只剩「起 socket + reporter + 收结果」
 *
 * framework 名字故意沿用 `@angular-devkit/build-angular`：
 * karma.conf.js 里 `frameworks: ['@angular-devkit/build-angular']` 不用改，
 * 换的是 plugins 里 require 哪个文件。
 */
export interface ViteKarmaFrameworkHooks {
  /** 一轮测试跑完，成功 */
  onSuccess: () => void;
  /** 一轮测试跑完，失败 */
  onFailure: () => void;
}

/**
 * @param hooks 由 builder 注入，用来把 karma 的结果转成 BuilderOutput
 */
/** karma 的 emitter 没有公开类型定义，这里只用到 on() */
interface KarmaEmitterLike {
  on(event: string, handler: (...args: unknown[]) => void): void;
}

export function createViteKarmaFramework(
  hooks: ViteKarmaFrameworkHooks,
): (config: ConfigOptions, emitter: KarmaEmitterLike) => void | Promise<void> {
  return async (config: ConfigOptions, emitter: KarmaEmitterLike) => {
    // Vite 已经产好了，这里不能再去碰 webpack。
    // karma 的 files 数组在小程序场景下没有意义（bundle 从磁盘读），
    // 但 karma 会校验，给个空数组明确表达「没有要服务的文件」。
    config.files = config.files ?? [];

    // 编译错误由 builder 在 vite.build() 阶段就拦掉了，走到这里说明产物是好的。
    // emitter 上挂个标记，方便 reporter / 调试时区分链路。
    emitter.on('run_complete', (_browsers: unknown, results: unknown) => {
      const exitCode = (results as { exitCode?: number })?.exitCode;
      if (exitCode === 0) {
        hooks.onSuccess();
      } else {
        hooks.onFailure();
      }
    });
  };
}

/**
 * 供 `module.exports` 用的聚合导出。
 *
 * karma 通过 `plugins: [require('...')]` 加载，要求导出形如
 * `{ 'framework:<name>': ['factory', fn], 'launcher:<name>': ['type', cls] }`。
 * hooks 是运行时才知道的，所以这里用一个可写引用，
 * builder 在起 karma 之前先把它填上。
 *
 * ## 为什么挂 global 而不是模块级变量
 *
 * 本文件会被**两份不同的产物**同时 require：
 *
 *   - builder 侧：`dist/builder/karma/vite/karma-framework.js`
 *     （`tsconfig.builder.json` 编的）
 *   - karma 插件侧：`dist/karma/vite/karma-framework.js`
 *     （`karma/plugin/tsconfig.json` 因为 import 了本文件，rootDir 上提，
 *     详见那个 tsconfig 里的注释）
 *
 * 两个绝对路径 = 两个模块实例 = 两份 `pendingHooks`。builder 写它自己那份，
 * karma 插件读它自己那份，永远是 null，报「framework 未初始化」。
 * 仓库内跑 fixture 时两边都是 ts-node 直读 src，恰好是同一个实例，
 * 所以这个坑只在外部工程（从 dist 消费）才会踩到。
 *
 * 挂到 globalThis 上就跟模块身份无关了，几份副本都读写同一个槽。
 */
const HOOKS_GLOBAL_KEY = '__angularMiniprogramViteKarmaHooks__';

interface HooksStore {
  current: ViteKarmaFrameworkHooks | null;
}

function hooksStore(): HooksStore {
  const g = globalThis as unknown as Record<string, HooksStore | undefined>;
  if (!g[HOOKS_GLOBAL_KEY]) {
    g[HOOKS_GLOBAL_KEY] = { current: null };
  }
  return g[HOOKS_GLOBAL_KEY];
}

export function setViteKarmaFrameworkHooks(hooks: ViteKarmaFrameworkHooks) {
  hooksStore().current = hooks;
}

export function viteKarmaFrameworkFactory(
  config: ConfigOptions,
  emitter: KarmaEmitterLike,
): void | Promise<void> {
  const hooks = hooksStore().current;
  if (!hooks) {
    throw new Error(
      'Vite karma framework 未初始化：builder 必须先调用 setViteKarmaFrameworkHooks',
    );
  }
  return createViteKarmaFramework(hooks)(config, emitter);
}
