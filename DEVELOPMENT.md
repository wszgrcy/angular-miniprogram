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
