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

## Angular 版本升级记录（20 → 21 → 22）

### 20 → 21

| 项目                | 说明                                                                                                                                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 版本                | `@angular/*` 21.2.23 / `@angular-devkit/*` 21.2.24 / ng-packagr 21.2.7 / TS 5.9.3 / webpack 5.105.2                                                                                                                                                  |
| ng-packagr 路径变更 | 删掉了 `src/lib/utils/load-esm`，`compile-source-files.ts` 自己加 `ngCompilerCli()` 懒加载                                                                                                                                                           |
| host binding 校验   | 21 起 `typeCheckHostBindings` 默认 `true`，会对 `@HostBinding` 做 DOM schema 校验。本库表单 accessor 绑的是小程序自定义元素（checkbox / switch / radio / slider / picker / picker-view），永远不在 schema 里，全部 NG8002。库与 fixture 都关掉该选项 |
| `@switch` AST 重构  | children 不再挂在 `@case` 上，共享同一份子节点的连续 case 被合并成 `SwitchBlockCaseGroup`。`visitSwitchBlock` 改为按 group 占位，并补 `visitSwitchBlockCaseGroup` / `visitSwitchExhaustiveCheck`                                                     |
| 表达式 AST 新增     | `ArrowFunction` / `SpreadElement` / `RegularExpressionLiteral` / `Unary`，`CustomAstVisitor` 补齐                                                                                                                                                    |
| core 子路径导入     | `@angular/core` 的 fesm 里有 `import '@angular/core/primitives/signals'` 这类 bare 子路径，`moduleResolution: "node"` 认不了 exports map，fixture 改成 `"bundler"`                                                                                   |
| git tag 命名        | Angular 21 起 tag 带 `v` 前缀（20.x 及以前是裸版本号），sync 脚本跟着改                                                                                                                                                                              |
| typedoc             | 0.27 不支持 TS 5.9，升到 0.28.20                                                                                                                                                                                                                     |

> 给 primitives 加 `paths` 指到 `.d.ts` 是**错**的做法：类型能过，但 webpack 会把
> `.d.ts` 当运行时模块加载，`@ngtools` 直接报 `missing from the TypeScript compilation`。
> 正确做法是让 moduleResolution 认 exports map。

### 21 → 22

| 项目                                | 说明                                                                                                                                                                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 版本                                | `@angular/*` 22.1.7 / `@angular-devkit/*` 22.1.8 / ng-packagr 22.1.1 / TS 6.0.3 / webpack 5.109.2                                                                                                                                      |
| **TS 6.0：strict 默认开启**         | 空 tsconfig 也会开 `noImplicitAny`。本仓库 `tsconfig.base.json` 已显式 `strict: false`，但 fixture 的没写，直接继承新默认值，冒出成堆 TS7006 / TS7008 / TS2564。显式补 `strict: false`（单独设置的 `strictNullChecks` 不受影响）       |
| TS 6.0：废弃项变硬错误              | `baseUrl` / `moduleResolution=node10` / `downlevelIteration` / `target=ES5` 全部报错，加 `"ignoreDeprecations": "6.0"`                                                                                                                 |
| TS 6.0：根 tsconfig                 | 根 `tsconfig.json` 是 solution-style（只有 references），但 `code-recycle` 跑 sync 时 ts-node 会拿它直接用。空 `compilerOptions` 让 TS 6 用默认 `target=ES5` 并因缺 `rootDir` 报 TS5107 / TS5011，补上 `target` / `module` / `rootDir` |
| TS 6.0：@types 不再自动全量注入     | karma client 的 tsconfig 显式声明 `typeRoots` 与 `types`（`jasmine` 命名空间、`node` 的 `Console`）                                                                                                                                    |
| `createNgModuleRef` 移除            | 改用 `createNgModule`（签名一致）                                                                                                                                                                                                      |
| `ComponentFactoryResolver` 整体移除 | `NgModuleRef.componentFactoryResolver` 也没了。废弃的 `pageStartup(module, component)` 路径改为用模块 injector 当 `environmentInjector` 走 `createComponent`                                                                           |
| `@content` 新块                     | 内容查询块，依赖运行时 content query 观察投影内容并重渲染。小程序 slot / self 模板是静态的，对不上，按 `@defer` 先例显式抛错                                                                                                           |
| `Object.hasOwn`                     | 同步过来的 `@angular/common` 用到 ES2022 的 `Object.hasOwn`，库的 `lib` 从 es2019 提到 es2022                                                                                                                                          |

