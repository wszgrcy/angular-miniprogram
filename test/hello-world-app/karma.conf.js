// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const http = require('http');

/**
 * 本地 fixture HTTP 服务。
 *
 * 为什么要有这个东西：http spec 原来直接挨 `api.realworld.io`。
 * 那个域名现在返 **HTTP 530**（Cloudflare “源站不在”，本机 curl 也一样），
 * 跟小程序、跟库的 http 适配层都无关，但测试会一直红。而且
 * 外部端点本来就不是测试可以依赖的东西：墙、限流、证书、
 * 对方改版，都会让一个完全正常的适配层表现为失败。
 *
 * 本地起一个服务，把请求真的发出去（走 wx.request → 127.0.0.1），
 * 适配层链路完全不变，但响应可控、可重复。
 *
 * 需 `project.config.json` 里 `urlCheck: false`，否则开发者工具会拦
 * 非白名单域名（连本地 http 也拦）。
 */
const FIXTURE_PORT = 9899;
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

let fixtureServer = null;

function startFixtureServer() {
  if (fixtureServer) return fixtureServer;
  fixtureServer = http.createServer((req, res) => {
    if (req.url && req.url.indexOf('/__fixture/articles') === 0) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify(FIXTURE_PAYLOAD));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found', url: req.url }));
  });
  fixtureServer.listen(FIXTURE_PORT, '127.0.0.1');
  // 不让它把进程挂住；退出时尽量收掉
  fixtureServer.unref();
  process.on('exit', () => {
    try {
      fixtureServer.close();
    } catch (e) {
      /* 己退，忽略 */
    }
  });
  return fixtureServer;
}

startFixtureServer();

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['@angular-devkit/build-angular'],
    plugins: [
      // require('karma-coverage'),
      // 走包名而不是相对路径：fixture 的 node_modules/angular-miniprogram
      // 是个 junction，指向上层 dist，跟外部使用者拿到的产物一致
      require('angular-miniprogram/karma/plugin'),
    ],
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
    beforeExit: function (done) {
      if (fixtureServer) {
        fixtureServer.close();
        fixtureServer = null;
      }
      done();
    },
  });
};
