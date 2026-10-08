import type { IncomingMessage, ServerResponse } from 'http';

/**
 * http spec 用的本地 fixture。小程序里跑的是真 `wx.request`，所以必须有个真的 HTTP 端点；
 * 但内容要可控，否则外部域名一挂测试就长期红且与代码无关。
 *
 * 挂在 vitest 宿主的同一个端口上：WS 走 upgrade，普通 HTTP 请求走这里，
 * 端口的唯一来源就是 `MP_VITEST_PORT`，没有第二个常量要同步。
 */
export const FIXTURE_ARTICLES_PAYLOAD = {
  articles: [
    {
      slug: 'hello-world',
      title: 'Hello',
      tagList: ['demo'],
      favoritesCount: 1,
    },
    {
      slug: 'second',
      title: 'Second',
      tagList: ['test'],
      favoritesCount: 2,
    },
  ],
  articlesCount: 2,
};

/**
 * 只认 `/__fixture/articles`，其余返回 false 让调用方继续按 WS 处理。返回 true 表示这次请求已经被消费掉。
 */
export function tryServeFixture(
  req: IncomingMessage,
  res: ServerResponse,
): boolean {
  const url = req.url ?? '';
  if (!url.startsWith('/__fixture/articles')) {
    return false;
  }
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(FIXTURE_ARTICLES_PAYLOAD));
  return true;
}
