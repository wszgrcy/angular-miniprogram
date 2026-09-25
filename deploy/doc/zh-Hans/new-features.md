---
layout: post
title: 新功能配置指南
---

本文档说明本轮新增的 6 项能力**如何配置、如何调用生效**，每项都带可运行 demo。

> 前提：以下配置都写在 `angular.json` 的构建 target（`architect.build.options`）里，
> 与已有的 `pages` / `components` / `assets` 同级。平台值见 `platform` 字段：
> `wx` / `zfb`(支付宝) / `zj`(字节抖音) / `bdzn`(百度) / `qq` / `dd`(钉钉) / `jd`(京东)。

## 能力总览

| 能力 | 需要配置吗 | 开关字段 |
|---|---|---|
| 1. app.json 编译生成 | 需要 | `appJson` |
| 2. 条件编译 | 需要（引入类型声明） | `platform` + `platform-flags.d.ts` |
| 3. 分包 | 需要（写在 appJson 里） | `appJson` 的 `subpackages` |
| 4. 原生自定义组件 | 需要 | `nativeComponentsDir` |
| 5. 模板名自动推导 | 不需要（默认生效） | — |
| 6. setData 记录式优化 | 不需要（默认生效） | — |

---

## 1. app.json 编译生成

**之前**：`app.json` 是静态文件，直接拷进产物，构建器对内容零校验。
**现在**：用 `appJson` 指向一个结构化配置文件，构建时编译生成 `app.json`，并做校验。

### 配置

```json
// angular.json -> architect.build.options
{
  "platform": "wx",
  "appJson": "src/app.config.json"
}
```

### 配置文件 demo（`src/app.config.json`）

```json
{
  "pages": [
    "pages/index/index-entry",
    "pages/detail/detail-entry"
  ],
  "window": {
    "navigationBarTitleText": "我的应用",
    "navigationBarBackgroundColor": "#ffffff"
  },
  "tabBar": {
    "list": [
      { "pagePath": "pages/index/index-entry", "text": "首页" }
    ]
  },
  "lazyCodeLoading": "requiredComponents"
}
```

> 注意 `pages` 里的路径要和**实际构建产出的页面路径**一致。页面入口
> `src/pages/index/index.entry.ts` 编译后路径是 `pages/index/index-entry`
> （`*.entry.ts` → `<name>-entry`）。

### 编译期校验（配错直接构建失败，不用等开发者工具报错）

- `pages` 重复 → 报错
- `tabBar.pagePath` 不在主包 `pages` 里 → 报错（tabBar 页必须在主包）
- 分包 `root` 是绝对路径或含 `..` → 报错
- `preloadRule` 引用不存在的页面/未声明的分包 → 报错
- `appJson` 与 `assets` 里的静态 `app.json` 同时存在 → 报错（互斥，二选一）

### 逃生舱

不配 `appJson` 时，维持旧行为：`app.json` 仍可从 `assets` 静态提供。

---

## 2. 条件编译（define 方案，不用 #ifdef）

两种粒度，都不用注释指令。

### 2.1 代码级：平台布尔常量

构建时按 `platform` 注入常量，死分支被 bundler 消除（DCE），零运行时开销。

```ts
// 你的组件/服务里
if (__MP_WX__) {
  // 仅微信：构建 __MP_WX__===true，其他平台这段被整体移除
  wx.showShareMenu({ withShareTicket: true });
} else if (__MP_ZFB__) {
  // 仅支付宝
}

console.log(__MP_PLATFORM__); // "wx" / "zfb" / ...
```

可用常量：`__MP_WX__` `__MP_ZFB__` `__MP_ZJ__` `__MP_BDZN__` `__MP_QQ__` `__MP_DD__` `__MP_JD__`，加字符串 `__MP_PLATFORM__`。

**类型声明**：把框架构建的 `platform-flags.d.ts` 加入工程 tsconfig，IDE 才不报红：

```json
// tsconfig.app.json
{
  "include": [
    "**/*.d.ts",
    "node_modules/angular-miniprogram/builder/platform-flags.d.ts",
    "pages/**/*.entry.ts"
  ]
}
```

### 2.2 文件级：平台后缀变体

同一目录下放 `foo.ts` 和 `foo.wx.ts`，构建 wx 平台时自动取 `foo.wx.ts`，其他平台取 `foo.ts`。

```tree
src/shared/
├── share.service.ts        // 默认实现
└── share.service.wx.ts     // 微信专用（构建 platform=wx 时生效）
```

```ts
// 任何地方照常 import，构建时自动选变体
import { ShareService } from './share.service';
```

> 变体后缀就是平台值：`foo.zfb.ts` / `foo.zj.ts` / `foo.bdzn.ts` ...

---

## 3. 分包

分包配置写在 `appJson` 指向的配置里。**约定：分包 `root` 同时是源码目录与产物目录**，即 `src/<root>/` 的源码编译后落到 `<root>/`。

