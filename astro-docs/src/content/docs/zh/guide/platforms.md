---
title: '多平台与条件编译'
---

一次构建只出一个平台。`platform` 决定产物后缀、指令前缀、事件名、配置文件名和一批
编译期常量。跨平台靠「同一份源码 + 多次构建」，不靠运行时判断。

## 平台取值

| `platform` | 平台               | 全局对象 | 模板     | 样式    | 渲染层脚本 | project 配置          |
| ---------- | ------------------ | -------- | -------- | ------- | ---------- | --------------------- |
| `wx`       | 微信（含企业微信） | `wx`     | `.wxml`  | `.wxss` | `.wxs`     | `project.config.json` |
| `zfb`      | 支付宝             | `my`     | `.axml`  | `.acss` | `.sjs`     | `mini.project.json`   |
| `dd`       | 钉钉               | `dd`     | `.axml`  | `.acss` | `.sjs`     | `mini.project.json`   |
| `zj`       | 字节 / 抖音        | `tt`     | `.ttml`  | `.ttss` | `.sjs`     | `project.config.json` |
| `bdzn`     | 百度智能           | `swan`   | `.swan`  | `.css`  | `.sjs`     | `project.swan.json`   |
| `qq`       | QQ                 | `qq`     | `.qml`   | `.qss`  | `.qs`      | `project.config.json` |
| `ks`       | 快手               | `ks`     | `.ksml`  | `.css`  | `.sjs`     | `project.config.json` |
| `xhs`      | 小红书             | `xhs`    | `.xhsml` | `.css`  | `.sjs`     | `project.config.json` |
| `fs`       | 飞书               | `tt`     | `.ttml`  | `.ttss` | `.sjs`     | `project.config.json` |
| `jd`       | 京东               | `jd`     | `.jxml`  | `.jxss` | `.jds`     | `project.config.json` |

构建器按该表自动改写产物，无需为平台修改文件名。

**能力差异**（构建器会在配置层面拦截，不会生成不会被加载的产物目录）：

| 能力          | 不支持的平台                     |
| ------------- | -------------------------------- |
| 自定义 tabBar | `dd` `bdzn` `zj` `ks` `xhs` `fs` |

分包、独立分包、workers 目前各平台均支持。校验只对平台显式声明不支持的字段生效，
平台新增的字段不会被误判。

分包的 key 有两种写法（`subpackages` / `subPackages`），构建器按平台收敛为一种，
两种写法均接受。

## 多平台工程的组织方式

平台差异一律通过配置表达，不在代码中书写 `if (platform === 'zfb')`：

```jsonc
// angular.json
"targets": {
  "build": {
    "options": { "platform": "wx", "outputPath": "dist/wx" },
    "configurations": {
      "zfb": { "platform": "zfb", "outputPath": "dist/zfb" }
    }
  }
}
```

```bash
ng build                 # 微信
ng build --configuration zfb
```

配置文件中的平台分段见 [配置文件](../mp-config/) 的 `_platform` 一节。

## 条件编译：常量替换

构建器向 vite 的 `define` 注入一组常量，未命中的分支由 bundler 常量折叠后整体移除，
无运行时开销：

```ts
if (__MP_WX__) {
  // 只有构建 wx 平台时这段还在
}

const name = __MP_PLATFORM__; // "wx" | "zfb" | "zj" | "bdzn" | "qq" | "dd" | "ks" | "xhs" | "fs" | "library"
```

| 常量                                                                                                                        | 含义                            |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `__MP_PLATFORM__`                                                                                                           | 当前 `platform` 选项的字符串    |
| `__MP_WX__` `__MP_ZFB__` `__MP_ZJ__` `__MP_BDZN__` `__MP_QQ__` `__MP_DD__` `__MP_KS__` `__MP_XHS__` `__MP_FS__` `__MP_JD__` | 当前平台为 `true`，其余 `false` |

小范围分支使用该常量，整文件差异使用下文的后缀变体。不提供 `#ifdef` 一类注释式
预处理指令——这类写法绕过类型系统，会使 IDE 与 lint 全部失效。

**在 TS 中使用前需要把类型声明加入工程**，否则编辑器会报错：

```jsonc
// tsconfig.app.json
{
  "include": [
    "src/**/*.ts",
    "node_modules/angular-miniprogram/builder/platform-flags.d.ts",
  ],
}
```

## 条件编译：文件后缀变体

同一目录下同时存在 `foo.ts` 与 `foo.<platform>.ts` 时，构建该平台会自动选用变体：

```tree
src/shared/
├─ share.service.ts        # 默认实现
└─ share.service.wx.ts     # 构建 platform=wx 时生效
```

```ts
// 照常 import，构建时自动选用变体
import { ShareService } from './share.service';
```

后缀即 `platform` 的取值：`foo.zfb.ts` / `foo.zj.ts` / `foo.bdzn.ts` …
仅对相对路径与绝对路径的 import 生效，bare specifier（包名）不参与；
变体不存在时维持原有解析行为。

## 运行时平台标识

编译期 define 中还包含 `miniProgramPlatform`，其值是**平台全局对象名**：
`wx` / `my` / `tt` / `swan` / `qq` / `dd` / `jd` / `ks` / `xhs`。

注意它与 `__MP_PLATFORM__` 不是同一套取值（`zfb` 对应 `my`，`zj` 对应 `tt`）。
DI 中使用 `MP_PLATFORM` 这个 token，当 define 缺席时（单元测试、非常规环境），
该 token 会退化为对 `globalThis` 的特征检测：

```ts
import { MP_PLATFORM } from 'angular-miniprogram/api';

const platform = inject(MP_PLATFORM); // 'wx' | 'my' | 'tt' | …
```

## 事件名按平台翻译

模板中统一书写微信形态的事件名，编译期按平台改写。目前仅支付宝与微信存在差异，
且不只是断词不同：

| 微信                    | 支付宝           |
| ----------------------- | ---------------- |
| `longpress` / `longtap` | `onLongTap`      |
| `waiting`               | `onLoading`      |
| `animationfinish`       | `onAnimationEnd` |
| `loadedmetadata`        | `onRenderStart`  |

细节见 [事件修饰符](../../template/event/)。
