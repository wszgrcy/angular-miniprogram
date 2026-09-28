/**
 * http spec 用的本地 fixture 端点。
 *
 * 服务端实现在 `../../../karma.conf.js`——但**不是**另起一个 http server，
 * 而是作为一个 middleware 挂在 karma server 上，和客户端连的那个 socket
 * **共用同一个端口**。
 *
 * ## 为什么端口不写死
 *
 * 之前是两头各写一个 `9899`：服务端 `listen(9899)`、客户端 URL 里也写
 * `9899`。注释里那句「改一处必须改另一处」就是坏味道本身——而且端口被
 * 别的东西占了就直接起不来，跟测试逻辑毫无关系地失败。
 *
 * 编译期我们是能控制端口的：builder 通过 Vite 的 `define` 把
 * `KARMA_HOST` / `KARMA_PORT` 作为**编译期常量**打进产物（见
 * `src/builder/karma/jasmine-define.ts` 的 `karmaClientDefine`）。
 * 所以这里直接用它拼，端口的唯一来源就是 karma 的配置：
 *
 *   karma 配置 port  →  define 进产物  →  URL 跟着走
 *                   ↘  karma server 监听同一个端口，fixture 由中间件出
 *
 * 单一来源，没有第二份常量，也没有第二个端口要去抢。
 */

// 编译期由 Vite define 替换，不是运行时全局
declare const KARMA_HOST: string;
declare const KARMA_PORT: number;

export const FIXTURE_ARTICLES_URL = `http://${KARMA_HOST}:${KARMA_PORT}/__fixture/articles`;

/** 与 karma.conf.js 里 FIXTURE_PAYLOAD 对应的期望值 */
export const FIXTURE_ARTICLES_EXPECTED = {
  articlesCount: 2,
  firstSlug: 'hello-world',
} as const;
