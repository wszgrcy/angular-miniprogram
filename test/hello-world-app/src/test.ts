import { bootstrapApplication } from 'angular-miniprogram';
import {
  startupMiniProgramTest,
  type TestModuleMap,
} from 'angular-miniprogram/vitest/runtime';

/**
 * spec 清单，形如 `{ "./spec/x.spec.ts": () => require("./specs/spec/x.spec.js") }`。
 * 值由构建期的 spec-modules 插件就地替换进来（见
 * `src/builder/vite/plugins/spec-modules.plugin.ts`）。
 */
declare const __MP_SPEC_MODULES__: TestModuleMap;

/**
 * 测试引导入口。
 *
 * 顺序要求：**先 bootstrapApplication，再起 worker**。
 * spec 里 import 的组件要能拿到已初始化的 Angular 运行时；
 * 反过来（先起 worker）会因为宿主下发 run 太快而拿到半初始化的 injector。
 */
async function main(): Promise<void> {
  await bootstrapApplication();

  startupMiniProgramTest({ modules: __MP_SPEC_MODULES__ });
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[vitest] 引导失败', error);
});
