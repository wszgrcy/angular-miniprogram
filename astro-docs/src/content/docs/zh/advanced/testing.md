---
title: '在小程序里跑测试'
---

单元测试跑在**真的小程序运行时里**，不是 jsdom。spec 文件被编译进一个测试小程序
产物，由开发者工具执行；宿主机上的 vitest 只负责调度和收结果，两边用 WebSocket
通信。

好处是测的就是真东西：`setData`、wxml 事件、`createSelectorQuery` 全都真的跑。
代价是要开着开发者工具。

## 1. 加一个 test target

```jsonc
// angular.json
"first": {
  "architect": {
    "test": {
      "builder": "angular-miniprogram:vitest",
      "options": {
        "main": "./projects/first/src/test.ts",
        "outputPath": "dist/vitest/first",
        "platform": "wx",
        "port": 17900,
        "clientHost": "127.0.0.1",
        "tsConfig": "projects/first/tsconfig.spec.json",
        "polyfills": ["@angular/localize/init"],
        "pages": [
          { "glob": "**/*.entry.ts", "input": "./projects/first/src/spec", "output": "pages" }
        ],
        "assets": [
          { "glob": "project.config.json", "input": "./src", "output": "./" },
          { "glob": "app.json", "input": "./projects/first", "output": "./" }
        ]
      }
    }
  }
}
```

`pages` 里放的是**测试页面的入口**——被测组件得先渲染在某个页面上，spec 才有东西可查。
这些页面跟普通页面一样写 `*.entry.ts`。

测试产物是一个独立的小程序工程，自己的 `app.json` 也得用 `assets` 放进去（它不是
`appJson` 选项生成的）。

`outputPath` 不要指向应用产物的根，`emptyOutDir` 会把应用产物一并删掉。

## 2. 引导入口

```ts
// projects/first/src/test.ts
import { bootstrapApplication } from 'angular-miniprogram';
import { startupMiniProgramTest, type TestModuleMap } from 'angular-miniprogram/vitest/runtime';

declare const __MP_SPEC_MODULES__: TestModuleMap;

async function main() {
  await bootstrapApplication();
  startupMiniProgramTest({ modules: __MP_SPEC_MODULES__ });
}

main().catch(console.error);
```

顺序有要求：**先 `bootstrapApplication`，再起 worker**。spec 里 import 的组件要能
拿到已初始化的 Angular 运行时；反过来会因为宿主下发 `run` 太快而拿到半初始化的
injector。

`__MP_SPEC_MODULES__` 是构建期就地替换的占位声明，源码里只是个 `declare`。

## 3. vitest 配置

```ts
// vitest.config.mts
import { miniProgramVitest } from 'angular-miniprogram/vitest';
import { defineConfig } from 'vitest/config';

const port = Number(process.env.MP_VITEST_PORT ?? 17900);

export default defineConfig({
  plugins: [miniProgramVitest({ port, connectTimeout: 20_000 })],
  test: {
    include: ['projects/first/src/spec/**/*.spec.ts'],
    // 设备端是一个常驻运行环境，串行跑，别并发抢同一个 slot
    maxWorkers: 1,
    isolate: false,
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
```

**端口两边必须一致**：`angular.json` 的 `port` 和 `miniProgramVitest({ port })`
是同一个数，不一致的表现是「永远连不上」。

`clientHost` 默认 `127.0.0.1`（微信模拟器解不了 `localhost`）。真机调试要改成
开发机的局域网 IP。

## 4. 跑

```bash
ng run first:test     # 只把 spec 编成测试产物
npx vitest run        # 起 WS，等设备连入
```

然后用微信开发者工具打开 `dist/vitest/first`，小程序会连回 vitest 开始跑。

模板里带了一键脚本，把上面三步串起来（含开发者工具 CLI 预检、开项目、透传退出码）：

```bash
npm run test:wechat
```

前置条件：开发者工具已启动，且「设置 → 安全设置 → 服务端口」已开启。

## 5. 写 spec

spec 跑在小程序里，所以 `wx` / `getCurrentPages()` 这些全局直接可用，DOM 不可用。
`describe` / `it` / `expect` 是全局的（插件默认 `registerApiGlobally`）。

```ts
import { ComponentFinderService } from 'angular-miniprogram';

const TARGET_PAGE = '/pages/first/first-test-component-entry';

async function pageContext() {
  const page = getCurrentPages()[0];
  const vm = (page as any).__ngComponentInstance as FirstTestComponent;
  const finder = (page as any).__ngComponentInjector.get(ComponentFinderService);
  return { vm, finder };
}

describe('首页', () => {
  it('计数 +1', async () => {
    const { vm } = await pageContext();
    expect(vm.count()).toBe(0);
    vm.inc();
    expect(vm.count()).toBe(1);
  });
});
```

几个反复要用的手法：

**等 Angular 实例挂上。** 页面实例是异步挂到小程序页面对象上的，「已经在目标页」
不代表挂好了，直接读会拿到 `undefined`。轮询等：

```ts
async function waitFor<T>(what: string, read: () => T | undefined, timeout = 8000) {
  const started = Date.now();
  for (;;) {
    const v = read();
    if (v) return v;
    if (Date.now() - started > timeout) throw new Error(`${what} 超时`);
    await new Promise((r) => setTimeout(r, 50));
  }
}
```

**跳页面。** `wx.onAppRoute` 是事件流，不重发历史，**必须先订阅再跳转**，
否则那个 `await` 会一直挂到 `hookTimeout`：

```ts
const loaded = waitLoad().pipe(filter((r) => r.openType === 'reLaunch'), take(1)).toPromise();
await new Promise((res, rej) => wx.reLaunch({ url: TARGET_PAGE, success: res, fail: rej }));
await loaded;
```

**派发事件。** wxml 上的 `bind:tap="bindEvent"` 就是页面实例的 `bindEvent`，
它拿 `event.type` 去查 Angular 侧注册的监听名。所以读一次节点 dataset 再调它，
能跑完「wxml 事件名 → bindEvent → Angular listener」整条链：

```ts
async function dispatchTap(page: any, selector: string, type = 'tap') {
  const dataset = await nodeDataset(page, selector);
  page.bindEvent({ type, currentTarget: { dataset } });
}
```

**量节点。** 拿 Angular 实例对应的小程序组件实例，再 `createSelectorQuery`：

```ts
const wxComponent = await finder.get(vm.child);   // Promise，不是 Observable
const rect = await boundingRect(wxComponent, '.lib-first');
expect(rect.height).toBeGreaterThan(0);
```

## 6. 类型检查用的 tsconfig

构建工程与检查工程必须分开。`tsc -b` 要求被引用的工程 `composite: true`，
而构建插件对非 lib 构建强制 `declaration: false`，两者在同一个文件里摆不下。
所以模板的做法是：构建配置（`tsconfig.spec.json`）保持干净，类型检查另开一个
`tsconfig.spec.check.json`（带 `composite`），根 `tsconfig.json` 里 `references` 它。
新加工程时记得在这里补一行，否则它不在任何类型检查范围内。
