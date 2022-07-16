---
layout: post
title: 快速启动
---
## 设置页面匹配

- 在`angular.json`中设置要匹配的页面范围,匹配规则与 assets 相同

```json
"pages": [
  {
    "glob": "**/*.entry.ts",
    "input": "./src/pages",
    "output": "pages"
  }
]
```

- 上述配置为,在 src/pages 文件夹中,匹配`*.entry.ts`文件,并且编译完成导出在`[输出文件夹]/pages`文件夹中

## 添加一个页面

- 建立如下结构的代码

```tree
├── page1.component.html
├── page1.component.scss
├── page1.component.ts
├── page1.entry.json
├── page1.entry.ts
└── page1.module.ts
```

- 新建一个`page1.entry.ts`,输入如下

```ts
import { pageStartup } from 'angular-miniprogram';
import { Page1Component } from './page1.component';
import { Page1Module } from './page1.module';

pageStartup(Page1Module, Page1Component);
```

## 设置组件匹配

- 在`angular.json`中设置要匹配的组件范围,匹配规则与 assets 相同

```json
"components":[
         {
           "glob": "**/*.entry.ts",
           "input": "./src/components",
           "output": "components"
         }
       ]
```

## 添加一个组件

- 建立如下结构的代码

```tree
├── component1.component.html
├── component1.component.scss
├── component1.component.ts
├── component1.entry.json
├── component1.entry.ts
└── component1.module.ts
```

- 新建一个`component1.entry.ts`,输入如下

```ts
import { componentRegistry } from 'angular-miniprogram';
import { Component1Component } from './component1.component';

componentRegistry(Component1Component);
```

- 上述代码为注册为将一个普通组件注册为小程序组件
- 由于该组件的使用为自动初始化,所以使用了`注册`
