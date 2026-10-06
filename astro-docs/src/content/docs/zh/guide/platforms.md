---
title: '多平台与条件编译'
---

一次构建只出一个平台。`platform` 决定产物后缀、指令前缀、事件名、配置文件名和一批
编译期常量。跨平台靠「同一份源码 + 多次构建」，不靠运行时判断。

## 平台取值

| `platform` | 平台 | 全局对象 | 模板 | 样式 | 渲染层脚本 | project 配置 |
| --- | --- | --- | --- | --- | --- | --- |
| `wx` | 微信（含企业微信） | `wx` | `.wxml` | `.wxss` | `.wxs` | `project.config.json` |
| `zfb` | 支付宝 | `my` | `.axml` | `.acss` | `.sjs` | `mini.project.json` |
| `dd` | 钉钉 | `dd` | `.axml` | `.acss` | `.sjs` | `mini.project.json` |
| `zj` | 字节 / 抖音 | `tt` | `.ttml` | `.ttss` | `.sjs` | `project.config.json` |
| `bdzn` | 百度智能 | `swan` | `.swan` | `.css` | `.sjs` | `project.swan.json` |
| `qq` | QQ | `qq` | `.qml` | `.qss` | `.qs` | `project.config.json` |
| `ks` | 快手 | `ks` | `.ksml` | `.css` | `.sjs` | `project.config.json` |
| `xhs` | 小红书 | `xhs` | `.xhsml` | `.css` | `.sjs` | `project.config.json` |
| `fs` | 飞书 | `tt` | `.ttml` | `.ttss` | `.sjs` | `project.config.json` |
| `jd` | 京东 | `jd` | `.jxml` | `.jxss` | `.jds` | `project.config.json` |

构建器按这张表自动改写产物，你不需要为平台改文件名。

**能力差异**（构建器会在配置层面拦住，不会产出一个没人加载的目录）：

| 能力 | 不支持的平台 |
| --- | --- |
| 自定义 tabBar | `dd` `bdzn` `zj` `ks` `xhs` `fs` |

分包、独立分包、workers 目前各家都放行。校验只对「平台显式声明了不支持」的字段生效，
平台新加的字段不会被误拦。

分包的 key 有两种写法（`subpackages` / `subPackages`），构建器按平台收敛成一种，
两种都接受。

## 多平台工程怎么摆

平台差异一律用「配置」表达，不在代码里写 `if (platform === 'zfb')`：

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

配置文件里的平台分段见 [配置文件](../mp-config/) 的 `_platform` 一节。

## 条件编译：常量替换

构建器往 vite 的 `define` 里注入一组常量，死分支由 bundler 常量折叠后整体移除，
零运行时开销：

```ts
if (__MP_WX__) {
  // 只有构建 wx 平台时这段还在
}

const name = __MP_PLATFORM__; // "wx" | "zfb" | "zj" | "bdzn" | "qq" | "dd" | "ks" | "xhs" | "fs" | "library"
```

| 常量 | 含义 |
| --- | --- |
| `__MP_PLATFORM__` | 当前 `platform` 选项的字符串 |
| `__MP_WX__` `__MP_ZFB__` `__MP_ZJ__` `__MP_BDZN__` `__MP_QQ__` `__MP_DD__` `__MP_KS__` `__MP_XHS__` `__MP_FS__` `__MP_JD__` | 当前平台为 `true`，其余 `false` |

小分支用它，整文件差异用下面的后缀变体。不用 `#ifdef` 那种注释预处理指令——
它绕过类型系统，IDE 和 lint 全部失效。

**要在 TS 里用，得把类型声明加进工程**，否则编辑器报红：

```jsonc
// tsconfig.app.json
{
  "include": [
    "src/**/*.ts",
    "node_modules/angular-miniprogram/builder/platform-flags.d.ts"
  ]
}
```

## 条件编译：文件后缀变体

同一目录下放 `foo.ts` 和 `foo.<platform>.ts`，构建该平台时自动取变体：

```tree
src/shared/
├─ share.service.ts        # 默认实现
└─ share.service.wx.ts     # 构建 platform=wx 时生效
```

```ts
// 任何地方照常 import，构建时自动选变体
import { ShareService } from './share.service';
```

后缀就是 `platform` 的取值：`foo.zfb.ts` / `foo.zj.ts` / `foo.bdzn.ts` …
只对相对路径与绝对路径的 import 生效，bare specifier（包名）不参与；
变体不存在时维持原解析，行为零变化。

## 运行时平台标识

编译期 define 里还有一个 `miniProgramPlatform`，值是**平台全局对象名**：
`wx` / `my` / `tt` / `swan` / `qq` / `dd` / `jd` / `ks` / `xhs`。

注意它跟 `__MP_PLATFORM__` 不是一套词表（`zfb` 对应 `my`，`zj` 对应 `tt`）。
DI 里用 `MP_PLATFORM` 这个 token，它在 define 缺席时（单测、非常规环境）会退化成
对 `globalThis` 的特征嗅探：

```ts
import { MP_PLATFORM } from 'angular-miniprogram/api';

const platform = inject(MP_PLATFORM); // 'wx' | 'my' | 'tt' | …
```

## 事件名也按平台翻译

模板里统一写微信形态的事件名，编译期按平台改写。目前只有支付宝跟微信不同，
而且不只是断词：

| 微信 | 支付宝 |
| --- | --- |
| `longpress` / `longtap` | `onLongTap` |
| `waiting` | `onLoading` |
| `animationfinish` | `onAnimationEnd` |
| `loadedmetadata` | `onRenderStart` |

细节见 [事件修饰符](../../template/event/)。
