# 本地开发 / 构建说明

环境：Node 18 ~ 24（已在 Node v24.21.0 + npm 11 验证通过），npm 作为包管理器。

## 一键流程

```bash
npm ci        # 安装依赖
npm run build # 构建 library + builder + karma（会自动补齐同步源码）
npm run test  # 运行全部 jasmine 用例
```

其它常用命令：

```bash
npm run test:ci    # build:library + library 用例 + 全量用例
npm run coverage   # nyc 统计，报告输出到 ./docs/coverage
npm run lint       # eslint --max-warnings 0
npm run sync       # 手动从 angular/angular@17.3.1 同步源码（需要网络）
```

## 两个必须知道的坑（已在本仓库修好）

### 1. `src/library/common` 与 `src/library/forms/src` 是生成代码

这两个目录（除少量手写的 value accessor）被 `.gitignore` 忽略，内容来自
`npm run sync`（`@code-recycle/cli` + `script/package-sync.ts`，从
`angular/angular` 的 `17.3.1` tag 拉取 `packages/common`、`packages/forms`
并把 `@angular/common` 改写成 `angular-miniprogram/common`）。

没同步过就构建会报：

```
TS6053: File '.../src/library/common/http/index.ts' not found.
```

现在 `build:library` 前会先执行 `tsx ./script/ensure-sync.ts`，检测到缺失文件时
自动补跑一次 `npm run sync`，因此直接 `npm run build` 即可。

> 注意：`ng-packagr` 的 `deleteDestPath: true`，单独跑 `npm run build:library`
> 会清空 `dist`，其中包含 builder/karma 的产物。需要完整产物时请跑 `npm run build`。

### 2. Node 22+ 原生 TS 加载会绕过 ts-node

Jasmine 5 默认用 `import()` 加载 spec 文件。Node 22/23/24 自带 `.ts` 类型剥离，
`import()` 会直接由 Node 处理，绕过 `ts-node` 的 CJS 钩子，导致：

- 拿不到 `static-injector` 的 transformer（依赖注入装饰器不生效）；
- 报 `ERR_UNSUPPORTED_DIR_IMPORT`（ESM 不支持目录导入）。

修复方式：`jasmine.json` 中加入 `"jsLoader": "require"`，让 Jasmine 走
`require()`，由 ts-node 编译（等价于 Node 21 及以下的行为），因此不再需要
`NODE_OPTIONS=--no-experimental-strip-types`。

## 关于 karma 用例（2 个 pending）

`src/builder/karma/index.spec.ts` 里的 `karma 运行` / `karma watch` 用例是作者标记
为 `xdescribe` / `xit` 的本地用例：它需要真实的小程序运行环境（微信开发者工具）
连上 karma server 才能跑完，CI/容器环境下无法执行，保持 pending 属正常状态。

`karma` builder 本身的编译链路（`npm run build:karma`、`dist/karma/client`、
`dist/karma/plugin`）在 `npm run build` 中已验证可用。

## 验证结果（Node v24.21.0）

| 命令               | 结果                                            |
| ------------------ | ----------------------------------------------- |
| `npm ci`           | ✅ 1432 packages                                |
| `npm run build`    | ✅ library + builder + karma 全部产出到 `dist/` |
| `npm run test`     | ✅ 26 specs, 0 failures, 2 pending              |
| `npm run test:ci`  | ✅                                              |
| `npm run coverage` | ✅                                              |
| `npm run lint`     | ✅ 0 error / 0 warning                          |

## Angular 版本升级记录（17 → 18 → 19 → 20）

> 每次升级的参考源码：`angular/angular` 与 `angular/angular-cli`，
> 先 `git checkout <对应 tag>` 再对照修改。同步源版本写在
> `script/package-sync.ts` 的 `gitClone(..., '<tag>')` 里。

### 17 → 18

| 项目                                                      | 变更                                                                                                                                                                                                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 版本                                                      | `@angular/*` 18.2.x、devkit 18.2.x（architect `0.1802.x`）、`@angular/build` 18.2.x、ng-packagr 18.2.x、TS 5.5、webpack 5.94、zone.js 0.14                                                                                                 |
| `purgeStaleBuildCache` / `assertCompatibleAngularVersion` | 从 `@angular-devkit/build-angular/src/utils/*` 迁到 `@angular/build/private`；因 `moduleResolution: "node"` 解析不了 exports 子路径，在 `tsconfig.builder.json` / `tsconfig.spec.json` 用 `paths` 映射到 `@angular/build/src/private.d.ts` |
| browser schema 路径                                       | `src/browser/schema.json` → `src/builders/browser/schema.json`（`script/schema-merge.ts`）                                                                                                                                                 |
| 模板 AST                                                  | 新增 `@let` → `visitLetDeclaration`                                                                                                                                                                                                        |
| 样式                                                      | `lib` 需加 `dom.iterable`（`URLSearchParams` 迭代）                                                                                                                                                                                        |
| 类型                                                      | `compiler.inputFileSystem` 可为 null                                                                                                                                                                                                       |
| 依赖冲突                                                  | `cyia-ngx-devkit` 钉死 devkit 17 → 用 `overrides` 强制升到目标版本；`rxjs` / `webpack` 必须与 devkit 的精确版本一致，否则出现双实例类型冲突                                                                                                |

