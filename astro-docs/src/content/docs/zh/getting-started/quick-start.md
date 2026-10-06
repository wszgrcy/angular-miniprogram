---
title: '快速开始'
---

## 环境

- Node `^22.22.3 || ^24.15.0`（Angular 22 的 `engines` 要求）
- 目标平台的开发者工具（微信 / 支付宝 / 字节 …），用来打开产物目录

## 1. 获取工程

本仓库不提供 `ng new` 之类的应用脚手架，起步方式是克隆模板工程：

```bash
git clone https://github.com/wszgrcy/angular-miniprogram-template.git my-mp
cd my-mp
npm install
```

模板自带 6 个可运行示例（控制流与 signal / 组件库 / WXS / 自定义 tabBar / 分包 / 多语言），
`src/` 下的示例可以直接删除并替换为自己的页面。

模板依赖 `angular-miniprogram` 2.x。安装完成后确认版本：

```bash
npm ls angular-miniprogram
```

npm 上的 `latest` 标签可能仍停留在 1.x（webpack 构建器一代，构建选项与入口写法均不同）。
若安装到 1.x，需显式安装 2.x：`npm i angular-miniprogram@alpha`。

## 2. 构建

```bash
npm run build:lib   # 先构建示例库 first，应用从 dist/first 引它
npm run build       # 构建小程序
```

`build:lib` 不可省略：模板的 `tsconfig.base.json` 将 `first` 指向 `dist/first`，
库未构建时应用编译会找不到模块。删除示例库相关配置（`angular.json` 的 `first` 工程与 `paths`）
后即可跳过该步骤。

## 3. 预览

微信开发者工具 → 导入项目 → 目录选择 `dist/angular-miniprogram-template`，AppID 使用测试号即可。

开发时用 watch：

```bash
npm start    # ng build --watch
```

开发者工具指向同一产物目录，重新构建后会自动刷新。

## 4. 页面示例

页面就是一个普通的 standalone 组件：

```ts
// src/pages/home/home.component.ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `<view class="hello">{{ title() }}</view>`,
})
export class HomeComponent {
  title = signal('Hello Angular Miniprogram');
}
```

在旁边放置一个入口文件，仅声明该路径绑定的组件：

```ts
// src/pages/home/home.entry.ts
export { HomeComponent as default } from './home.component';
```

再放置一份同名的小程序页面配置（可选）：

```json
// src/pages/home/home.entry.json
{ "navigationBarTitleText": "首页" }
```

在 `angular.json` 中通过 glob 声明页面扫描目录：

```jsonc
{
  "projects": {
    "my-mp": {
      "architect": {
        "build": {
          "builder": "angular-miniprogram:application",
          "options": {
            "platform": "wx",
            "outputPath": "dist/my-mp",
            "main": "src/main.ts",
            "tsConfig": "src/tsconfig.app.json",
            "pages": [
              {
                "glob": "**/*.entry.ts",
                "input": "./src/pages",
                "output": "pages",
              },
            ],
          },
        },
      },
    },
  },
}
```

产物路径由入口文件名推导：`src/pages/home/home.entry.ts` → `pages/home/home-entry`。

入口、组件、自定义 tabBar 的完整规则见 [入口：页面 / 组件 / tabBar](../../guide/entry/)。

## 5. 下一步

- 工程目录与产物结构：[工程结构与产物](../project-structure/)
- 状态与刷新时机（与浏览器环境差异最大的一处）：[变更检测与状态](../change-detection/)
- 了解能力边界：[不支持与受限的能力](../limitations/)
