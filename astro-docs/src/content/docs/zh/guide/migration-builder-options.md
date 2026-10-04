---
title: "构建选项迁移"
---

`angular-miniprogram:application` 的选项表重做过一次：以前 `schema.json` 是手抄 webpack
时代 `@angular-devkit/build-angular:browser` 那一版，47 个字段里只有 17 个真被读取 ——
剩下的配了不报错、也不生效。现在 schema 由 `@angular/build:application` 生成，
**只保留本构建器真正落地的 27 个字段**，其余一律拒绝（`additionalProperties: false`），
配错会当场报校验错误，而不是静默无效。

升级后如果 `ng build` 报
`Data must NOT have additional properties`，就是踩到了下面被移除的字段。

## 1. 被移除的字段

### 小程序没有对应概念

| 字段 | 原因 | 怎么办 |
| --- | --- | --- |
| `index` | 小程序没有 HTML 入口。它以前还挂在 `required` 上，逼人写 `"index": ""` 占位 | 直接删掉这一行 |
| `baseHref` `deployUrl` | 没有 URL 基路径 / CDN 前缀概念 | 删；静态资源域名在源文件里写全 |
| `crossOrigin` `subresourceIntegrity` | 没有 `<script>` / `<link>` 标签 | 删 |
| `serviceWorker` `ngswConfigPath` | 小程序没有 Service Worker | 删 |
| `webWorkerTsConfig` | 小程序没有 Web Worker | 删 |
| `extractCss` | 样式一律产出 `.wxss`，不存在「内联进 js」的形态 | 删 |
| `resourcesOutputPath` | 资源文件名固定 `[name].[ext]` | 删；要 hash 用 `outputHashing: "media"` |

### webpack 时代化石

| 字段 | 原因 | 怎么办 |
| --- | --- | --- |
| `vendorChunk` `commonChunk` | rollup 自动切共享 chunk，没有对应开关 | 删；想让某个包不进产物用 `externalDependencies` |
| `namedChunks` | rollup 的 chunk 本来就带名字 | 删；命名策略用 `outputHashing` |
| `buildOptimizer` `showCircularDependencies` `extractLicenses` | webpack / `@angular-devkit/build-optimizer` 专用 | 删 |

### 本包没有实现路径，与其留着骗人不如删掉

| 字段 | 原因 | 怎么办 |
| --- | --- | --- |
| `scripts` | 全局脚本入口未实现 | 删；要 polyfill 用 `polyfills` |
| `poll` | application 的 watch 走 `fs.watch`，没有轮询模式 | 删（`library` builder 支持 `poll`） |
| `verbose` `progress` | 日志级别固定 info，避免「命令一闪而过」 | 删 |
| `aot` | 恒 AOT，没有 jit 路径 | 删 |
| `localize` `i18nMissingTranslation` | 构建期翻译内联未实现 | 运行时 i18n：`polyfills` 里声明 `@angular/localize/init`（`ng add @angular/localize` 写的就是这个），构建器会把它 import 进 polyfills 入口 |
| `allowedCommonJsDependencies` | Vite 没有对应的 CJS 告警可关 | 删 |

## 2. 字段还在，但行为变了

| 字段 | 变化 |
| --- | --- |
| `outputHashing` | 以前写死 `[name]-[hash].js`，选项是假的。现在真生效，默认 `none` ⇒ **共享 chunk 文件名不再带 hash**（小程序没有 HTTP 缓存，hash 只让路径变长）。要老行为配 `"outputHashing": "bundles"` |
| `optimization` | 默认 `false`（上游是 `true`，本包刻意覆盖：dev 流程靠微信开发者工具盯着产物目录，默认得出可读代码）。要压缩请显式 `true` 或走 production configuration。对象写法 `{ "scripts": false }` 以前被真值判断当成 `true`，现在按子项取值 |
| `sourceMap` | 对象写法（`{ "scripts": true, "hidden": true }`）现在生效，`hidden` 映射为不出 `.map` 注释的内嵌 map |
| `polyfills` | **以前只从数组里挑 localize 那一条，现在照 `@angular/build` 的 browser 路径把每条都 import 进 polyfills 入口**（包名和本地文件都收，`"polyfills": "src/polyfills.ts"` 这种串写法也收）。`@angular/localize` 必须写全 `/init`（主入口不挂全局 `$localize`，写一半会构建绿、运行时 `$localize is not a function`）|
| `fileReplacements` | 两侧文件都会校验存在，路径写错直接构建报错（以前是静默不替换）。老的 `src` / `replaceWith` 写法也认 |
| `stylePreprocessorOptions` | 新增上游的 `sass` 子项（`fatalDeprecations` / `silenceDeprecations` / `futureDeprecations`），直接透传给 sass |

## 3. 现在能用的选项

**本包独有**：`platform` `pages` `customTabbar` `main`（上游叫 `browser`）`appJson` `nativeComponentsDir` `dedupe` `format`

**与 `@angular/build` 同名同义**：`outputPath` `tsConfig` `assets` `styles` `polyfills` `fileReplacements` `optimization` `sourceMap` `watch` `stylePreprocessorOptions` `inlineStyleLanguage` `define` `conditions` `externalDependencies` `outputHashing` `deleteOutputPath` `preserveSymlinks` `budgets` `statsJson`

其中这几项是这次才真正接上的：

- `budgets` —— 判定逻辑直接复用 `@angular/build`。口径在小程序语境下：`initial` = 所有入口 JS 之和、`all` = 全部产物（≈ 主包体积）、`any` = 单个文件、`bundle` + `name` = 指定 chunk。超 `maximumError` 会让构建失败
- `statsJson` —— 产出 `stats.json`（每个产物的体积清单）
- `define` —— 用户常量。与平台内置 define（`wx` / `window` / `ngDevMode` / `__MP_WX__` 等）合并，**同名时平台优先**
- `conditions` `preserveSymlinks` `externalDependencies` `deleteOutputPath` —— 分别透传 Vite 的 `resolve.conditions` / `resolve.preserveSymlinks` / rollup `external` / `build.emptyOutDir`

`library` builder 另外补上了 `poll`（透传给 ng-packagr 的 watcher，网络盘 / WSL 挂载上有用）。

## 4. 自查

```bash
# 看有没有用到被删掉的字段
grep -nE '"(index|scripts|aot|localize|i18nMissingTranslation|vendorChunk|commonChunk|namedChunks|buildOptimizer|showCircularDependencies|extractLicenses|baseHref|deployUrl|crossOrigin|subresourceIntegrity|serviceWorker|ngswConfigPath|webWorkerTsConfig|extractCss|resourcesOutputPath|poll|verbose|progress|allowedCommonJsDependencies)"' \
  angular.json projects/*/angular.json
```

没有输出就说明不用改。