### 升级操作清单（21/22 修订版）

```bash
# 1. 参考源码切 tag（21 起 tag 带 v 前缀）
git -C ../angular     checkout v<angular-tag>
git -C ../angular-cli checkout v<cli-tag>

# 2. 改 package.json / src/library/package.json 版本
#    （rxjs、webpack 必须与 @angular-devkit/build-angular 的精确依赖一致）
# 3. 改 script/package-sync.ts 的同步 tag
rm -rf node_modules package-lock.json && npm install

# 4. 重新同步生成源码（离线时用 ANGULAR_REPO 指向本地 clone）
git clean -xdfq src/library/common src/library/forms
ANGULAR_REPO=../angular npm run sync
npm run build

# 5. 先刷新 test-library 再跑全量
npm run test:jasmine library && npm run test
npm run lint && npm run coverage
```

## 同文件多组件支持

### 改造前的实测症状

`ResolvedDataGroup` 的 `outputContent` / `useComponentPath` / `style` 三个 map
**按源文件路径做 key**。同文件多组件时后编译的覆盖先编译的：

| 场景                                    | 结果                                                                                      |
| --------------------------------------- | ----------------------------------------------------------------------------------------- |
| 2 个组件共用一个源文件 + 2 个独立 entry | 先编译的组件模板**彻底丢失**（A 的 wxml 数 = 0），且两个 entry 都渲染成最后编译的那个组件 |
| 元数据                                  | `componentName` 取第一个组件，模板内容却是最后一个组件的 —— 名字和内容对不上              |

### 合法形态

小程序侧「一个组件 = 一个 js = 一次 `Component()` 调用」，所以**同一个 entry 里
注册两个组件本身就不合法**。合法形态是：一个组件源文件导出多个组件，各自用独立
entry 注册。

### 改法

1. **map key 改成 `源文件#组件类名`**（`makeComponentKey` / `splitComponentKey`，
   见 `mini-program-compiler/type.ts`）。`#` 在 POSIX / Windows 路径里都不会出现。
2. **`getComponentPagePattern(fileName, componentClassName?)` 加组件名比对**。
   原来只比对文件路径，两个 entry 各自 import 同一文件的不同组件时分不出来。
3. **`changeComponent` 返回 `componentNames: string[]`**（`componentName` 保留为
   `componentNames[0]`，已标 deprecated）。
4. **`SetupComponentDataService` 按组件逐个产出元数据**，每个组件用自己的
   `outputContent` / `useComponentPath` / `style`，缺内容的组件跳过而不是乱接。

### 一个容易踩的坑

`typeChecker.getSymbolAtLocation(importComponent)` 拿到的声明是 **`ImportSpecifier`**
（`import { X } from ...`），**不是类声明**。所以 `ts.isClassDeclaration(node)` 恒为
false，一开始写的类名比对根本没生效，两个组件仍然都解析到 entry-a。
必须先用 `getAliasedSymbol` 沿 alias 链解到原始 symbol 再取类名
（`resolveImportedComponentName`）。`import { X as Y }` 以原始类名为准。

### 另一个流程上的坑

`npm run test:ci` **不会**用 `tsconfig.builder.json`（strict）类型检查 `src/builder`，
builder 里的 strict 类型错误只有 `npm run build` 才暴露。改完 builder 一定要跑
`npm run build`，不能只跑 test。

---

## 已知问题（未修，遇到时按这里排查）

### 同一个组件被两个 entry 注册 → 第二个 entry 产出残缺组件

**状态**：已知，未修。触发条件偏，先不处理，但产物是坏的且不报错，务必记住这个症状。

**触发写法**

```ts
// entry-a.entry.ts
import { FooComponent } from '../foo.component';
componentRegistry(FooComponent);

// entry-b.entry.ts  —— 注册的是同一个组件
import { FooComponent } from '../foo.component';
componentRegistry(FooComponent);
```

**症状**

`entry-a` 产出完整四件套，`entry-b` **只有 `.js`，没有 `.wxml` / `.json` / `.wxss`**。
构建 `success: true`，没有任何 warning。在微信里表现为该组件页面直接跑不起来。

实测输出：

```
entry-a/entry-a-entry.js     len=585514
entry-a/entry-a-entry.json   len=39
entry-a/entry-a-entry.wxml   len=260
entry-a/entry-a-entry.wxss   len=0
entry-b/entry-b-entry.js     len=585514   ← 只有 js，其余三个文件根本不存在
```

