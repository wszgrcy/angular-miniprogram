---
title: "配置文件：app.json / project.config.json"
---

构建器会往 `app.json` 和 `project.config.json` 里写东西（页面清单、分包、自定义
tabBar 开关、调试启动项……），但这两份文件同时也是**你写的**。规则只有一条：

> **你写过的一个字不动，你没写的构建器才补。**

不存在「用了选项就不能有静态文件」这种二选一，也不存在「静态文件优先所以选项没效果」。
两边是合并关系，谁写过的谁说了算。

## 1. 两个来源，两个选项

| 产物 | 静态来源（assets 拷贝） | 结构化选项 |
| --- | --- | --- |
| `app.json` | `src/app.json` | `appJson` |
| `project.config.json` | `src/project.config.json` | `projectConfig` |

```json
{
  "assets": [{ "glob": "app.json", "input": "./src", "output": "./" }],
  "appJson": "src/app.config.json",
  "projectConfig": "src/project.config.json"
}
```

两个选项各管各的文件，**不会串**：`appJson` 里写 `appid` 不会跑到 `project.config.json`，
反过来也一样。结构化选项的文件支持 `.json` / `.jsonc` / `.json5`。

只写静态文件也完全可以（历史用法不变），只是那条通道构建器拿不到你的意图，
校验只警告不报错，见第 5 节。

## 2. 合并规则

**默认规则**：某个键你已经写了（哪怕写成 `false`、`[]`、`""`），构建器就不碰；
只有你完全没有的键才补进去。

**唯一的例外是 `pages`**：你写的在前，构建器扫出来的页面追加在后面，按路径去重。

```jsonc
// src/app.config.json —— 只想把首页换成另一个页面
{
  "pages": ["pages/second/second-entry"]
}
```

产物里 `pages/second/second-entry` 排第一（启动页就是它），其余扫出来的页面依次跟在后面。
想「只留我写的这几个页面」，改 `pages` 的 pattern，不要指望覆盖。

`usingComponents` 这类「页面/组件自己的 json」也是同一套规则：你写过的组件不动，
没写的补。

## 3. 合并顺序

同一份产物，从先到后依次补空，**先写过的赢**：

1. 静态文件（`src/app.json`）
2. 静态文件里的 `_platform[当前平台]`
3. 结构化选项文件（`appJson`）
4. 结构化选项文件里的 `_platform[当前平台]`
5. 构建器内置默认值（只有 `project.config.json` 有）
6. 构建器从本次构建算出来的内容（页面清单、分包、自定义 tabBar 开关、appid 缺省值）
7. 平台改写（见第 6 节）

第 5、6 步是「构建器补的」，所以永远排在你的内容后面——你写的 `appid`、
`compileType` 不会被默认值盖掉。

## 4. `_platform`：按平台分段

同一份配置里给不同平台补不同的字段：

```jsonc
// src/app.config.json
{
  "window": { "navigationBarTitleText": "示例" },
  "_platform": {
    "wx": { "style": "v2" },
    "zfb": { "style": "v2", "lazyCodeLoading": "requiredComponents" }
  }
}
```

- key 用平台名（`wx` / `zfb` / `tt` / `dd` / `bdzn` / `ks` / `qq` / `jd` / `xhs` / `zj` / `fs`），
  写错平台名直接报错，不会静默忽略；
- `_platform` 只出现在你的源文件里，**产物里永远没有这个键**；
- 段里的内容照样走「写过的不动」，只是插入位置排在静态文件之后。

平台之间的差异一律用这个（或 angular.json 的 `configurations`）表达，
构建器代码里不写 `if (platform === 'zfb')`。

## 5. 校验严格度

`appJsonValidate` 控制结构化选项那条通道的校验强度：

| 值 | 行为 |
| --- | --- |
| `error`（默认） | 校验不过直接构建失败 |
| `warn` | 只在日志里警告 |
| `off` | 不校验 |

只写静态 `app.json` 的通道固定是 `warn`：那份文件构建器读得到内容但读不到意图，
拦得太狠会把正常项目卡死。

校验拦的是「声明了但跑不起来」的错：页面声明了却没产出入口、tabBar 的
`pagePath` 不在主包页面里、分包 root 写成绝对路径、`_platform` 里写了不存在的平台。
校验对**合并后的结果**跑，不是对你的源文件跑。

