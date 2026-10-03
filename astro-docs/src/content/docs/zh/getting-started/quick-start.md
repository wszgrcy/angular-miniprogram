---
title: "快速开始"
---

本页演示从零跑通一个 Angular 小程序项目。

## 1. 准备工程

在 `angular.json` 里把构建器切换成本项目的 `mini-program` 构建器，并声明页面与组件入口：

```json
{
  "projects": {
    "app": {
      "architect": {
        "build": {
          "builder": "angular-miniprogram:application",
          "options": {
            "tsConfig": "src/tsconfig.app.json",
            "outputPath": "dist/app",
            "pages": ["src/app/pages/**/*.entry.ts"],
            "platform": "wx"
          }
        }
      }
    }
  }
}
```

## 2. 写一个页面

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-hello',
  standalone: true,
  template: `<view class="hello">{{name}}</view>`,
})
export class HelloPage {
  name = 'Hello';
}
```

入口文件 `hello.entry.ts` 只声明「这个入口是哪个组件」：

```ts
export { HelloPage as default } from './hello.component';
```

`bootstrapPage` / `componentRegistry` 由构建器按入口来源（`pages` 里的是页面，
其余都是组件）自动注入，用户代码里不需要出现框架 API。详见[入口：页面 / 组件 / tabBar](../../guide/entry/)。

## 3. 构建

```bash
ng build
```

产物目录里可以看到小程序工程结构：`app.js` / `app.json` / `pages/hello/hello.wxml` 等。用微信开发者工具打开产物目录即可预览。

---

下一步可以继续查看各平台差异与库构建的说明（待补充）。
