---
title: '配置文件：app.json / project.config.json'
---

构建器会往 `app.json` 和 `project.config.json` 里写入内容（页面清单、分包、自定义
tabBar 开关、调试启动项……），但这两份文件同时也是**由开发者书写的**。合并规则只有一条：

> **已书写的字段保持不变，未书写的字段才由构建器补齐。**

选项与静态文件并非二选一，静态文件也不会让选项失效：两者是合并关系，已书写的字段优先。

## 1. 两个来源，两个选项

| 产物                  | 静态来源（assets 拷贝）   | 结构化选项      |
| --------------------- | ------------------------- | --------------- |
| `app.json`            | `src/app.json`            | `appJson`       |
| `project.config.json` | `src/project.config.json` | `projectConfig` |

```json
{
  "assets": [{ "glob": "app.json", "input": "./src", "output": "./" }],
  "appJson": "src/app.config.json",
  "projectConfig": "src/project.config.json"
}
```

两个选项分别作用于各自的产物文件，**互不影响**：在 `appJson` 中书写 `appid` 不会写入
`project.config.json`，反之同理。结构化选项的文件支持 `.json` / `.jsonc` / `.json5`。

仅使用静态文件同样可行（历史用法保持不变），只是该通道无法向构建器表达声明意图，
校验只警告不报错，见第 5 节。

## 2. 合并规则

**默认规则**：某字段只要已书写（即使值为 `false`、`[]`、`""`），构建器就不再改动；
仅补齐完全未声明的字段。

**唯一的例外是 `pages`**：已书写的内容排在前面，构建器扫描出的页面追加在后，并按路径去重。

```jsonc
// src/app.config.json —— 只想把首页换成另一个页面
{
  "pages": ["pages/second/second-entry"],
}
```

产物里 `pages/second/second-entry` 排第一（即启动页），其余扫描出的页面依次追加在
后面。若只需要保留指定的少数页面，应调整 `pages` 的 pattern，而不是依赖覆盖。

`usingComponents` 这类「页面/组件自己的 json」也遵循同一规则：已书写的组件保持不变，
未书写的补齐。

## 3. 合并顺序

同一份产物，从先到后依次补空，**先写过的赢**：

1. 静态文件（`src/app.json`）
2. 静态文件里的 `_platform[当前平台]`
3. 结构化选项文件（`appJson`）
4. 结构化选项文件里的 `_platform[当前平台]`
5. 构建器内置默认值（只有 `project.config.json` 有）
6. 构建器从本次构建算出来的内容（页面清单、分包、自定义 tabBar 开关、appid 缺省值）
7. 平台改写（见第 6 节）

第 5、6 步由构建器补齐，因此始终排在已书写内容之后——已声明的 `appid`、
`compileType` 不会被默认值覆盖。

## 4. `_platform`：按平台分段

同一份配置里给不同平台补不同的字段：

```jsonc
// src/app.config.json
{
  "window": { "navigationBarTitleText": "示例" },
  "_platform": {
    "wx": { "style": "v2" },
    "zfb": { "style": "v2", "lazyCodeLoading": "requiredComponents" },
  },
}
```

- key 用平台名（`wx` / `zfb` / `tt` / `dd` / `bdzn` / `ks` / `qq` / `jd` / `xhs` / `zj` / `fs`），
  写错平台名直接报错，不会静默忽略；
- `_platform` 只出现在源文件中，**产物里永远没有这个键**；
- 段内内容同样遵循「已书写不改动」规则，只是插入位置排在静态文件之后。

平台之间的差异一律用这个（或 angular.json 的 `configurations`）表达，
构建器代码里不写 `if (platform === 'zfb')`。

## 5. 校验严格度

`appJsonValidate` 控制结构化选项那条通道的校验强度：

| 值              | 行为                 |
| --------------- | -------------------- |
| `error`（默认） | 校验不过直接构建失败 |
| `warn`          | 只在日志里警告       |
| `off`           | 不校验               |

仅使用静态 `app.json` 的通道固定为 `warn`：构建器能读取该文件的内容，但无法获知声明
意图，校验过严会阻塞正常项目。

校验针对「已声明但无法运行」的错误：页面声明了却未产出入口、tabBar 的
`pagePath` 不在主包页面里、分包 root 写成绝对路径、`_platform` 里写了不存在的平台。
校验作用于**合并后的结果**，而非源文件。