**原因**

`ResolvedDataGroup.outputContent` 里 `foo.component.ts#FooComponent` 只有**一条**记录。
`MiniProgramApplicationAnalysisService.getComponentPagePattern()` 从源文件出发走
反向依赖链（`dependencyUseModule`）找入口，**找到第一个匹配的 entry 就 `break`**，
于是这条模板内容只会被写到 entry-a 的输出路径，entry-b 拿不到任何东西。

**怎么快速确认是不是这个坑**

在构建产物目录里找「只有 js 没有 wxml」的组件目录：

```bash
# 在 dist 里找有 .js 但缺同名 .wxml 的路径
for f in $(find dist -name '*.entry.js'); do
  base="${f%.js}"
  [ -f "${base}.wxml" ] || echo "残缺: $f"
done
```

出现 `残缺` 就往「同一组件被多 entry 注册」上查——去看各 entry 文件里
`componentRegistry(...)` / `bootstrapPage(...)` 的参数是不是指向同一个类。

**注意区分：组件重名不是问题**

| 情况                       | 结果                               |
| -------------------------- | ---------------------------------- |
| 不同文件同名类，各自 entry | ✅ 正常，各归各（已实测）          |
| 同文件同名类               | 构造不出来，JS 语法禁止            |
| 同一组件被 2 个 entry 注册 | ⚠️ 就是本条，第二个 entry 静默残缺 |

复合 key 是 `源文件#类名`，不同文件同名类 key 天然不同；且
`getComponentPagePattern` 的 BFS 从源文件出发，比对范围被限定在该文件的引用者里，
不会跨文件乱匹配。

**如果以后要修**

最小改法：`getComponentPagePattern` 里对同一个 `源文件#组件名` 记录命中的 entry，
发现命中多个就构建期抛错，把静默残缺换成明确提示。改动量很小（一个 Set + throw），
不影响任何现有正常路径。

### 同 entry 注册多个组件（不支持，平台限制）

小程序侧「一个组件 = 一个 js = 一次 `Component()` 调用」，同一个 entry 里注册两个
组件本身就不合法，不做支持。合法形态见上面「同文件多组件支持 → 合法形态」。

## Vite 迁移（进行中）

目标：用 Vite + `@analogjs/vite-plugin-angular` 替掉 webpack。
实测 23 个入口 **1.5s**，webpack 是 5.7s。

### 已打通（commit `a0e47b8`）

`src/builder/vite/`：

| 文件                                    | 作用                                                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `entry-patterns.ts`                     | 从 `DynamicWatchEntryPlugin` 抽出的入站计算，webpack / Vite 共用一份；`toRollupInput` 把 `PagePattern` 转成 Rollup 多入口 |
| `plugins/component-transform.plugin.ts` | transform 阶段注入 `propertyChange`，对应 webpack 的 `component-template.loader`                                          |
| `tsconfig-paths.ts`                     | tsconfig `baseUrl` + `paths` → Vite `resolve.alias`                                                                       |
| `index.ts`                              | Vite 配置组装 + Architect builder 包装                                                                                    |

验证：`src/builder/vite/build.spec.ts` 跑通整个 fixture 多入口构建，
产物里确认注入了 `propertyChange`，且输出路径带目录（与 webpack 时代
`outputFiles.logic` 对齐）。

### 三个必须自己补的坑

1. **Vite / Rolldown 不读 tsconfig paths**。`angular-miniprogram` 这类映射
   在 webpack 侧由 `@ngtools/webpack` 兜掉，Vite 必须自己转成 `resolve.alias`。
   alias 要按 key 长度**倒序**排，否则 `angular-miniprogram` 会把
   `angular-miniprogram/platform/wx` 一起抢走。

2. **平台包替换必须用 RegExp 带边界**。Vite 的字符串 alias 走
   「精确 或 `startsWith(find + '/')`」，写 `'.../wx$'` 会被当字面量，
   根本匹不上。用 `new RegExp('^angular-miniprogram/platform/wx$')`。

3. **注入插件要 `enforce: 'post'`**，保证排在 analog 的 Angular 插件之后，
   这样拿到的才是 AOT 产物（带 `ɵɵdefineComponent` / `rf & 1` / `rf & 2`）
   而不是原始 TS。