### 3.1 源码结构

```tree
src/
├── pages/                 // 主包页面
│   └── index/index.entry.ts
└── packageA/              // 分包源码目录（root=packageA）
    └── pages/
        └── goods/goods.entry.ts
```

### 3.2 配置

```json
// angular.json -> options
{
  "platform": "wx",
  "appJson": "src/app.config.json",
  "pages": [
    { "glob": "**/*.entry.ts", "input": "./src/pages", "output": "pages" },
    { "glob": "**/*.entry.ts", "input": "./src/packageA", "output": "packageA" }
  ]
}
```

```json
// src/app.config.json
{
  "pages": ["pages/index/index-entry"],
  "subpackages": [
    {
      "root": "packageA",
      "pages": ["pages/goods/goods-entry"]
    }
  ]
}
```

### 3.3 独立分包

```json
{
  "root": "packageB",
  "independent": true,
  "pages": ["pages/pure/pure-entry"]
}
```

> 独立分包**不得依赖主包**。若独立分包代码 import 了主包/其他分包的模块，
> 构建期直接报错（跨分包 require 小程序本就不允许）。

### 3.4 跨分包 import 会被拦截

```ts
// packageB 里 import packageA 的组件 → 构建报错「跨分包静态依赖」
import { GoodsComponent } from '../../packageA/pages/goods/goods.component';
```

---

## 4. 原生小程序自定义组件接入

对应 uni-app 的 `wxcomponents`。让模板里直接用第三方原生组件（如 vant-weapp）。

### 4.1 目录约定

`<nativeComponentsDir>/<目录名>/<目录名>.json` 即认定为一个原生组件，**标签名 = 目录名**。

```tree
src/wxcomponents/
└── van-button/
    ├── van-button.json     // { "component": true }
    ├── van-button.wxml
    ├── van-button.wxss
    └── van-button.js
```

### 4.2 配置

```json
// angular.json -> options
{
  "platform": "wx",
  "nativeComponentsDir": "src/wxcomponents"
}
```

### 4.3 模板里使用

```ts
@Component({
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],   // 原生标签需规避 Angular 模板校验
  template: `<van-button type="primary">提交</van-button>`,
})
export class DemoComponent {}
```

构建后自动：
1. 整个 `wxcomponents/` 拷进产物根目录
2. 检测到模板用了 `<van-button>`，往该页面 `.json` 注入
   `usingComponents: { "van-button": "../../wxcomponents/van-button/van-button" }`

### 4.4 自定义标签名（可选）

目录名和标签名不一致时用 `tagMap`（需在构建调用处传，一般保持目录名=标签名即可）。

---

## 5. 模板名自动推导（默认生效，无需配置）

**之前**：自定义结构指令里 `createEmbeddedView` 必须手动传 `__templateName`。
**现在**：同组件内可省略，运行时从模板声明名（`#myTpl`）自动推导。

```ts
@Directive({ selector: '[myStructural]' })
export class MyStructuralDirective {
  @Input() myStructural!: TemplateRef<any>;
  constructor(private vcr: ViewContainerRef) {}
  ngOnInit() {
    // 不再需要 __templateName，自动用模板声明名
    this.vcr.createEmbeddedView(this.myStructural);
  }
}
```

```html
<!-- 声明名 myTpl 会被自动用作运行时模板名 -->
<ng-template #myTpl>
  <view>内容</view>
</ng-template>
<div *myStructural="myTpl"></div>
```

> 显式传 `__templateName` 仍然有效（context 优先，向后兼容），仅在需要覆盖默认名或跨组件传模板时才用。

---

## 6. setData 记录式优化（默认生效，无需配置）

渲染层内部优化，对使用者透明：

- 节点变更时打脏标记，`toView()` 对未变更节点复用缓存对象
- diff 遇到引用相同即跳过，只重序列化脏节点
- 单属性变更时，整棵未变的节点树不再重新序列化

你不需要做任何配置，正常写组件即可享受。

---

## 完整配置示例（angular.json）

```json
{
  "platform": "wx",
  "main": "src/main.ts",
  "tsConfig": "src/tsconfig.app.json",
  "outputPath": "dist/mp-app",
  "appJson": "src/app.config.json",
  "nativeComponentsDir": "src/wxcomponents",
  "pages": [
    { "glob": "**/*.entry.ts", "input": "./src/pages", "output": "pages" },
    { "glob": "**/*.entry.ts", "input": "./src/packageA", "output": "packageA" }
  ],
  "components": [
    { "glob": "**/*.entry.ts", "input": "./src/components", "output": "components" }
  ],
  "assets": [
    { "glob": "project.config.json", "input": "./src", "output": "./" }
  ]
}
```

> 关键提醒：用了 `appJson` 后，`assets` 里就**不要再放 `app.json`**（互斥）。
