import type { Plugin } from 'vite';
import type { DiscoveredSpec } from '../../shared/spec-discovery';

/** `test.ts` 里读的那个标识符，构建期由本插件替换掉 */
export const MP_SPEC_MODULES = '__MP_SPEC_MODULES__';

/**
 * 把 `test.ts` 里的 `__MP_SPEC_MODULES__` 换成「key → 懒 require」表。key 保持 `./<rel>.ts` 形状：
 * 宿主下发的是宿主机上的绝对路径，运行时靠后缀匹配对上（见 `vitest/runtime/registry.ts`）。
 *
 * 必须懒：spec 顶层就调 `describe()` / `it()`，而 vitest 的全局要等 worker 收到 `start` 后跑
 * `setupCommonEnv` 才装。启动路径上提前 require 就是 `describe is not defined`，它还会把后面的
 * `startupMiniProgramTest()` 一起带走，表现是「app 起来了、设备永远不连宿主」。
 *
 * 必须在 `generateBundle` 做：require 的路径得是字面量，两头的坑都实测过——
 *  1. 让打包器看见字面量：`specs/...` 是产物路径、源码里没有，rolldown 直接 `UNRESOLVED_IMPORT`。
 *  2. 用变量绕开静态分析：能构建过，但微信的模块系统也是静态扫 require 决定哪些文件进包的，
 *     变量它扫不到，运行时 `module 'specs/...' is not defined`。
 *
 * 替换写成一行，免得挪动行号把 sourcemap 弄歪。
 */
export function specModulesPlugin(specFiles: DiscoveredSpec[]): Plugin {
  const entries = specFiles.map(
    (f) =>
      `${JSON.stringify(`./${f.rel}.ts`)}: () => require(${JSON.stringify(
        // spec 是 entry（key `specs/<rel>`），产物就在 specs/<rel>.js；test.js 在输出根，所以恒为 `./specs/<rel>.js`。
        `./specs/${f.rel}.js`,
      )})`,
  );
  const value = `{ ${entries.join(', ')} }`;

  return {
    name: 'mini-program:spec-modules',
    generateBundle(_options: unknown, bundle: Record<string, unknown>) {
      for (const item of Object.values(bundle)) {
        const chunk = item as { type: string; code?: string };
        if (chunk.type !== 'chunk' || !chunk.code) {
          continue;
        }
        if (chunk.code.includes(MP_SPEC_MODULES)) {
          // 不用 replaceAll：builder 的 lib 还没到 es2021。
          chunk.code = chunk.code.split(MP_SPEC_MODULES).join(value);
        }
      }
    },
  };
}
