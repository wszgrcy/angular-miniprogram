---
title: '构建选项迁移'
---

`angular-miniprogram:application` 的选项表重新设计过一次：此前 `schema.json` 抄自 webpack
时代 `@angular-devkit/build-angular:browser` 那一版，47 个字段中只有 17 个真正被读取 ——
其余字段配置后不报错、也不生效。现在 schema 由 `@angular/build:application` 生成，
**只保留本构建器真正落地的 27 个字段**，其余一律拒绝（`additionalProperties: false`），
配置错误会直接报校验错误，而不是静默无效。

升级后若 `ng build` 报
`Data must NOT have additional properties`，说明用到了下文列出的已移除字段。

## 1. 被移除的字段

### 小程序没有对应概念

| 字段                                 | 原因                                                                            | 处理方式                                      |
| ------------------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------- |
| `index`                              | 小程序没有 HTML 入口，此前却仍声明在 `required` 上，需要书写 `"index": ""` 占位 | 删除该行                                      |
| `baseHref` `deployUrl`               | 没有 URL 基路径 / CDN 前缀概念                                                  | 删除；静态资源域名在源文件中写完整            |
| `crossOrigin` `subresourceIntegrity` | 没有 `<script>` / `<link>` 标签                                                 | 删除                                          |
| `serviceWorker` `ngswConfigPath`     | 小程序没有 Service Worker                                                       | 删除                                          |
| `webWorkerTsConfig`                  | 小程序没有 Web Worker                                                           | 删除                                          |
| `extractCss`                         | 样式一律产出 `.wxss`，不存在内联进 js 的形态                                    | 删除                                          |
| `resourcesOutputPath`                | 资源文件名固定 `[name].[ext]`                                                   | 删除；需要 hash 使用 `outputHashing: "media"` |

### webpack 时代遗留

| 字段                                                          | 原因                                             | 处理方式                                                |
| ------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| `vendorChunk` `commonChunk`                                   | rollup 自动切分共享 chunk，没有对应开关          | 删除；若需要某包不进入产物，使用 `externalDependencies` |
| `namedChunks`                                                 | rollup 的 chunk 本身带名称                       | 删除；命名策略使用 `outputHashing`                      |
| `buildOptimizer` `showCircularDependencies` `extractLicenses` | webpack / `@angular-devkit/build-optimizer` 专用 | 删除                                                    |

### 本包无实现路径

