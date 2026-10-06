---
title: '工程结构与产物'
---

## 源码侧的目录约定

```tree
src/
├─ main.ts                      # app 级启动：bootstrapApplication()
├─ app.config.json              # 结构化 app 配置（appJson 选项指它）
├─ project.config.json          # 开发者工具工程配置（走 assets 或 projectConfig）
├─ styles.scss                  # 全局样式
├─ tsconfig.app.json
├─ pages/                       # 页面
│  └─ home/
│     ├─ home.component.ts
│     ├─ home.component.html
│     ├─ home.component.scss
│     ├─ home.entry.ts          # 入口：export default 组件
│     └─ home.entry.json        # 该页的小程序页面配置（可选）
├─ components/                  # 组件（不需要入口，见下）
│  └─ card/card.component.ts
├─ custom-tab-bar/              # 自定义 tabBar（目录名固定）
│  └─ index.entry.ts
└─ packageA/                    # 分包：源码目录名 = 产物目录名
   └─ pages/goods/goods.entry.ts
```

三条约定需要记住：

- **页面必须提供 `*.entry.ts`，普通组件不需要。** 页面路径是对外契约（写入 `app.json` 的
  `pages`、出现在 `navigateTo` 的 url 中），因此需要一个解析位置固定的入口。
- **入口文件名决定产物名**：`home.entry.ts` → `home-entry`。
- **分包的 root 既是源码目录也是产物目录**：`src/packageA/**` → `packageA/**`。
  分包专属 chunk 依赖该约定归位。

完整规则见 [入口：页面 / 组件 / tabBar](../../guide/entry/)。

## main.ts

小程序不存在启动组件——每个页面、每个自定义组件都由小程序运行时自行创建。
因此 `bootstrapApplication()` **不接收组件参数**，只创建 `ApplicationRef`：

```ts
import { bootstrapApplication } from 'angular-miniprogram';

bootstrapApplication();
```

页面 / 组件由各 `*.entry.ts` 的 `export default` 逐个挂载。应用级 provider
（拦截器、全局服务）通过参数传入：

```ts
bootstrapApplication({
  providers: [
    { provide: HTTP_INTERCEPTORS, multi: true, useClass: AuthInterceptor },
  ],
});
```

细节见 [启动与依赖注入](../../runtime/bootstrap/)。

## angular.json

`angular-miniprogram:application` 只有 `main` / `tsConfig` / `outputPath` 三项必填，
其中 `tsConfig` 必须覆盖到所有入口文件。全部选项见
[构建选项](../../guide/build-options/)。

## 产物结构

一次构建的输出即为可直接由开发者工具打开的小程序工程：

```tree
dist/my-mp/
├─ app.js                       # 小程序 App()：装载全局对象 + require polyfills / main
├─ app.json                     # 由 app.config.json + 构建器算出的页面清单合并而成
├─ app.wxss                     # styles 选项的全局样式
├─ main.js                      # 编译后的 main.ts
├─ polyfills.js
├─ project.config.json
├─ angular-miniprogram.js       # 共享 chunk（框架运行时）
├─ pages/home/home-entry.{js,wxml,wxss,json}
├─ components/card/card.component.{js,wxml,wxss,json}
├─ custom-tab-bar/index.{js,wxml,wxss,json}
├─ packageA/pages/goods/goods-entry.{js,wxml,wxss,json}
└─ common/format.wxs            # 模板中声明的 wxs 模块
```

每个页面包含四个文件：`js` 是逻辑层，`wxml` 是渲染层模板，`wxss` 是组件样式，
`json` 中是页面配置与 `usingComponents`。

**产物需要可读。** 默认不压缩、不带 hash，因为开发流程中开发者工具会直接查看该目录；
这两个默认值与上游不同，原因见 [构建选项](../../guide/build-options/)。

## 构建报「页面 0 个」

日志里出现

```
[小程序构建] 平台 wx，页面 0 个、组件 0 个、自定义 tabBar 0 个
```

而构建仍然「成功」，说明 `pages` 的 glob 未匹配到任何文件。构建器不会代为报错——
它无法判断预期的页面数量。需要检查 `input` 路径和 `glob`，以及入口文件是否被 `tsConfig` 覆盖。