## 6. 构建器会补什么、不会补什么

构建器**不会发明字段**，也不会代为填充平台默认的 `window`、`style` 等配置。
它只补齐以下几项有依据的内容：

| 内容                                 | 来源                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| `pages`                              | 本次构建扫出来的页面入口（追加）                             |
| `subpackages` / `subPackages`        | `subpackages` 选项扫出来的入口（见第 7 节），或已声明的分包  |
| `tabBar.custom` / `tabBar.customize` | 产出了自定义 tabBar 组件时打开                               |
| `appid`                              | 没写时补 `touristappid`（仅 project 配置）                   |
| `condition`                          | 按页面生成调试启动项，默认关，`deriveCondition: true` 才生成 |
| `project.config.json` 内置默认值     | `compileType` 等几个「没有就打不开」的字段                   |

## 7. 分包：angular.json 里配了，声明就自动生成

分包无需在 app.json 中手写。将分包页的 pattern 写入 `subpackages`，
`output` 就是分包 root：

```jsonc
{
  "pages": [
    { "glob": "**/*.entry.ts", "input": "./src/pages", "output": "pages" },
  ],
  "subpackages": [
    {
      "glob": "**/*.entry.ts",
      "input": "./src/packageA",
      "output": "packageA",
    },
    {
      "glob": "**/*.entry.ts",
      "input": "./src/packageB",
      "output": "packageB",
      "independent": true,
    },
  ],
}
```

构建器据此在 app.json 里生成：

```jsonc
{
  "subpackages": [
    { "root": "packageA", "pages": ["pages/a/a-entry", "pages/b/b-entry"] },
    { "root": "packageB", "pages": ["pages/c/c-entry"], "independent": true },
  ],
}
```

- `root` 取 pattern 的 `output`，`pages` 是那个目录下扫出来的入口（剔掉 root 前缀）
- 约定 **root 同时是源码目录与产物目录**（`src/packageA` → `packageA`），
  分包专属 chunk 靠它归位
- 分包页仍是普通页面，只是产物落在分包目录；`pages` 里不会出现它们
- 平台不支持分包时，相关配置会直接报错，不会生成无效的分包目录

在 app.json 中自行声明同一 `root` 时规则不变：已书写的页面在前，扫描出的页面追加在
后面，同一 `root` 不会重复。仅声明 `root` 而不写 `pages` 亦可，`pages` 由构建器填充。

## 8. 平台差异

| 平台                                                    | project 配置文件名    | 分包键        |
| ------------------------------------------------------- | --------------------- | ------------- |
| 微信 / QQ / 京东 / 抖音 / 快手 / 小红书 / 飞书 / 字节等 | `project.config.json` | `subpackages` |
| 支付宝 / 钉钉                                           | `mini.project.json`   | `subPackages` |
| 百度                                                    | `project.swan.json`   | `subPackages` |

支付宝系还认 `project.my.json`：它和 `mini.project.json` 同时存在时取前者。

`subpackages` 与 `subPackages` 两种写法都接受，产物按平台收敛成一种，不会两份都留。

支付宝还会在合并完成后改写：`darkmode` → `darkMode`、
`allowsBounceVertical` 布尔 → `"YES"` / `"NO"`，
`project` 配置的 `condition` → `compileModeJson`。这些是平台要求，不是配置写错。

## 9. `project.private.config.json`

这份文件永远**原样拷贝**，不参与任何合并——其定位是本机私有、不纳入版本库的配置，
构建器不改动其内容。

## 10. 编辑器补全

配置文件的形状与构建期校验同源，两份 JSON Schema 随包发布，安装在
`node_modules` 中即可直接引用：

```jsonc
// src/app.config.json 顶上加一行
{
  "$schema": "./node_modules/angular-miniprogram/builder/schemas/app-config.schema.json",
  "pages": [],
}
```

- `builder/schemas/app-config.schema.json`
- `builder/schemas/project-config.schema.json`

未安装到本地时也可使用 CDN 地址，比如
`https://unpkg.com/angular-miniprogram/builder/schemas/app-config.schema.json`。

`$schema` 与 `_platform` 一样只属于源文件，**不会进入产物**。

形状校验是宽松的：未列出的字段既不报错也不丢弃（平台字段数量多且持续增加），
列出的部分只校验类型与必填项。修改形状后需要执行 `npm run gen:config-schema` 重新生成。