另外 `tsconfig.builder.json` / `tsconfig.spec.json` 给 `vite` 加了显式类型入口
（vite 的 `package.json` 没有 `main` / `types` 字段，只靠 exports map，
`moduleResolution: node10` 认不出来）。

### 已打通：产物对等（commit `a9c8ebf` / `bc58481`）

`parity.spec.ts` 把同一份 fixture 分别交给 webpack 和 Vite 构建，8 条断言全绿：

| 断言                                                   | 结果 |
| ------------------------------------------------------ | ---- |
| webpack 构建成功                                       | ✅   |
| vite 构建成功                                          | ✅   |
| 小程序侧产物清单一致（wxml/json/wxss/app.js/app.wxss） | ✅   |
| 每个页面、组件入口 js 两边路径一致                     | ✅   |
| app.js 里 require 的文件都真实存在                     | ✅   |
| app.js 存在且是 require 列表                           | ✅   |
| **wxml 逐字节一致**                                    | ✅   |
| json 语义一致（忽略 key 顺序）                         | ✅   |

补齐的产出：

- **wxml / json / wxss**：`plugins/mini-program-assets.plugin.ts`，
  对应 `ExportMiniProgramAssetsPlugin`
- **library 模板**：`plugins/library-template.plugin.ts`，把 webpack 的
  `library.loader` + `library-template.loader` 合成一个 Vite transform
- **assets**（`app.json` / `project.config.json`）：`copy-assets.ts`
- **app.js require 列表**：按 chunk `imports` 拓扑排序生成，
  保证依赖在前、入口在后（拼接后都是全局作用域，顺序错了会拿到 undefined）
- **app.wxss**：builder 配置里 `styles` 的编译产物

去 webpack 化的适配：

- `ts.System`：换成纯 node fs 实现（原来是 `createWebpackSystem`）
- `webpack.Compiler` 桩：分析服务实际只读 `watchMode` 和
  `inputFileSystem.purge()` 两处，给最小 stub 即可
- 样式编译复用已有的 `CustomStyleSheetProcessor`（ng-packagr 的子类）

**JS chunk 结构不纳入比对**：webpack 有 `runtime.js` / `vendor.js` /
`module-chunk.js` 这套自己的拆包产物，Vite(rolldown) 的 hash 和拆包策略
本来就不同，逐文件比这个没有意义。

### 已打通：watch 模式（commit `a3b4719`）

改成「发现变动就重算入口 + 重跑一次 vite.build」，不用 Vite 原生 watch。

为什么不用原生 watch：Rolldown 的 watch **不支持动态加 input**，
watch 期间新增的入口文件拉不进来。webpack 侧是靠
`DynamicWatchEntryPlugin` 每轮重写 `config.entry` 解决的。
重跑整轮构建顺带把这个问题一起解决，冷构建才 1.5s，dev 体验可接受。

`watch-sources.ts`：

- 优先用传入的 watcher 工厂（测试里是 harness 的 `WatcherNotifier`），
  没有就退化成 `fs.watch` recursive
- 带 debounce，一次保存不会触发多次重建
- builder 侧 `running` / `queued` 两个标志位，构建中又改了会排到下一轮

`watch.spec.ts` 覆盖两条：改模板能重产 wxml、watch 期间新增入口能被拉进来。

### 已确认不需要做：manualChunks

实测 webpack=34 / vite=35 个 js chunk，基本持平，
webpack 那套 `moduleChunks` / `defaultVendors` 在 Vite 下没有收益，不移植。
改成一条 chunk 数量守卫（vite 不超过 webpack 的 1.2 倍），
防止以后改配置改出一堆碎片 chunk。

### 已可用：application-vite builder（commit `036f4c2`）

```jsonc
"builder": "angular-miniprogram:application"        // webpack
"builder": "angular-miniprogram:application-vite"   // Vite
```

### 移除 webpack 的最后一个阻塞点：karma

Vite 链路本身**完全不 import webpack**（`src/builder/vite/**` 里 webpack
只出现在注释里）。真正还在用 webpack 的只剩两块：

| 位置                                    | 说明             | 移除方式                           |
| --------------------------------------- | ---------------- | ---------------------------------- |
| `src/builder/application/**`（11 文件） | webpack 构建链路 | 切到 `application-vite` 后可直接删 |
| `src/builder/karma/**`（3 文件）        | karma 测试链路   | **需要先迁移**                     |

