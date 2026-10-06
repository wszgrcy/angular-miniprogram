---
title: '自定义 vite 配置'
---

构建器完成 vite 配置组装后才交给 vite。当普通选项无法覆盖需求时（新增插件、
新增 alias、调整 `build` 细节），可以通过 `viteConfig` 获取该配置并自行修改。

> **钩子接收到的就是最终配置。** 构建器组装完成 → 交给钩子 → 交给 vite。
> 中间不存在第二次加工，也没有禁止修改的字段清单。

## 1. 形式：函数而非配置对象

angular.json 是 JSON，无法承载函数。因此自定义能力以**文件**为入口：选项里写路径，
文件里默认导出一个 `(config, ctx) => config`。

```jsonc
// angular.json
{
  "options": {
    "tsConfig": "src/tsconfig.app.json",
    "viteConfig": "tools/mp.vite.ts",
  },
}
```

```ts
// tools/mp.vite.ts
import { defineMpViteConfig } from 'angular-miniprogram/builder';

export default defineMpViteConfig((config, ctx) => {
  config.plugins ??= [];
  config.plugins.push(unocss());
  config.define = {
    ...config.define,
    __BUILD_TIME__: JSON.stringify(Date.now()),
  };
  return config;
});
```

`defineMpViteConfig` 只用于推导 `config` / `ctx` 的类型。不使用它也可以，
`export default ((config) => { ... }) satisfies MpViteConfigHook` 与之等价。

## 2. 两个 target，两个文件

`application`（构建）和 `vitest`（测试产物构建）都有 `viteConfig`，**分别指向各自的
文件**：测试链路不一定存在，将两个钩子写在同一份文件中并无收益。

```jsonc
{
  "projects": {
    "app": {
      "targets": {
        "build": { "options": { "viteConfig": "tools/mp.vite.ts" } },
        "test": { "options": { "viteConfig": "tools/mp.test.vite.ts" } },
      },
    },
  },
}
```

两个 target 也可以共用同一个文件，通过 `ctx.target` 分支处理。

## 3. `ctx` 里有什么

| 字段            | 含义                                              |
| --------------- | ------------------------------------------------- |
| `target`        | `'application'` \| `'vitest'`，当前执行的 builder |
| `platform`      | 目标平台，取值同 `platform` 选项                  |
| `isProduction`  | 是否 production（由 `optimization` 推出）         |
| `mode`          | vite 的 mode：`production` / `development`        |
| `workspaceRoot` | 工作区根目录（绝对路径）                          |
| `configPath`    | 本钩子文件的绝对路径                              |
| `logger`        | `info` / `warn` / `error`，输出进构建日志         |

这些信息无法从 config 中读出（`define` 已展开为字符串），按平台或按 production
分支时需要依赖它们。

## 4. 返回值规则

| 钩子写法                          | 生效结果               |
| --------------------------------- | ---------------------- |
| `return config`（修改过的原对象） | 它                     |
| 仅就地修改、不写 `return`         | 原对象（已包含修改）   |
| `return { ...config, xxx }`       | 新建的对象             |
| 返回 `42` / 字符串等非对象值      | 直接报错，不会静默忽略 |

钩子可以是 `async`。

## 5. 文件类型

`.ts` / `.mts` / `.cts` / `.tsx` 由 [jiti](https://npmjs.com/package/jiti) 加载，
`.js` / `.mjs` / `.cjs` 由原生 `import` 加载（无需 jiti）。CJS 形式的
`module.exports = (config) => config` 同样支持。

钩子文件中可以使用工程 tsconfig 的 `paths` 别名（构建器已将 `tsConfig` 传递给
jiti），因此 `@app/xxx` 一类写法可以正常解析。

## 6. 常见写法

```ts
import { defineMpViteConfig } from 'angular-miniprogram/builder';

export default defineMpViteConfig((config, ctx) => {
  // 新增插件
  config.plugins ??= [];
  config.plugins.push(myPlugin());

  // 新增 alias（构建器已写入平台替换与 tsconfig paths，直接追加即可）
  config.resolve ??= {};
  config.resolve.alias = [
    ...(config.resolve.alias ?? []),
    { find: '@mock', replacement: new URL('./mock', import.meta.url).pathname },
  ];

  // 新增 define（平台相关的几个键不要修改，否则运行时会直接报错）
  config.define = { ...config.define, __MOCK__: String(ctx.platform === 'wx') };

  // 调整 build 细节
  config.build = { ...config.build, chunkSizeWarningLimit: 900 };

  // 按平台 / 按 production 分支
  if (ctx.isProduction) {
    config.logLevel = 'warn';
  }
});
```

## 7. watch

`watch` 模式下钩子文件本身位于监听列表中，修改后会触发重建。钩子内 `import`
的本地文件不在监听列表中，修改这类文件需要重启构建（钩子文件通常只有十余行，
直接写在钩子文件内更简便）。

## 8. 完整示例

本仓库的测试工程附带了该钩子，位于 `test/hello-world-app`：

| 文件                                    | 作用                                                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `tools/mp.vite.ts`                      | 钩子本体：`ctx.logger` 输出一行、新增一个 define `__MP_HOOK_TAG__`、挂载一个插件向产物写入 `mp-hook-marker.txt` |
| `src/pages-demo/demo/demo.component.ts` | 一个真实页面，`tag = __MP_HOOK_TAG__`，用于在产物中验证 define 已被替换                                         |
| `angular.json` 的 `build.options`       | `viteConfig` 指向钩子，`pages` 多一条 `./src/pages-demo`                                                        |

```bash
cd test/hello-world-app && npx ng run app:build
```

仅确认「构建成功」并不足够，**需要检查产物**。该示例把钩子的效果体现在三处可验证的
位置：

```bash
# 1. 日志：钩子已执行
grep "已应用" <<<"$(npx ng run app:build 2>&1)"

# 2. 插件产物
cat dist/app/mp-hook-marker.txt        # target=application platform=wx production=false

# 3. define 已被替换为字面量（而非残留的标识符）
grep -o 'tag = "application-wx"' dist/app/pages/demo/demo-entry.js
```

一个正常的小程序产物至少包含以下内容（每页四个文件 + 全局文件）：

```
dist/app/pages/demo/demo-entry.js      # 里面应有 ɵɵdefineComponent / bootstrapPage
dist/app/pages/demo/demo-entry.wxml
dist/app/pages/demo/demo-entry.wxss
dist/app/pages/demo/demo-entry.json    # usingComponents
dist/app/app.js  app.json  app.wxss  main.js  polyfills.js  project.config.json
```

日志中出现 `页面 0 个、组件 0 个` 而构建仍然「成功」，是产物为空的典型信号——
`pages` 的 glob 未匹配到任何文件，构建器不会代为报错。

## 9. 使用限制

构建器**不校验**钩子的修改内容。默认配置由构建器组装且可正常工作；若在钩子中
改坏了 `build.outDir`、入口或 `output.format` 等字段，报错会出现在 vite / rolldown
那一层，责任归属于钩子本身。

排查时应关注构建日志中的这一行：

```
自定义 vite 配置已应用：/abs/path/tools/mp.vite.ts
```

该行出现说明钩子已执行；未出现说明路径未配置或未作用于当前 target。钩子抛出错误时，
错误信息同样以该路径开头。
