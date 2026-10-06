---
title: '在小程序中运行测试'
---

单元测试运行在**真实的小程序运行时**中，而非 jsdom。spec 文件被编译进测试小程序
产物，由开发者工具执行；宿主机上的 vitest 只负责调度与收集结果，两侧通过 WebSocket
通信。

收益在于测试对象是真实实现：`setData`、wxml 事件、`createSelectorQuery` 都会真实执行。
代价是需要运行开发者工具。

## 1. 添加 test target

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

`pages` 中放置的是**测试页面的入口**——被测组件需要先渲染在某个页面上，spec 才有
可查询的对象。这些页面与普通页面一样书写 `*.entry.ts`。

测试产物是独立的小程序工程，其 `app.json` 同样需要通过 `assets` 放入（不由
`appJson` 选项生成）。

`outputPath` 不应指向应用产物的根目录，`emptyOutDir` 会把应用产物一并删除。

## 2. 引导入口

```ts
// projects/first/src/test.ts
import { bootstrapApplication } from 'angular-miniprogram';
import {
  startupMiniProgramTest,
  type TestModuleMap,
} from 'angular-miniprogram/vitest/runtime';

declare const __MP_SPEC_MODULES__: TestModuleMap;

async function main() {
  await bootstrapApplication();
  startupMiniProgramTest({ modules: __MP_SPEC_MODULES__ });
}

main().catch(console.error);
```

顺序有要求：**先 `bootstrapApplication`，再启动 worker**。spec 中 import 的组件需要能
获取已初始化的 Angular 运行时；顺序颠倒时，宿主下发 `run` 过快会导致读取到未完全
初始化的 injector。

`__MP_SPEC_MODULES__` 是构建期就地替换的占位声明，源码中仅有 `declare`。

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
    // 设备端是一个常驻运行环境，串行执行，避免并发抢占同一个 slot
    maxWorkers: 1,
    isolate: false,
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
```

**两侧端口必须一致**：`angular.json` 的 `port` 与 `miniProgramVitest({ port })`
必须是同一个值，不一致时的表现是始终无法连接。

`clientHost` 默认 `127.0.0.1`（微信模拟器无法解析 `localhost`）。真机调试时需要改成
开发机的局域网 IP。

## 4. 执行

```bash
ng run first:test     # 仅将 spec 编译为测试产物
npx vitest run        # 启动 WS，等待设备接入
```

随后用微信开发者工具打开 `dist/vitest/first`，小程序会连回 vitest 并开始执行。

模板提供了一键脚本，将上述三步串联（含开发者工具 CLI 预检、打开项目、透传退出码）：

```bash
npm run test:wechat
```

前置条件：开发者工具已启动，且「设置 → 安全设置 → 服务端口」已开启。

## 5. 编写 spec

spec 运行在小程序中，因此 `wx` / `getCurrentPages()` 等全局对象直接可用，DOM 不可用。
`describe` / `it` / `expect` 是全局的（插件默认 `registerApiGlobally`）。

```ts
import { ComponentFinderService } from 'angular-miniprogram';

const TARGET_PAGE = '/pages/first/first-test-component-entry';

async function pageContext() {
  const page = getCurrentPages()[0];
  const vm = (page as any).__ngComponentInstance as FirstTestComponent;
  const finder = (page as any).__ngComponentInjector.get(
    ComponentFinderService,
  );
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

以下几种常用手法：

**等待 Angular 实例挂载。** 页面实例是异步挂载到小程序页面对象上的，已在目标页面
不代表挂载完成，直接读取会得到 `undefined`。需要轮询等待：

```ts
async function waitFor<T>(
  what: string,
  read: () => T | undefined,
  timeout = 8000,
) {
  const started = Date.now();
  for (;;) {
    const v = read();
    if (v) return v;
    if (Date.now() - started > timeout) throw new Error(`${what} 超时`);
    await new Promise((r) => setTimeout(r, 50));
  }
}
```

**页面跳转。** `wx.onAppRoute` 是事件流，不会重发历史，**必须先订阅再跳转**，
否则对应的 `await` 会一直挂起到 `hookTimeout`：

```ts
const loaded = waitLoad()
  .pipe(
    filter((r) => r.openType === 'reLaunch'),
    take(1),
  )
  .toPromise();
await new Promise((res, rej) =>
  wx.reLaunch({ url: TARGET_PAGE, success: res, fail: rej }),
);
await loaded;
```

**派发事件。** wxml 上的 `bind:tap="bindEvent"` 即页面实例的 `bindEvent`，
它以 `event.type` 查找 Angular 侧注册的监听名。因此读取一次节点 dataset 再调用它，
即可走完 wxml 事件名 → bindEvent → Angular listener 整条链路：

```ts
async function dispatchTap(page: any, selector: string, type = 'tap') {
  const dataset = await nodeDataset(page, selector);
  page.bindEvent({ type, currentTarget: { dataset } });
}
```

**查询节点。** 获取 Angular 实例对应的小程序组件实例，再 `createSelectorQuery`：

```ts
const wxComponent = await finder.get(vm.child); // Promise，不是 Observable
const rect = await boundingRect(wxComponent, '.lib-first');
expect(rect.height).toBeGreaterThan(0);
```

## 6. 类型检查用的 tsconfig

构建工程与检查工程必须分开。`tsc -b` 要求被引用的工程 `composite: true`，
而构建插件对非 lib 构建强制 `declaration: false`，两者无法共存于同一个文件。
因此模板的做法是：构建配置（`tsconfig.spec.json`）保持简洁，类型检查另建
`tsconfig.spec.check.json`（带 `composite`），并在根 `tsconfig.json` 中 `references` 它。
新增工程时需要在此补充一行，否则该工程不在任何类型检查范围内。
