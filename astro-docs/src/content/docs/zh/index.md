---
title: 'Angular 小程序'
---

angular-miniprogram 用于以 **Angular** 的语法与工程体系开发**小程序**：
一套模板 / 样式 / 逻辑，构建期产出小程序的 `wxml / wxss / js / json`。

- **原生 Angular 工程**：`@Component`、依赖注入、模板语法、控制流
  （`@if` / `@for` / `@switch`）、`Renderer2`、`HttpClient`、`@angular/forms` 的 API
  全部可正常使用
- **构建期翻译**：模板在构建时翻译成 wxml，运行时把 Angular 的渲染结果物化成小程序
  `setData` 的数据
- **多平台**：微信、支付宝、钉钉、百度、QQ、京东、字节、快手、小红书、飞书，
  一套代码多次构建
- **组件库**：将 Angular 库编译为小程序组件库

本框架不试图抹平小程序的限制。渲染层是静态生成的，因此存在一批在浏览器中可用、
在此不可用的能力——建议先阅读 [不支持与受限的能力](getting-started/limitations/)，
可避免大部分意外。

---

## Hello World

一个页面组件：

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-hello',
  standalone: true,
  template: `<view class="hello">{{ name() }}</view>`,
})
export class HelloComponent {
  name = signal('Hello Angular Miniprogram');
}
```

在旁边放置一个入口文件，声明该路径绑定的组件（`bootstrapPage` 由构建器注入）：

```ts
// hello.entry.ts
export { HelloComponent as default } from './hello.component';
```

构建后得到的 wxml：

```html
<block wx:if="{{hasLoad}}"
  ><view class="{{nodeList[0].class}}">{{nodeList[1].value}}</view></block
>
```

模板中的 `{{name()}}` 由框架物化成 `nodeList` 上的数据，小程序侧只负责渲染这份数据。
刷新的触发时机与浏览器环境不同，见
[变更检测与状态](getting-started/change-detection/)。

## 从这里开始

- 首次搭建：[快速开始](getting-started/quick-start/)
- 已跑通，需要调整构建：[构建选项](guide/build-options/) ·
  [入口](guide/entry/) · [配置文件](guide/mp-config/)
- 编写模板：[标签映射](template/tag-mapping/) ·
  [事件修饰符](template/event/) · [内容投影](template/content-projection/)
- 调用原生能力：[小程序 API](runtime/mp-api/) ·
  [节点查询](runtime/node-query/) · [原生配置](runtime/native-options/)

## 支持的平台

| `platform` | 平台               |
| ---------- | ------------------ |
| `wx`       | 微信（含企业微信） |
| `zfb`      | 支付宝             |
| `dd`       | 钉钉               |
| `zj`       | 字节 / 抖音        |
| `bdzn`     | 百度智能           |
| `qq`       | QQ                 |
| `ks`       | 快手               |
| `xhs`      | 小红书             |
| `fs`       | 飞书               |
| `jd`       | 京东               |

差异与条件编译见 [多平台与条件编译](guide/platforms/)。
