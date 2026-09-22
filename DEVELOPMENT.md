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

## 去 zone.js 化（zoneless）与 signal input/output

### 背景

Angular v20 已经可以完全不依赖 `zone.js`（`provideZonelessChangeDetection()`）。
本仓库原先靠 `NgZone.run()` 从「小程序侧」触发变更检测，靠
`runOutsideAngular()` 把 diff/setData 排除在 Angular 之外。现在改为：

- 进入 Angular 的回调执行完后，显式
  `ChangeDetectionScheduler.notify(ɵNotificationSource.Listener)`；
- 需要「在 Angular 之外跑」的部分本来就不会触发 CD，直接调用即可。

### 关键改动

| 位置                                                              | 变更                                                                                                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/library/platform/util/change-detection.ts`                   | 新增 `runInAngular()` / `scheduleChangeDetection()`，统一封装「执行回调 + 通知调度器」                                                                  |
| `src/library/platform/default/platform-core.ts`                   | `__ngZone` 换成 `__ngChangeDetectionScheduler`；事件回调改为 `try { handler() } finally { notify() }`；`runOutsideAngular` 包裹的 diff/setData 直接执行 |
| `src/library/platform/default/component-template-hook.factory.ts` | `propertyChange()` 不再取 `NgZone`                                                                                                                      |
| `src/library/platform/page.service.ts`                            | 页面注册改用 `runInAngular(injector, ...)`                                                                                                              |
| `src/library/platform/http/backend.ts`                            | 注入 `ChangeDetectionScheduler`，所有 `Zone.current.run(...)` 改为 `this.runInAngular(...)`                                                             |
| `src/library/platform/type/type.ts`                               | `MiniProgramComponentVariable.__ngZone` → `__ngChangeDetectionScheduler`                                                                                |
| `src/library/declaration/index.d.ts`                              | 删除 `declare const Zone: any`                                                                                                                          |
| `src/builder/application/webpack-configuration-change.service.ts` | DefinePlugin 不再映射全局 `Zone`                                                                                                                        |
| `src/builder/platform/template/app-template.js`                   | 平台模板不再导出 `Zone`                                                                                                                                 |
| `script/package-sync.ts`                                          | 同步 `@angular/common/http` 时剥掉 `fetch.ts` 里的 `import type {} from 'zone.js'` 与 `Zone.current`（zoneless 下 `reqZone` 恒为 `undefined`）          |
| `test/hello-world-app/src/main.ts` / `test.ts`                    | 删除 `import 'zone.js'`                                                                                                                                 |
| `test/hello-world-app/src/main.module.ts` / `main-test.module.ts` | `providers: [provideZonelessChangeDetection()]`                                                                                                         |

> 库本身不再强制 zoneless：由使用方在 root provider 里加
> `provideZonelessChangeDetection()`。库只是不再产生任何 zone 依赖。

### signal input / output

fixture 里所有 `@Input()` / `@Output()` 已改为 `input()` / `output()`。
注意 **模板里读 signal 必须显式调用**（`{{ input1() }}`、`*ngFor="let x of list()"`），
Angular 的模板插值不会自动 unwrap signal。

新增覆盖：

- `src/library/platform/util/change-detection.spec.ts`：5 个 Node 端单测，
  覆盖返回值、通知次数、抛错时仍然通知、自定义通知来源。
- `src/builder/zoneless.spec.ts`：构建整个 fixture 后扫描产物，
  断言没有 `__zone_symbol__` / `zone.js/dist`，且包含 `ChangeDetectionSchedulerImpl`。
- `test/hello-world-app/src/spec/signal-io-spec/`：小程序内 karma 用例，
  验证 signal input 渲染 + signal output 回传（需微信开发者工具，容器内跑不了）。

### 已知限制

`ChangeDetectionScheduler` 只在 `notify()` 之后调度一次 tick。若将来新增
「从 `NgZone` 之外进入 Angular」的入口，必须显式调用
`scheduleChangeDetection()`，否则视图不会刷新。

## 内建控制流（`@if` / `@for` / `@switch`）

模板编译器（`src/builder/mini-program-compiler`）已支持 Angular 17+ 的内建控制流语法，
实现位置：`parse-node/template-definition.ts` 的 `visitIfBlock` / `visitForLoopBlock` /
`visitSwitchBlock`。

### 原理

内建控制流在 Angular 里最终也会编译成 embedded template（`ɵɵconditionalCreate` /
`ɵɵrepeaterCreate`），和 `<ng-template>` 是同一套锚点机制，所以可以直接复用
`ParsedNgTemplate` 与 wxml 的 `<block wx:for="{{nodeList[i]}}">` 渲染方式：
`nodeList[i]` 是该锚点下已创建视图的数组，条件为假时数组为空，天然实现显隐。

分支内容是独立的 embedded view，拥有自己的声明索引空间，因此子节点用新的
`TemplateDefinition` 访问，不影响当前视图的 `declIndex`。

### 槽位（declIndex）分配规则

必须和 Angular 的 `slot_allocation` + `pipe_creation` 两个 phase 完全一致，
否则后面所有节点的 `nodeList[i]` 都会错位。规则（实测 20.3.x 产物得出）：

| 语法              | 槽位布局                                                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `@if` / `@switch` | `i` = 第一个分支模板；`i+1 .. i+P` = **所有**分支条件表达式里的管道（统一插到第一个 create 之后）；`i+P+1 ..` = 其余分支模板            |
| `@for`            | `i` = `RepeaterMetadata`（不是 TNode，不可渲染但必须占位）；`i+1` = 主模板；`i+2` = `@empty` 模板（若有）；其后是被遍历表达式的管道槽位 |

`track` 表达式 Angular 禁止使用管道，无需考虑。

### 模板名唯一性

wxml 的 `<template name>` 必须全文件唯一。以前用 `ngDefault_${index}`，而 `index`
是每个 embedded view 各自从 0 重新计数，嵌套时会重名互相覆盖
（`complex-structure` 里原本就有 4 个 `ngDefault_1`）。
现在 `TemplateDefinition` 带 `namePrefix`，每下一层追加 `${index}_`，
控制流模板名形如 `ifBlock_15_1`，保证全局唯一。

### 未实现

- `@defer`：依赖延迟加载与触发器调度，和小程序静态模板机制对不上，
  直接抛错（静默渲染成空白更难排查）。
- `@unknown`：抛错。

### 测试

- `src/builder/control-flow.spec.ts`：构建 fixture 后交叉校验
  wxml 里的控制流锚点与编译产物 JS 的 `conditionalCreate` / `repeaterCreate` 索引一致，
  并断言模板名不重复。
- `test/hello-world-app/src/__pages/control-flow/`：覆盖 `@if`/`@else if`/`@else`、
  `@if (x; as y)`、条件带管道、`@for`+`@empty`+`$index`、`@switch`+`@default`、控制流嵌套。
- `test/hello-world-app/src/spec/control-flow-spec/`：小程序内验证渲染与状态切换
  （需微信开发者工具）。

## 页面 standalone 化与 `bootstrapPage`

### 背景

以前一个页面要三个文件：`foo.component.ts`（`standalone: false`）+ `foo.module.ts` +
`foo.entry.ts`（`pageStartup(FooModule, FooComponent)`）。即使组件根本不需要 NgModule，
也必须先声明一个模块才能启动。

### 现在的写法

```ts
// foo.component.ts
@Component({
  standalone: true,
  imports: [CommonModule, SomeComponent, SomeDirective],
  templateUrl: './foo.component.html',
})
export class FooComponent {}

