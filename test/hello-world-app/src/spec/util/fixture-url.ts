/**
 * http spec 用的本地 fixture 端点。
 *
 * 服务端实现在 `src/builder/vitest/node/fixture-server.ts`——它挂在 vitest
 * 宿主的 WS **同一个端口**上（upgrade 走 WS，普通请求走 fixture），
 * 所以端口只有一个来源。
 *
 * ## 为什么不能另起一个端口
 *
 * 以前是两头各写一个 `9899`：服务端 `listen(9899)`、客户端 URL 里也写
 * `9899`。注释里那句「改一处必须改另一处」就是坏味道本身——而且端口被
 * 别的东西占了就直接起不来，跟测试逻辑毫无关系地失败。
 *
 * 编译期宿主端口是已知的：builder 通过 Vite 的 `define` 把
 * `MP_VITEST_HOST` / `MP_VITEST_PORT` 作为**编译期常量**打进产物
 * （见 `src/builder/vitest/node/options.ts` 的 `miniProgramVitestDefine`）。
 * 所以这里直接用它拼：
 *
 *   vitest 宿主 port → define 进产物 → URL 跟着走
 *                   ↘ 宿主在同一端口上同时出 WS 和 fixture
 */

// 编译期由 Vite define 替换，不是运行时全局
declare const MP_VITEST_HOST: string;
declare const MP_VITEST_PORT: number;

export const FIXTURE_ARTICLES_URL = `http://${MP_VITEST_HOST}:${MP_VITEST_PORT}/__fixture/articles`;

/** 与 fixture-server.ts 里 FIXTURE_ARTICLES_PAYLOAD 对应的期望值 */
export const FIXTURE_ARTICLES_EXPECTED = {
  articlesCount: 2,
  firstSlug: 'hello-world',
} as const;
