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
  hooks: ViteKarmaFrameworkHooks
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
 * hooks 是运行时才知道的，所以这里用一个模块级可写引用，
 * builder 在起 karma 之前先把它填上。
 */
const pendingHooks: { current: ViteKarmaFrameworkHooks | null } = {
  current: null,
};

export function setViteKarmaFrameworkHooks(hooks: ViteKarmaFrameworkHooks) {
  pendingHooks.current = hooks;
}

export function viteKarmaFrameworkFactory(
  config: ConfigOptions,
  emitter: KarmaEmitterLike
): void | Promise<void> {
  const hooks = pendingHooks.current;
  if (!hooks) {
    throw new Error(
      'Vite karma framework 未初始化：builder 必须先调用 setViteKarmaFrameworkHooks'
    );
  }
  return createViteKarmaFramework(hooks)(config, emitter);
}
