---
title: '入口：页面 / 组件 / 自定义 tabBar'
---

页面和自定义 tabBar 必须有 `*.entry.ts`；**普通组件不需要**。入口文件只做一件事：
**声明这个入口绑定哪个 Angular 组件**。小程序侧的注册调用由构建器生成。

## 1. 入口写法：`export default`

```ts
// hello.entry.ts
export { HelloPage as default } from './hello.component';
```

构建器生成的产物等价于：

```js
import * as amp from 'angular-miniprogram';
import C from './hello.component';
amp.bootstrapPage(C);
```

这一层不能省：小程序的组件身份由**文件路径**决定，`Component()` / `Page()`
必须在「那个路径的 js 被求值」时同步调用一次。组件源文件常被合并进共享
chunk，在该位置调用无法建立组件身份。

入口文件里可以照常写别的代码（副作用、常量），身份只由 `export default` 决定；
没有 `export default` 的入口直接构建失败。

页面组件声明了 `static mpComponentOptions` 时，`bootstrapPage` 默认按
`useComponent: true` 处理（那份配置只在 `Component()` 分支生效），
所以「组件即页面」不需要额外声明。那份配置单里哪些段生效见
[原生配置](../../runtime/native-options/)。

## 2. 入口类型来自配置

小程序只有两种身份：页面（在 app 配置的 `pages` 名单里）和组件。构建器按入口
**来自哪个 pattern** 决定它是什么：

| 入口来源                                       | 入口类型                                       | 构建器注入                 |
| ---------------------------------------------- | ---------------------------------------------- | -------------------------- |
| `pages`                                        | 页面                                           | `bootstrapPage(C)`         |
| `subpackages`                                  | 页面（产物落分包目录，`output` 就是分包 root） | `bootstrapPage(C)`         |
| `customTabbar`（或产物落在平台的 tabBar 目录） | 自定义 tabBar                                  | `bootstrapCustomTabbar(C)` |
| 其余入口                                       | 组件                                           | `componentRegistry(C)`     |

```json
{
  "pages": [
    { "glob": "**/*.entry.ts", "input": "./src/pages", "output": "pages" }
  ]
}
```

**组件不需要声明范围。** sourceRoot 下剩下的 `*.entry.ts` 全部按组件处理，产物路径按
sourceRoot 镜像（`src/components/foo/foo.entry.ts` → `components/foo/foo-entry`）。以下
两个条件决定哪些文件参与构建：

1. 已由 `pages` / `customTabbar` 声明的入口不重复收集；
2. **必须在 `tsConfig` 的编译单元里**——同目录下其他工程的 `*.entry.ts`
   （测试工程的 spec 入口等）会被扫描到，但它们不属于当前应用，直接跳过。

所以入口源文件必须被 `tsConfig` 的 `files` / `include` 覆盖，否则构建器读不到
它的组件声明，会直接报「不在编译范围内」。

## 3. 普通组件不需要入口

只有「路径是对外契约」的东西才需要入口：页面路径要写进 app 配置的 `pages`、要写进
`navigateTo` 的 url，必须固定解析。组件没有这个约束——它只被父级 json 里的
`usingComponents` 引用，而那个路径由构建器写入，内部保持一致即可。

所以 sourceRoot 里任何带 `@Component` 的类，只要未被任何入口声明，构建器就按
「源目录 = 产物目录」自动给它产一份组件产物：

```text
src/pages/home/card/card.component.ts
  →  pages/home/card/card.component.{js,wxml,json,wxss}
```

不需要 `*.entry.ts`，不需要 `export default`，父级的 `usingComponents` 由构建器计算。
一个文件里放多个组件时，产物名会自动附加类名以避免重名：

```text
src/pages/home/projection/projection.components.ts   # 四个组件
  →  pages/home/projection/projection.components-ProjChildComponent.{js,wxml,json,wxss}
  →  pages/home/projection/projection.components-ProjDefaultComponent.…
```

已由入口声明的组件（页面自身的组件、写了 `*.entry.ts` 的组件）不会重复产出。
**归属以文件为单位**：入口用 `export { X as default } from './y'` 指向 `y.ts` 时，
整个 `y.ts` 视为已声明，同文件内其余组件不再自动产出，构建会报

```
没有找到组件[YComponent]的产物路径：…/y.component.ts
```

将额外的组件放在同目录的另一个文件即可。

## 4. 自定义 tabBar

自定义 tabBar 的**产物**路径是平台写死的，而且各平台不一样：

| 平台             | 产物                      | app.json 开关      |
| ---------------- | ------------------------- | ------------------ |
| 微信 / QQ / 京东 | `custom-tab-bar/index`    | `tabBar.custom`    |
| 支付宝           | `customize-tab-bar/index` | `tabBar.customize` |
| 其余             | 不支持                    | —                  |

构建器按 `platform` 自动切换：产物目录、json 里的 `component: true`、以及
`app.json` 开关字段的校验都跟着平台走。平台不支持时扫到 tabBar 入口直接报错，
不会生成不会被加载的产物目录。

源目录固定是 `<sourceRoot>/custom-tab-bar`（不跟平台变，用户书写习惯统一），
要换位置才需要配 `customTabbar`，且它只说「源文件在哪」，`output` 会被平台值覆盖：

```json
"customTabbar": [
  { "glob": "**/*.entry.ts", "input": "./src/tabbar" }
]
```

入口文件名里的 `.entry` 会让位给平台写死的产物文件名 `index`：
`index.entry.ts` → `custom-tab-bar/index.js`（支付宝则是 `customize-tab-bar/index.js`）。

`app.json` 里的开关字段（`tabBar.custom` / `tabBar.customize`）由构建器按平台自动补：
产出了自定义 tabBar 组件就打开对应开关，无需手动书写。
开关为 `true` 但未产出组件时同样不报错——该开关可能来自合并进来的其他配置。
真正需要拦截的是 `tabBar.list` 里的 `pagePath` 指向不存在页面的情况，这一项照常校验。