karma 这块不是「换个 bundler」就完事：它走的是
`@angular-devkit/build-angular` 的 karma builder（`execute`），
通过 `webpackConfiguration` hook 注入 `WebpackConfigurationChangeService`
和一个把 jasmine 全局（`describe` / `it` / `expect` / `spyOn`…）映射到
`wx.__window.*` 的 `DefinePlugin`。

要迁 Vite 得替掉 karma builder 自己的打包环节，是独立的一块工作。
另外 karma 那两个 spec 需要微信开发者工具，容器里跑不了（一直是 pending），
所以这块迁移没法像构建链路那样用 parity 自动验证。

### 已打通：karma-vite（commit `7aaef52`）

上面那个阻塞点已经解掉了。**换掉的是「编译这一步用谁」，
karma 的 launcher / reporter / socket 协议一行都没动。**

```jsonc
"builder": "angular-miniprogram:karma"        // webpack
"builder": "angular-miniprogram:karma-vite"   // Vite 打包 + karma runner
```

关键架构点：**打包不经过 karma**。

```
vite.build() 产出 spec 小程序到磁盘
  → 起 karma server（只提供 socket + reporter）
  → 微信开发者工具从磁盘打开产物
  → client 连 socket，jasmine 在小程序运行时里跑
  → 结果回传
```

原来 `plugin/karma.ts` 里那一大堆 webpack compiler 编排（自建 compiler、
`hooks.done -> refreshFiles`、`requestBlocker`）在 Vite 链路下全都不需要，
因为小程序侧的 bundle 是开发者工具**从磁盘读的**，不走 karma 的 HTTP
文件服务——client 只靠 `KARMA_PORT` 连 socket。

`build.spec.ts` 验了三个编译期替换都成立：jasmine 全局 → `wx.__window.*`、
`KARMA_PORT` 注入、组件模板注入（`propertyChange`）。

### 移除 webpack 的完整路径（已无阻塞）

现在还在 import webpack 的只剩两条**已被取代的旧链路**，共 14 个文件：

| 位置                                                           | 文件数 | 取代者             |
| -------------------------------------------------------------- | ------ | ------------------ |
| `src/builder/application/**`                                   | 11     | `application-vite` |
| `src/builder/karma/{index.ts,index.origin.ts,plugin/karma.ts}` | 3      | `karma-vite`       |

`src/builder/vite/**` 和 `src/builder/karma/vite/**` 都**完全不 import webpack**
（只在注释里提）。

删除步骤：

1. 项目里把 `application` → `application-vite`、`karma` → `karma-vite`
2. 跑一段时间确认产物和测试都对
3. 删掉上面 14 个文件 + `package.json` 里的 `webpack` /
   `@ngtools/webpack` / `webpack-bootstrap-assets-plugin` /
   `karma-*` 里只被 webpack 链路用到的部分
4. `builders.json` 里去掉 `application` / `karma` 两个条目

**注意**：`library` builder 走的是 ng-packagr，跟 webpack 无关，不用动。

### 踩过的坑（Vite 迁移专用）

1. **Vite / Rolldown 不读 tsconfig paths**。`angular-miniprogram` 这类映射
   在 webpack 侧由 `@ngtools/webpack` 兜掉，Vite 必须自己转成 `resolve.alias`。
   alias 要按 key 长度**倒序**排，否则 `angular-miniprogram` 会把
   `angular-miniprogram/platform/wx` 一起抢走。

2. **平台包替换必须用 RegExp 带边界**。Vite 的字符串 alias 走「精确 或
   `startsWith(find + '/')`」，写 `'.../wx$'` 会被当字面量，根本匹不上。

3. **注入插件要 `enforce: 'post'`**，保证排在 analog 的 Angular 插件之后，
   这样拿到的才是 AOT 产物（带 `ɵɵdefineComponent` / `rf & 1` / `rf & 2`）
   而不是原始 TS。

4. **`emitFile` 不接受以 `/` 开头的 fileName**（webpack 会归一化）。
   `metaMap` 里有 `/self-template/self.wxml` 这种带前导斜杠的 key，
   必须 strip。注意 wxml 里的 `<import src="/self-template/self.wxml"/>`
   引用要**保留**前导斜杠——小程序里那表示包根路径，是对的。

5. **漏移植 `otherMetaCollectionGroup -> setScopeExtraUseComponents`**
   会导致 `library-template/*.wxml` 产出成 **0 字节文件**——文件在、不报错，
   但内容是空的。这种静默空产物比直接崩难查得多，是靠 parity 的
   **文件内容比对**（而不只是清单比对）抓出来的。

