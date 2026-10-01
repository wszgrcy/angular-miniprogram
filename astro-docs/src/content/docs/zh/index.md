---
title: "Angular 小程序 文档"
---

Angular 小程序（angular-miniprogram）让你用 **Angular** 的语法与工程体系开发**微信小程序**，一套模板/样式/逻辑，编译期产出小程序的 `wxml / wxss / js / json`。

**核心特性：**

- **原生 Angular 工程**：`@Component`、依赖注入、模板语法、控制流（`@if` / `@for` / `@switch`）全部照常用
- **构建期翻译**：模板在构建时翻译成 wxml，运行时把 Angular 的渲染结果物化成小程序 `setData` 数据
- **多平台**：微信、支付宝、百度、QQ、京东、字节等一套代码多端产出
- **库构建**：可以把 Angular 库编译成小程序自定义组件库

---

## Hello World

一个最小的页面组件：

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-hello',
  standalone: true,
  template: `<view class="hello">{{name}}</view>`,
})
export class HelloComponent {
  name = 'Hello Angular Miniprogram';
}
```

以页面身份启动：

```ts
import { bootstrapPage } from 'angular-miniprogram';
import { HelloComponent } from './hello.component';

bootstrapPage(HelloComponent);
```

构建后得到的 wxml：

```html
<view class="hello">{{nodeList[0].value}}</view>
```

> 💡 模板里的 `{{name}}` 由框架物化成 `nodeList` 上的数据，小程序侧只负责渲染这份数据。

下一步请看 [快速开始](getting-started/quick-start/)。