## 6. 构建器会补什么、不会补什么

构建器**不发明字段**，也不会替你填平台默认的 `window`、`style` 之类的东西。
它只补这几样有依据的：

| 内容 | 来源 |
| --- | --- |
| `pages` | 本次构建扫出来的页面入口（追加） |
| `subpackages` / `subPackages` | `subpackages` 选项扫出来的入口（见第 7 节），或你声明的分包 |
| `tabBar.custom` / `tabBar.customize` | 产出了自定义 tabBar 组件时打开 |
| `appid` | 没写时补 `touristappid`（仅 project 配置） |
| `condition` | 按页面生成调试启动项，默认关，`deriveCondition: true` 才生成 |
| `project.config.json` 内置默认值 | `compileType` 等几个「没有就打不开」的字段 |

## 7. 分包：angular.json 里配了，声明就自动生成

分包不用在 app.json 里手写。把分包页的 pattern 放进 `subpackages`，
`output` 就是分包 root：

```jsonc
{
  "pages": [{ "glob": "**/*.entry.ts", "input": "./src/pages", "output": "pages" }],
  "subpackages": [
    { "glob": "**/*.entry.ts", "input": "./src/packageA", "output": "packageA" },
    { "glob": "**/*.entry.ts", "input": "./src/packageB", "output": "packageB", "independent": true }
  ]
}
```

构建器据此在 app.json 里生成：

```jsonc
{
  "subpackages": [
    { "root": "packageA", "pages": ["pages/a/a-entry", "pages/b/b-entry"] },
    { "root": "packageB", "pages": ["pages/c/c-entry"], "independent": true }
  ]
}
```

- `root` 取 pattern 的 `output`，`pages` 是那个目录下扫出来的入口（剔掉 root 前缀）
- 约定 **root 同时是源码目录与产物目录**（`src/packageA` → `packageA`），
  分包专属 chunk 靠它归位
- 分包页仍是普通页面，只是产物落在分包目录；`pages` 里不会出现它们
- 平台不支持分包时配了直接报错，不会产出一个没人当它是分包的目录

自己在 app.json 里写了同一个 root 也照旧：你的页在前，扫出来的追加在后面，
同 root 不会重复。只写个 `root` 不写 `pages` 也行，`pages` 由构建器填。

## 8. 平台差异

| 平台 | project 配置文件名 | 分包键 |
| --- | --- | --- |
| 微信 / QQ / 京东 / 抖音 / 快手 / 小红书 / 飞书 / 字节等 | `project.config.json` | `subpackages` |
| 支付宝 / 钉钉 | `mini.project.json` | `subPackages` |
| 百度 | `project.swan.json` | `subPackages` |

支付宝系还认 `project.my.json`：它和 `mini.project.json` 同时存在时取前者。

`subpackages` 与 `subPackages` 两种写法都接受，产物按平台收敛成一种，不会两份都留。

支付宝还会在合并完成后改写：`darkmode` → `darkMode`、
`allowsBounceVertical` 布尔 → `"YES"` / `"NO"`，
`project` 配置的 `condition` → `compileModeJson`。这些是平台要求，不是配置写错。

## 9. `project.private.config.json`

这份文件永远**原样拷贝**，不参与任何合并——它的定位就是「本机私有、不进版本库」，
构建器不碰它的内容。

## 10. 编辑器补全

配置文件的形状与构建期校验同源，两份 JSON Schema 随包发布，装在
`node_modules` 里就能直接指：

```jsonc
// src/app.config.json 顶上加一行
{
  "$schema": "./node_modules/angular-miniprogram/builder/schemas/app-config.schema.json",
  "pages": []
}
```

- `builder/schemas/app-config.schema.json`
- `builder/schemas/project-config.schema.json`

没装到本地也能用 CDN 地址，比如
`https://unpkg.com/angular-miniprogram/builder/schemas/app-config.schema.json`。

`$schema` 跟 `_platform` 一样只属于源文件，**不会进产物**，放心写。

形状是宽松的：没列出的字段既不报错也不丢（平台字段太多且一直在加），
列出来的部分只校验类型和必填项。改了形状记得跑 `npm run gen:config-schema`。