| 字段                                | 原因                                             | 处理方式                                                                                                                                        |
| ----------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts`                           | 全局脚本入口未实现                               | 删除；需要 polyfill 使用 `polyfills`                                                                                                            |
| `poll`                              | application 的 watch 使用 `fs.watch`，无轮询模式 | 删除（`library` builder 支持 `poll`）                                                                                                           |
| `verbose` `progress`                | 日志级别固定为 info，避免构建输出被跳过          | 删除                                                                                                                                            |
| `aot`                               | 始终 AOT，无 jit 路径                            | 删除                                                                                                                                            |
| `localize` `i18nMissingTranslation` | 构建期翻译内联未实现                             | 运行时 i18n：在 `polyfills` 中声明 `@angular/localize/init`（`ng add @angular/localize` 写入的就是该项），构建器会将其 import 进 polyfills 入口 |
| `allowedCommonJsDependencies`       | Vite 没有可关闭的对应 CJS 告警                   | 删除                                                                                                                                            |

## 2. 字段还在，但行为变了

| 字段                       | 变化                                                                                                                                                                                                                                                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `outputHashing`            | 此前固定为 `[name]-[hash].js`，选项未生效。现在真正生效且默认 `none` ⇒ **共享 chunk 文件名不再带 hash**（小程序没有 HTTP 缓存，hash 只会使路径变长）。需要原有行为时配置 `"outputHashing": "bundles"`                                                                                                                              |
| `optimization`             | 默认 `false`（上游为 `true`，本包刻意覆盖：开发流程依赖微信开发者工具查看产物目录，默认输出可读代码）。需要压缩时显式设为 `true` 或使用 production configuration。对象写法 `{ "scripts": false }` 此前被真值判断视为 `true`，现按子项取值                                                                                          |
| `sourceMap`                | 对象写法（`{ "scripts": true, "hidden": true }`）现在生效，`hidden` 映射为不出 `.map` 注释的内嵌 map                                                                                                                                                                                                                               |
| `polyfills`                | **此前只从数组中挑选 localize 一条，现在按 `@angular/build` 的 browser 路径把每条都 import 进 polyfills 入口**（包名与本地文件均可，`"polyfills": "src/polyfills.ts"` 这类字符串写法同样支持）。`@angular/localize` 必须写全 `/init`（主入口不会挂载全局 `$localize`，只写一半时构建通过、运行时报 `$localize is not a function`） |
| `fileReplacements`         | 两侧文件都会校验是否存在，路径错误会直接导致构建失败（此前为静默不替换）。旧的 `src` / `replaceWith` 写法同样支持                                                                                                                                                                                                                  |
| `stylePreprocessorOptions` | 新增上游的 `sass` 子项（`fatalDeprecations` / `silenceDeprecations` / `futureDeprecations`），直接透传给 sass                                                                                                                                                                                                                      |

## 3. 当前可用的选项

**本包独有**：`platform` `pages` `customTabbar` `main`（上游叫 `browser`）`appJson` `nativeComponentsDir` `dedupe` `format` `viteConfig` `tagNameClass`

**与 `@angular/build` 同名同义**：`outputPath` `tsConfig` `assets` `styles` `polyfills` `fileReplacements` `optimization` `sourceMap` `watch` `stylePreprocessorOptions` `inlineStyleLanguage` `define` `conditions` `externalDependencies` `outputHashing` `deleteOutputPath` `preserveSymlinks` `budgets` `statsJson`

以下几项是本次才真正支持的：

- `budgets` —— 判定逻辑直接复用 `@angular/build`。口径在小程序语境下：`initial` = 所有入口 JS 之和、`all` = 全部产物（≈ 主包体积）、`any` = 单个文件、`bundle` + `name` = 指定 chunk。超 `maximumError` 会让构建失败
- `statsJson` —— 产出 `stats.json`（每个产物的体积清单）
- `define` —— 用户常量。与平台内置 define（`wx` / `window` / `ngDevMode` / `__MP_WX__` 等）合并，**同名时平台优先**
- `conditions` `preserveSymlinks` `externalDependencies` `deleteOutputPath` —— 分别透传 Vite 的 `resolve.conditions` / `resolve.preserveSymlinks` / rollup `external` / `build.emptyOutDir`
- `viteConfig` —— 上述选项无法覆盖时的兜底方式：指定一个文件，默认导出 `(config, ctx) => config`，获取构建器组装完成的 vite 配置并自行修改（见「自定义 vite 配置」）
- `tagNameClass` —— 控制是否为元素补充 `tag-name-<原标签>` 标记，默认 `mapped`。模板书写 `div` 而 wxml 中已是 `view`，`div` 选择器无法命中，该 class 用于还原原标签名；未被映射改写的标签（`view`、自定义组件）本身即可直接选中，附带该 class 只会使每个元素多一个 class token。`all` 表示每个元素都带，`off` 表示都不带

### `tagNameClass` 与 class / style 通道

wxml 中每个元素的 class 都来自 `class="{{nodeList[i].class}}"` 这条绑定，数据侧同步下发
一份。现在编译期会静态判定元素是否存在 class / style 来源（静态属性、`[class]`、`[class.x]`、
`[attr.class]`、带插值的 `class="a {{x}}"`、`#ref` 的查询 class、组件/指令的 host 绑定），
判定为无来源时整条属性不输出，数据侧也不下发该字段。实测可减少一成以上的 wxml 体积，
首次 setData 中每个无关元素少两个字段。

`tag-name-*` 因此改为编译期写入 wxml 的字面量（运行时不持有标签映射表）：没有其他 class
来源的元素，最终只有一个 `class="tag-name-div"`，不占用数据通道。

`library` builder 另外支持了 `poll`（透传给 ng-packagr 的 watcher，网络盘 / WSL 挂载场景下有用）。

## 4. 自查

```bash
# 检查是否使用了已删除的字段
grep -nE '"(index|scripts|aot|localize|i18nMissingTranslation|vendorChunk|commonChunk|namedChunks|buildOptimizer|showCircularDependencies|extractLicenses|baseHref|deployUrl|crossOrigin|subresourceIntegrity|serviceWorker|ngswConfigPath|webWorkerTsConfig|extractCss|resourcesOutputPath|poll|verbose|progress|allowedCommonJsDependencies)"' \
  angular.json projects/*/angular.json
```

无输出即表示无需修改。
