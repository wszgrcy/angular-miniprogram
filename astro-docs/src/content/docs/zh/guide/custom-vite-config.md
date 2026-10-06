---
title: "自定义 vite 配置"
---

构建器把 vite 配置组装好了才交给 vite，普通选项覆盖不到的时候（加个插件、
加条 alias、改个 `build` 细节），用 `viteConfig` 把那份配置接出来自己改。

> **你拿到的就是最终那份。** 构建器组装完 → 交给你的钩子 → 交给 vite。
> 中间没有第二次加工，也没有「哪些字段不让改」的清单。

## 1. 为什么是一段函数，而不是 angular.json 里的一段配置

angular.json 是 JSON，装不下函数。所以自定义走**文件**：选项写路径，文件里
默认导出一个 `(config, ctx) => config`。

```jsonc
// angular.json
{
  "options": {
    "tsConfig": "src/tsconfig.app.json",
    "viteConfig": "tools/mp.vite.ts"
  }
}
```

```ts
// tools/mp.vite.ts
import { defineMpViteConfig } from 'angular-miniprogram/builder';

export default defineMpViteConfig((config, ctx) => {
  config.plugins ??= [];
  config.plugins.push(unocss());
  config.define = { ...config.define, __BUILD_TIME__: JSON.stringify(Date.now()) };
  return config;
});
```

`defineMpViteConfig` 只做一件事：让 `config` / `ctx` 的类型推出来。不想引它
也行，`export default ((config) => { ...}) satisfies MpViteConfigHook` 等价。

## 2. 两个 target，两个文件

`application`（构建）和 `vitest`（测试产物构建）都有 `viteConfig`，**各指各的
文件**：测试链路不一定存在，没必要把两个钩子塞进一份文件。

```jsonc
{
  "projects": {
    "app": {
      "targets": {
        "build": { "options": { "viteConfig": "tools/mp.vite.ts" } },
        "test": { "options": { "viteConfig": "tools/mp.test.vite.ts" } }
      }
    }
  }
}
```

同一个文件被两个 target 共用也可以，用 `ctx.target` 分支。

## 3. `ctx` 里有什么

| 字段 | 含义 |
| --- | --- |
| `target` | `'application'` \| `'vitest'`，哪个 builder 在跑 |
| `platform` | 目标平台，取值同 `platform` 选项 |
| `isProduction` | 是否 production（由 `optimization` 推出） |
| `mode` | vite 的 mode：`production` / `development` |
| `workspaceRoot` | 工作区根目录（绝对路径） |
| `configPath` | 本钩子文件的绝对路径 |
| `logger` | `info` / `warn` / `error`，输出进构建日志 |

这些信息在 config 里看不出来（`define` 已经展开成字符串了），按平台或按
production 分支时靠它们。

## 4. 返回值规则

| 你写的 | 生效的是 |
| --- | --- |
| `return config`（改过的原对象） | 它 |
| 只就地改、`return` 都不写 | 原对象（已带上你的改动） |
| `return { ...config, xxx }` | 你新建的那份 |
| 返回 `42` / 字符串之类 | 直接报错，不会静默忽略 |

钩子可以是 `async`。

## 5. 文件类型

`.ts` / `.mts` / `.cts` / `.tsx` 由 [jiti](https://npmjs.com/package/jiti) 加载，
`.js` / `.mjs` / `.cjs` 走原生 `import`（这类工程连 jiti 都不需要）。CJS 的
`module.exports = (config) => config` 也认。

钩子文件里可以用工程 tsconfig 的 `paths` 别名（构建器把 `tsConfig` 交给了
jiti），所以 `@app/xxx` 这种写法照常能解析。

## 6. 常见写法

```ts
import { defineMpViteConfig } from 'angular-miniprogram/builder';

export default defineMpViteConfig((config, ctx) => {
  // 加插件
  config.plugins ??= [];
  config.plugins.push(myPlugin());

  // 加 alias（构建器已经放了平台替换与 tsconfig paths，追加即可）
  config.resolve ??= {};
  config.resolve.alias = [
    ...(config.resolve.alias ?? []),
    { find: '@mock', replacement: new URL('./mock', import.meta.url).pathname },
  ];

  // 加 define（平台那几个键别动，动了运行时直接崩）
  config.define = { ...config.define, __MOCK__: String(ctx.platform === 'wx') };

  // 改 build 细节
  config.build = { ...config.build, chunkSizeWarningLimit: 900 };

  // 按平台 / 按 production 分支
  if (ctx.isProduction) {
    config.logLevel = 'warn';
  }
});
```

## 7. watch

`watch` 模式下钩子文件本身在监听列表里，改完就重建。钩子里再 `import` 的
本地文件不在列表里，那种文件改了重启构建即可（钩子文件一般就十几行，
直接写在里面更省事）。

## 8. 一个能跑的实例

本仓库的测试工程就挂着这个钩子，`test/hello-world-app`：

| 文件 | 作用 |
| --- | --- |
| `tools/mp.vite.ts` | 钩子本体：`ctx.logger` 打一行、加一个 define `__MP_HOOK_TAG__`、挂个插件往产物里落 `mp-hook-marker.txt` |
| `src/pages-demo/demo/demo.component.ts` | 一个真页面，`tag = __MP_HOOK_TAG__` —— 用来在产物里验 define 真的被替换了 |
| `angular.json` 的 `build.options` | `viteConfig` 指向钩子，`pages` 多一条 `./src/pages-demo` |

```bash
cd test/hello-world-app && npx ng run app:build
```

别只看「构建成功」，**得看制品**。这个例子把钩子的效果做成了可验的三处：

```bash
# 1. 日志：钩子跑了
grep "已应用" <<<"$(npx ng run app:build 2>&1)"

# 2. 插件产物
cat dist/app/mp-hook-marker.txt        # target=application platform=wx production=false

# 3. define 被替换成了字面量（不是残留的标识符）
grep -o 'tag = "application-wx"' dist/app/pages/demo/demo-entry.js
```

一个正常的小程序产物至少长这样（每页四件套 + 全局四件）：

```
dist/app/pages/demo/demo-entry.js      # 里面应有 ɵɵdefineComponent / bootstrapPage
dist/app/pages/demo/demo-entry.wxml
dist/app/pages/demo/demo-entry.wxss
dist/app/pages/demo/demo-entry.json    # usingComponents
dist/app/app.js  app.json  app.wxss  main.js  polyfills.js  project.config.json
```

日志里 `页面 0 个、组件 0 个` 而构建又「成功」，就是产物为空的典型信号 ——
`pages` 的 glob 没匹到东西，构建器不会替你报错。

## 9. 边界

构建器**不校验**钩子改了什么。默认配置是构建器自己组装的、能跑的那份；
钩子里把 `build.outDir`、入口、`output.format` 这些改坏了，报错会落在
vite / rolldown 那一层，由钩子自己负责。

排查的抓手是构建日志里这一行：

```
自定义 vite 配置已应用：/abs/path/tools/mp.vite.ts
```

它出现说明钩子跑了；没出现说明路径没配或没配到这个 target。钩子自己抛错时，
错误信息也以这个路径开头。
