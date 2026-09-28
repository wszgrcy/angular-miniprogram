// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

/**
 * 本地 fixture 响应体。
 *
 * 为什么要有这个东西：http spec 原来直接打 `api.realworld.io`。
 * 那个域名现在返 **HTTP 530**（Cloudflare「源站不在」，本机 curl 也一样），
 * 跟小程序、跟库的 http 适配层都无关，但测试会一直红。而且
 * 外部端点本来就不是测试可以依赖的东西：墙、限流、证书、
 * 对方改版，都会让一个完全正常的适配层表现为失败。
 *
 * 本地出响应，请求仍然真的走 `wx.request` → 127.0.0.1，
 * 适配层链路一字不变，只是响应可控、可重复。
 *
 * 需 `project.config.json` 里 `urlCheck: false`，否则开发者工具会拦
 * 非白名单域名（连本地 http 也拦）。
 *
 * ## 为什么挂在 karma server 上，而不是另起一个 http server
 *
 * 另起服务就得自己定端口，于是出现「**两端各写死一个端口**」：
 * 服务端 listen(9899)，客户端 URL 里也写 9899，改一处必须改另一处。
 * 而且端口被占就得起不来。
 *
 * karma 自己就跑了个 HTTP server，客户端本来就靠 `KARMA_PORT`（编译期
 * 由 builder 的 `define` 打进产物）连它的 socket。把 fixture 做成一个
 * middleware 插进去，就**共用同一个端口**：
 *
 *   - 端口只有一个，且是编译期注入的，不存在两头手工对齐
 *   - 少一个端口 = 少一个可能被占的资源
 *
 * karma 的 `plugin.resolve` 支持内联插件对象（`helper.isObject(plugin)`
 * 直接 push），`beforeMiddleware` 就是给这种「插到标准栈前面」用的。
 */
const FIXTURE_PAYLOAD = {
  articles: [
    {
      slug: 'hello-world',
      title: 'Hello World',
      tagList: ['demo'],
      favoritesCount: 1,
    },
    { slug: 'second', title: 'Second', tagList: ['test'], favoritesCount: 2 },
  ],
  articlesCount: 2,
};

/** 内联 karma 插件：只认 /__fixture/*，其余原样放行给后面的中间件。 */
const fixtureMiddlewarePlugin = {
  'middleware:fixture': [
    'factory',
    function fixtureFactory() {
      return function fixtureMiddleware(req, res, next) {
        if (req.url && req.url.indexOf('/__fixture/articles') === 0) {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify(FIXTURE_PAYLOAD));
          return;
        }
        next();
      };
    },
  ],
};

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['@angular-devkit/build-angular'],
    plugins: [
      // require('karma-coverage'),
      // 走包名而不是相对路径：fixture 的 node_modules/angular-miniprogram
      // 指向上层 dist，跟外部使用者拿到的产物一致
      require('angular-miniprogram/karma/plugin'),
      fixtureMiddlewarePlugin,
    ],
    // 插在 karma 标准中间件之前，先截 fixture 请求
    beforeMiddleware: ['fixture'],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true, // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/ng13-demo'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['miniprogram'],
    singleRun: false,
    restartOnFileChange: true,
    captureTimeout: 300_000,
  });
};