// foo.entry.ts
import { bootstrapPage } from 'angular-miniprogram';
bootstrapPage(FooComponent); // 页面
bootstrapPage(FooComponent, { useComponent: true }); // 以 Component 而非 Page 启动
```

`pageStartup(module, component)` 标记 `@deprecated` 但保持可用，内部走
`__ngStartPageWithModule`。

### 运行时改动

- `AppOptions.__ngStartPage(component, instance)` 改为 standalone 语义，
  内部 `createComponent` + `EnvironmentInjector`，不再产生 `NgModuleRef`。
- `PageService.createPageInjector()` 统一构造带 `PAGE_TOKEN` 的子注入器。
- `linkNgComponentWithPage` 的 `ngModuleRef` 改为可选，destroy 时用可选链。

### 编译器改动（standalone 引入 NgModule 的展开）

standalone 组件的 `imports` 允许直接写 NgModule。这时
`R3ComponentMetadata.declarations` 里会出现 `R3TemplateDependencyKind.NgModule`
（值为 2）的项，它只带一个指向**模块标识符**的 `type.node`，没有普通依赖上的
`ref.node`，直接拿去查元数据会 `Cannot read properties of undefined`。

`MiniProgramCompilerService.resolveTemplateDeclarations()` 的处理：

1. 没有 `kind === 2` 的项 → 原样返回，非 standalone 组件行为完全不变。
2. 有 → 改用 Angular 自己的 `TypeCheckScope`
   （`ngCompiler.compilation.typeCheckScopeRegistry.getTypeCheckScope()`）拿扁平化后的
   作用域，模块会被展开成它导出的指令与管道。

展开出来的是 ngtsc 的 `DirectiveMeta` / `PipeMeta`，与下游
`ComponentContext` 读的 R3 形状不一致，需要补齐：

| R3 期望                      | ngtsc 实际             | 处理                              |
| ---------------------------- | ---------------------- | --------------------------------- |
| `importedFile: SourceFile`   | 无                     | 用 `dep.ref.node.getSourceFile()` |
| `inputs: string[]`（绑定名） | `ClassPropertyMapping` | 取 `reverseMap` 的 key            |
| `outputs: string[]`          | `ClassPropertyMapping` | 取 `reverseMap` 的 key            |

`getComponentPagePattern()` 同时识别两种入口调用：`pageStartup` 取
`arguments[1]`，`bootstrapPage` 取 `arguments[0]`。

## miniprogram-api-typings 3 → 4 → 5

`Component.Options` 的泛型在 v4 从 5 个参数变成 6 个，中间插入了必填的
`TBehavior extends BehaviorOption`（即 `BehaviorIdentifier[]`）作为第 4 位：

```
v3: Options<TData, TProperty, TMethod, TCustomInstanceProperty, TIsPage>
v4: Options<TData, TProperty, TMethod, TBehavior, TCustomInstanceProperty, TIsPage>
```

原来写在第 4 位的 `{}` 落到 `TBehavior` 上会报不满足约束；同时 `TIsPage` 掉回默认
`false`，`methods` 里就没有 `onHide` / `onShow` / `onUnload` 了。迁移方式：

```
Options<{}, {}, {}, {}, true>  ->  Options<{}, {}, {}, [], {}, true>
Options<{}, {}, {}>            ->  Options<{}, {}, {}, []>
```

`Page.Options<TData, TCustom>` 没变。v5 相对 v4 本项目零改动。

## cyia-ngx-devkit 内联

上游包停在 `0.0.5` 且不再更新，`peerDependencies` 钉死
`@angular-devkit/architect@0.1703.1` / `@angular-devkit/core@17.3.1`，
而本项目已经是 20.x。之前靠 `overrides` 强拉版本，每升一次都得再 override。

现在源码在 `test/cyia-ngx-devkit/`，按 20.x 的 architect 类型重写为 TS，
`test/plugin-describe-builder` 用相对路径引用。npm 依赖与对应 `overrides` 已删除
（`tapable` 的 override 保留，那是另一个问题）。

顺带去掉了原实现里 `console.error` -> `process.exit(100)` 的全局钩子：任何一次
`console.error` 都会直接杀掉测试进程，日志都来不及看。
