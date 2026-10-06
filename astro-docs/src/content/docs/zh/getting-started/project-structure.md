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

三条约定值得记住：

- **页面必须有 `*.entry.ts`，普通组件不需要。** 页面路径是对外契约（进 `app.json` 的
  `pages`、出现在 `navigateTo` 的 url 里），所以得有个固定解析的入口。
- **入口文件名决定产物名**：`home.entry.ts` → `home-entry`。
- **分包的 root 既是源码目录也是产物目录**：`src/packageA/**` → `packageA/**`。
  分包专属 chunk 靠这条归位。

完整规则见 [入口：页面 / 组件 / tabBar](../../guide/entry/)。

## main.ts

小程序没有「启动组件」——每个页面、每个自定义组件都是小程序运行时自己创建的。
所以 `bootstrapApplication()` **不接收组件参数**，只创建 `ApplicationRef`：

```ts
import { bootstrapApplication } from 'angular-miniprogram';

bootstrapApplication();
```

页面 / 组件由各 `*.entry.ts` 的 `export default` 逐个挂进来。app 级 provider
（拦截器、全局服务）走参数：

```ts
bootstrapApplication({
  providers: [{ provide: HTTP_INTERCEPTORS, multi: true, useClass: AuthInterceptor }],
});
```

细节见 [启动与依赖注入](../../runtime/bootstrap/)。

## angular.json

`angular-miniprogram:application` 只有 `main` / `tsConfig` / `outputPath` 三项必填，
其中 `tsConfig` 必须覆盖到所有入口文件。全部选项见
[构建选项](../../guide/build-options/)。

## 产物长什么样

一次构建的输出就是一个可以直接被开发者工具打开的小程序工程：

```tree
dist/my-mp/
├─ app.js                       # 小程序 App()：装载全局对象 + require polyfills / main
├─ app.json                     # 由 app.config.json + 构建器算出的页面清单合并而成
├─ app.wxss                     # styles 选项的全局样式
├─ main.js                      # 你的 main.ts
├─ polyfills.js
├─ project.config.json
├─ angular-miniprogram.js       # 共享 chunk（框架运行时）
├─ pages/home/home-entry.{js,wxml,wxss,json}
├─ components/card/card.component.{js,wxml,wxss,json}
├─ custom-tab-bar/index.{js,wxml,wxss,json}
├─ packageA/pages/goods/goods-entry.{js,wxml,wxss,json}
└─ common/format.wxs            # 模板里声明过的 wxs 模块
```

每页四件套：`js` 是逻辑层，`wxml` 是渲染层模板，`wxss` 是组件样式，`json` 里是
页面配置 + `usingComponents`。

**产物是给人看的。**默认不压缩、不带 hash，因为开发流程就是开发者工具盯着这个目录；
两个默认值都跟上游不一样，原因见 [构建选项](../../guide/build-options/)。

## 构建报「页面 0 个」

日志里出现

```
[小程序构建] 平台 wx，页面 0 个、组件 0 个、自定义 tabBar 0 个
```

而构建仍然「成功」，就是 `pages` 的 glob 没匹到任何东西。构建器不会替你报错——
它不知道你到底想产几个页面。检查 `input` 路径和 `glob`，以及入口文件是否被 `tsConfig` 覆盖。
