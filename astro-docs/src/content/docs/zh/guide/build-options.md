---
title: '构建选项'
---

`angular-miniprogram:application` 的选项表由 `@angular/build:application` 生成，
只保留本构建器真正落地的字段，其余一律拒绝（配了会报校验错误，不会静默无效）。
从 1.x 升级踩到被删字段见 [构建选项迁移](../migration-builder-options/)。

## 必填

```jsonc
{
  "main": "src/main.ts",           // app 入口（上游叫 browser）
  "tsConfig": "src/tsconfig.app.json",
  "outputPath": "dist/my-mp"
}
```

`tsConfig` 的 `files` / `include` 必须覆盖到所有入口文件与组件文件——构建器要从
编译单元里读组件声明。没覆盖到会报「不在 tsconfig 的编译范围里」。

## 本包独有的选项

| 选项 | 作用 |
| --- | --- |
| `platform` | 目标平台，见 [多平台与条件编译](../platforms/) |
| `pages` | 页面入口的 glob，见 [入口](../entry/) |
| `subpackages` | 分包入口，`output` 就是分包 root |
| `customTabbar` | 自定义 tabBar 的源文件位置，产物目录由平台决定 |
| `appJson` | 结构化 app 配置源文件，见 [配置文件](../mp-config/) |
| `projectConfig` | 结构化 project 配置源文件 |
| `appJsonValidate` | `error`（默认）/ `warn` / `off` |
| `deriveCondition` | 按页面生成开发者工具的调试启动项，默认关 |
| `nativeComponentsDir` | 原生自定义组件目录，见 [使用原生自定义组件](../native-components/) |
| `viteConfig` | 把最终 vite 配置接出来自己改，见 [自定义 vite 配置](../custom-vite-config/) |
| `tagNameClass` | 是否给元素补 `tag-name-<原标签>`，见下文 |
| `dedupe` | 强制单实例的包，透传 Vite `resolve.dedupe` |
| `format` | 产物模块格式，默认 `cjs`；只有确认宿主支持 ESM 才改 `es` |

## 与上游同名，但默认值不同

这几个是刻意改的，别按 `@angular/build` 的默认值推断：

| 选项 | 这里的默认 | 为什么 |
| --- | --- | --- |
| `optimization` | `false` | 开发流程靠开发者工具盯着产物目录，默认得出可读代码。要压缩显式 `true` 或走 production configuration |
| `outputHashing` | `none` | 小程序没有 HTTP 缓存，hash 只让路径变长。要老行为配 `"bundles"` |
| `sourceMap` | — | 对象写法（`{ "scripts": true, "hidden": true }`）生效，`hidden` 表示内嵌 map 不产 `.map` 文件 |

## 上游选项里真正接上的

`assets` `styles` `stylePreprocessorOptions` `inlineStyleLanguage` `fileReplacements`
`polyfills` `watch` `define` `conditions` `externalDependencies` `deleteOutputPath`
`preserveSymlinks` `budgets` `statsJson`。

几个有小程序语境的：

**`polyfills`** —— 每条都会被 import 进 polyfills 入口，包名和本地文件都收，
字符串写法也收。多语言必须写全 `@angular/localize/init`：

```jsonc
"polyfills": ["@angular/localize/init"]
```

只写 `@angular/localize` 构建会绿，运行时 `$localize is not a function`。

**`budgets`** —— 判定逻辑复用 `@angular/build`，口径按小程序语境解释：
`initial` = 所有入口 JS 之和，`all` = 全部产物（≈ 主包体积），`any` = 单个文件，
`bundle` + `name` = 指定 chunk。超 `maximumError` 构建失败。

**`define`** —— 用户常量，与平台内置 define（`wx` / `window` / `ngDevMode` /
`__MP_WX__` 等）合并，**同名时平台优先**，别去覆盖那几个。

**`fileReplacements`** —— 两侧文件都会校验存在，路径写错直接构建报错。
老的 `src` / `replaceWith` 写法也认。

**`stylePreprocessorOptions`** —— 含上游的 `sass` 子项
（`fatalDeprecations` / `silenceDeprecations` / `futureDeprecations`），直接透传给 sass。

## `tagNameClass`

模板里写 `div`，wxml 里已经是 `view`，于是样式里的 `div {}` 选择器落空。
构建器可以给元素补一个 `tag-name-div` 的 class 当把手：

| 值 | 行为 |
| --- | --- |
| `mapped`（默认） | 只给「映射改写了标签」的元素补 |
| `all` | 每个元素都补 |
| `off` | 一个都不补 |

标记是编译期烘进 wxml 的字面量，不占数据通道。没有别的 class 来源的元素，
最后就只剩 `class="tag-name-div"`。

## 一个完整的例子

```jsonc
{
  "projects": {
    "my-mp": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "architect": {
        "build": {
          "builder": "angular-miniprogram:application",
          "options": {
            "platform": "wx",
            "outputPath": "dist/my-mp",
            "main": "src/main.ts",
            "tsConfig": "src/tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "polyfills": ["@angular/localize/init"],
            "styles": ["src/styles.scss"],
            "assets": [
              { "glob": "project.config.json", "input": "./src", "output": "./" }
            ],
            "appJson": "src/app.config.json",
            "pages": [
              { "glob": "**/*.entry.ts", "input": "./src/pages", "output": "pages" }
            ],
            "subpackages": [
              { "glob": "**/*.entry.ts", "input": "./src/packageA", "output": "packageA" }
            ]
          },
          "configurations": {
            "production": {
              "optimization": true,
              "outputHashing": "none",
              "sourceMap": false,
              "budgets": [{ "type": "all", "maximumError": "2mb" }]
            },
            "development": { "optimization": false, "sourceMap": true }
          },
          "defaultConfiguration": "development"
        }
      }
    }
  }
}
```
