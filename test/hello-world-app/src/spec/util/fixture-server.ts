/**
 * 本地 fixture HTTP 服务的地址。
 *
 * 服务端实现在 `../../../karma.conf.js`（起在 127.0.0.1:9899）。
 * 两边端口要一致，改一处必须改另一处。
 *
 * ## 为什么不用外部 API
 *
 * http spec 原来挨的是 `https://api.realworld.io/api/articles`。
 * 那个域名现在返 **HTTP 530**（Cloudflare「源站不在」，宿主机
 * `curl` 同样 530），测试会长期红，而库的 http 适配层其实没问题。
 *
 * 更根本的是：外部端点不是测试可以依赖的东西——墙、限流、证书过期、
 * 对方改版，任何一个都会让一个完全正常的适配层表现为失败。
 *
 * 本地起服务后，请求仍然是真的 `wx.request` → 127.0.0.1，
 * **适配层链路一字不变**，只是响应可控、可重复。
 *
 * ## 前置条件
 *
 * `project.config.json` 里必须 `setting.urlCheck: false`，否则开发者
 * 工具会拦非白名单域名（本地 http 也拦）。
 */
export const FIXTURE_PORT = 9899;

export const FIXTURE_ARTICLES_URL = `http://127.0.0.1:${FIXTURE_PORT}/__fixture/articles`;

/** 与 karma.conf.js 里 FIXTURE_PAYLOAD 对应的期望值 */
export const FIXTURE_ARTICLES_EXPECTED = {
  articlesCount: 2,
  firstSlug: 'hello-world',
} as const;
