import { bootstrapApplication } from 'angular-miniprogram';
import {
  createRequireContextRegistry,
  startupMiniProgramTest,
} from 'angular-miniprogram/vitest/runtime';

/**
 * 测试引导入口：把 spec 全量登记进 require.context 形态的注册表，
 *
 * 顺序要求：**先 bootstrapApplication，再起 worker**。
 * spec 里 import 的组件要能拿到已初始化的 Angular 运行时；
 * 反过来（先起 worker）会因为宿主下发 run 太快而拿到半初始化的 injector。
 */
async function main(): Promise<void> {
  await bootstrapApplication();

  // 小程序没有 webpack 的 require.context，这行是给构建期的
  // require-context-shim 插件看的，它把 spec 清单改写成同步 require 映射。
  const context = (require as any).context('./', true, /\.spec\.ts$/);

  startupMiniProgramTest({
    registry: createRequireContextRegistry(context as never),
  });
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[vitest] 引导失败', error);
});
