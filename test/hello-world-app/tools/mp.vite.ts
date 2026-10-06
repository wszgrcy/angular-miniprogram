import { defineMpViteConfig } from 'angular-miniprogram/builder';

/**
 * 自定义 vite 配置的示例钩子。
 *
 * 干两件看得见的事：
 *  1. 塞一个 define（`__MP_HOOK_TAG__`），业务代码里能直接读到
 *  2. 挂一个插件，往产物里落一个 `mp-hook-marker.txt`，内容来自 ctx
 *
 * 构建日志里那行「自定义 vite 配置已应用」+ 产物里那个 marker，
 * 就是钩子确实跑过的两个证据。
 */
export default defineMpViteConfig((config, ctx) => {
  ctx.logger.info(
    `[mp.vite.ts] target=${ctx.target} platform=${ctx.platform} mode=${ctx.mode}`,
  );

  config.define = {
    ...config.define,
    __MP_HOOK_TAG__: JSON.stringify(`${ctx.target}-${ctx.platform}`),
  };

  config.plugins ??= [];
  config.plugins.push({
    name: 'mp-demo-marker',
    generateBundle(_options, bundle) {
      void bundle;
      this.emitFile({
        type: 'asset',
        fileName: 'mp-hook-marker.txt',
        source: `target=${ctx.target} platform=${ctx.platform} production=${ctx.isProduction}\n`,
      });
    },
  });

  return config;
});