6. `vite` 的 `package.json` 没有 `main` / `types` 字段，只靠 exports map，
   `moduleResolution: node10` 认不出来，要在 tsconfig 里加显式类型入口。

**当前 webpack 链路完全没动**，两套并存，可以随时回退。

## 节点下标两端等价性（进行中）

### 问题

wxml 里烧的是绝对下标（`nodeList[0]` / `nodeList[2]` / ...），运行时
`lViewToWXView` 产出 `nodeList[lViewIndex - HEADER_OFFSET]`。历史上这两套
下标各自独立计算（构建侧 `declIndex` 自己数），中间没有验证。一旦某侧
漏算槽位，后续节点整体错位一位 → 整页渲染崩，**且不抛错误**。

### 已建立的验证

- `test/util/node-manifest.ts` — 从 Angular 编译产出的指令流提取节点清单。
  下标是 `allocateSlots` 算好后烤进每条指令首参的，等价于 Angular 官方口径。
- `src/builder/mini-program-compiler/manifest-registry.ts` — builder 生成
  wxml 时同源记录组件身份（此刻 componentKey 权威已知，不受 code-splitting 影响）。
- `src/builder/vite/node-index-equivalence.spec.ts` — 三层断言 + 三条反向对照
  （反向对照证明校验真的会咬，不是只会通过的摆设）。

### 关键认知（都验证过）

1. **每个视图的下标各自从 0 开始**。`allocateSlots` 注释：
   "Slot indices start at 0 for each view (and are not unique between views)"。
   对应 wxml 的 `<template name="ifBlock_3">` 具名块，块内也是 0 基。
   → 把整个 wxml 的 nodeList 下标混成一个集合是错的。

2. **本 fork 有 `ɵɵdom*` 系列 patched 指令**：`domElementStart` /
   `domElement` / `domElementContainer` / `domElementContainerStart` /
   `domTemplate` 都消耗节点槽。漏了它们曾导致「8 个组件 off-by-one」的误报
   —— 实际产物是正确的，是提取器不完整。

3. **Angular 用链式调用 codegen**（本轮新发现，见下）。

### 本轮发现：链式调用 codegen（修复未完成）

`ɵɵelementStart` 的返回类型是 `typeof ɵɵelementStart`（**返回自身**），
所以 Angular 把连续的同类调用写成链：

```js
ɵɵelementStart(2, "app-content-multi")(3, "div", 0);
ɵɵelementEnd()();
```

这**合法且有意**，不是 corruption（webpack 与 Vite 产物中均存在，
与 CJS/ESM 格式无关，也不经我们任何 transform）。

但对提取器是陷阱：第二个节点没有独立的 `ɵɵelementStart(3,` 文本，
而是 `)(3, "div", 0)`，按「指令名 + 首参」匹配就漏掉 index 3。

这正是 `KNOWN_ROOT_BLOCK_GAPS` 里 4 个组件（ControlFlow /
CustomStructuralDirective / DefaultStructuralDirective / NgContent）
根视图下标缺口的**根因**。

### 下一步（未完成的修复）

在 `extractNodeManifest` / `extractViewTree` 的 walk 中展开调用链：

```ts
function unwrapCallChain(node: ts.CallExpression): ts.CallExpression[] {
  const links: ts.CallExpression[] = [];
  let cur: ts.Expression = node;
  while (cur && ts.isCallExpression(cur)) {
    links.unshift(cur);
    cur = cur.callee;
  }
  return links;
}
```

以 `links[0].callee` 的指令名为准，链上每一环都按同一指令处理，
各自取首参作为节点下标，并把各环加入 `seen` 避免重复计数。

**注意**：本轮尝试该改法时，直接单测显示链未被正确展开
（`links=1`、`base=undefined`），未能定位原因即因上下文耗尽而回退。
下次接手请**先写一个最小单测**（内联一段含链式调用的源码，断言 indices
完整），确认提取器行为后再改 walk，不要直接改 walk 再跑大测试。

### 当前状态

`KNOWN_ROOT_BLOCK_GAPS` 固化了这 4 个组件，子集断言——只能缩小不能扩大。
具名模板块（ifBlock / forBlock 等）已 100% 覆盖，且有一条无豁免清单的
断言锁住。