### 18 → 19

| 项目                             | 变更                                                                                                                                                                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 版本                             | `@angular/*` 19.2.x、devkit 19.2.x、ng-packagr 19.2.x、TS 5.6、webpack 5.98、zone.js 0.15、tslib 2.8                                                                                                                                                   |
| **standalone 默认值变为 `true`** | 所有被 NgModule `declarations` 的 `@Component`/`@Directive` 必须显式写 `standalone: false`（本仓库手写的 forms value accessor 共 9 个，以及 `test/hello-world-app` 与 builder fixture 的全部组件/指令）                                                |
| 模板 AST                         | 新增 `visitTypeofExpression` / `visitTemplateLiteral` / `visitTemplateLiteralElement`                                                                                                                                                                  |
| ng-packagr                       | `StylesheetProcessor` 构造函数在 `cacheDirectory` 前新增 `sass` 参数；Angular 诊断缓存改为 `entryPoint.cache.angularDiagnosticCache`（`get`/`update`）；**不再把逐文件 ESM（`esm2022`）写盘**，只输出 `fesm2022`，`library.spec` 断言相应改为 fesm2022 |
| 同步脚本                         | v19 的 `packages/common/http` 内部改用 `../../index` 相对引用，`package-sync.ts` 新增改写逻辑映射为 `angular-miniprogram/common[/http]`，否则 ng-packagr 报 `TS6059` rootDir 越界                                                                      |

### 19 → 20

| 项目                    | 变更                                                                                                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 版本                    | `@angular/*` 20.3.x、devkit 20.3.x（architect `0.2003.x`）、ng-packagr 20.3.x、TS 5.8、webpack 5.101、rxjs 7.8.2                                                                                                                               |
| **ng-packagr 目录结构** | `lib/**` 全部移动到 `src/lib/**`，所有 `ng-packagr/lib/...` 深引用改为 `ng-packagr/src/lib/...`                                                                                                                                                |
| 表达式 AST              | 移除 `KeyedWrite` / `PropertyWrite`（赋值改为带赋值运算符的 `Binary`）；新增 `visitVoidExpression` / `visitTaggedTemplateLiteral` / `visitParenthesizedExpression`                                                                             |
| 模板 AST                | `Visitor` 新增 `visitComponent` / `visitDirective`                                                                                                                                                                                             |
| webpack                 | `splitChunks.cacheGroups.test` 参数类型收紧为 `Module`（需向下转型 `NormalModule`），返回值必须是 `boolean`                                                                                                                                    |
| 测试顺序                | `test/hello-world-app/node_modules/test-library` 是上一次 library 构建的拷贝，跨大版本时必须先跑 `npm run test:jasmine library`（即 `npm run test:ci`）刷新，否则会残留旧版本指令（如 v19 的 `ɵɵhostProperty` 在 v20 已删除）导致 app 构建失败 |

### 升级操作清单（可复用）

```bash
# 1. 参考源码切 tag
git -C ../angular     checkout <angular-tag>
git -C ../angular-cli checkout <cli-tag>

# 2. 改 package.json / src/library/package.json 版本 + overrides
#    （rxjs、webpack 必须与 @angular-devkit/build-angular 的精确依赖一致）
# 3. 改 script/package-sync.ts 的同步 tag
rm -rf node_modules package-lock.json && npm install   # 直接 npm install 常因旧树报 ERESOLVE

# 4. 重新同步生成源码并构建
git clean -xdfq src/library/common src/library/forms
npm run sync && npm run build

# 5. 先刷新 test-library 再跑全量
npm run test:jasmine library && npm run test
npm run lint && npm run coverage
```

> 注意：本仓库历史代码不是按 prettier 3 默认配置格式化的（`trailingComma`），
> 因此**不要**对未修改的文件批量跑 `prettier --write`，会产生大量无关 diff。
