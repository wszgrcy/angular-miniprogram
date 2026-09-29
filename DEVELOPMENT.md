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

> **上面都是 Node 侧用例**。还有一层「在真·微信开发者工具里跑」的
> 小程序 karma 用例，见下面 [微信真机 karma 测试](#微信真机-karma-测试)。
> 那层需要开发者工具 + 真实 AppID + 手动登录，不能纯命令行无人值守。

---

## 微信真机 karma 测试

### 两层测试的分工

|                | Node jasmine（`npm test`）     | 小程序 karma（`npm run test:wechat`） |
| -------------- | ------------------------------ | ------------------------------------- |
| 跑在哪         | Node 进程，`wx` 用 Proxy 桩    | 真·微信开发者工具里的小程序运行时     |
| 覆盖           | 编译器、纯函数、可 mock 的逻辑 | 渲染、生命周期、`wx.*` 真实行为       |
| 需要开发者工具 | 否                             | **是**                                |
| 需要真实 AppID | 否                             | **是**（游客模式不行）                |
| 需要手动登录   | 否                             | **是**（见下）                        |
| 速度           | 全量约 4 分钟                  | 13 个 spec 约 17 秒                   |

两层不能互相替代。典型例子：内建控制流 `@if` 的 `nodeList` 填充 bug，
Node 侧合成 lView 测不出来，只有真机跑才暴露。

### 前置条件（四条，缺一不可）

**1. 微信开发者工具已安装，且服务端口已开启**

IDE → 设置 → 安全设置 → **服务端口：开**。
没开会直接报：

```
工具的服务端口已关闭。要使用命令行调用，请手动打开工具 -> 设置 -> 安全设置，将服务端口开启。
```

**2. 必须手动启动 IDE 并登录 —— CLI 拉不起来登录态**

这是最容易踩的一条。CLI **能**拉起 IDE 进程（`--port` 会让它启动并监听），
但**那个实例是登出状态**，且等多久都不会恢复：

```
# 已登录状态下 cli quit，再让 CLI 从零拉起：
cli --port 40710 islogin   →  {"login":false}
等待 40s 再查             →  {"login":false}

# 且 profile 是同一个（--debug 实测）：
userDirPath  C:\Users\<user>\AppData\Local\微信开发者工具\User Data\<hash>\Default
```

同 profile、同机器，CLI 拉起的实例就是 `login:false`。

**所以正确顺序是：你手动打开 IDE → 扫码登录 → 再跑测试。**

登录没上的表现很坑，**不会报错**：

```
cli auto  →  ✔ auto          ← 假成功
# 然后小程序永远不连 karma，脚本干等到超时
```

**3. AppID 用游客的就行**

> ⚠️ **两次纠正**。早先记的两条都是错的：
>
> 1. 「游客模式网络被掐」—— 错，当时把「未登录」归因到了 appid 上
> 2. 「游客模式 `cli auto` 不可靠」—— 也错，当时把「会话互斥」归因到了 appid 上
>
> **游客 appid 可以跑测试，实测 13/13 SUCCESS 且可复现。**

网络硬证据（带唯一标记的服务器，验证**内容真的回来了**，不是只看状态码）：

```
loopback >> status=200 marker回传=true
           body={"marker":"FX-TOURIST-OK-9911","echo":"/hello","host":"127.0.0.1:9901"}
LAN      >> status=200 marker回传=true
           body={"marker":"FX-TOURIST-OK-9911","echo":"/lan","host":"192.168.31.198:9901"}
```

标记串、echo 路径、host 头全部原样返回 —— 真实往返，不是缓存也不是假应答。

**之前反复失败的真正原因：会话互斥。**

DevTools 的自动化会话**同一时刻只能有一个**。上一轮跑完脚本只杀了
node/karma，**项目窗口还开在 IDE 里**；新一轮 `cli auto` 去抢会话，
旧连接被强制关掉，karma 那边刚连上就断：

```
Connected on socket
WARN [小程序]: Disconnected (0 times) reconnect failed before timeout of 2000ms (transport close)
Executed 0 of null
```

干净 A/B（同代码、同机器、同游客 appid）：

| 前置动作            | 结果                                         |
| ------------------- | -------------------------------------------- |
| 先 `cli close` 再跑 | ✅ `Executed 13 of null SUCCESS`（连复两次） |
| 不 close 直接跑     | ❌ `transport close` → `Executed 0`          |

**脚本已修**：跑之前自动 `cli close --project <产物>` 并等 8 秒，
不用手动干预。修后连跑两次均全自动 PASS。

**唯一真正需要真实 AppID 的场景**：`cli open`。游客 appid 走 `open`
会报 `code: 10 不存在此 AppID`。但测试链路走的是 `auto`，不是 `open`，
所以碰不到这个限制。

**4. `urlCheck: false`（就是 IDE 里那个「不校验合法域名」勾选）**

IDE → 详情 → 本地设置 →
**「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」**

这个勾选对应 `project.config.json` 里的 `setting.urlCheck`（**反逻辑**：
勾选 = `false`）：

```json
// test/hello-world-app/src/project.config.json
{ "setting": { "urlCheck": false } }
```

**游客模式下这个是必需的，不是可选的。** 原因：

> 域名白名单是挂在 AppID 上的。**游客模式没有 AppID → 没有任何白名单
> 上下文 → 所有域名都不合法**。不关掉校验，连 `127.0.0.1` 都过不了。

所以「游客 + 本地开发」的正确组合是：

| 项             | 值                                                    |
| -------------- | ----------------------------------------------------- |
| AppID          | `touristappid`                                        |
| 不校验合法域名 | **勾选**（`urlCheck: false`）                         |
| 登录           | **需要**（未登录时 `wx.request` 直接 `request:fail`） |

注意最后一行：**游客模式免的是 AppID，不免登录。** 开发者工具本身
仍然要扫码登录，否则请求根本发不出去。

这个设置没开的典型报错：

```
request:fail url not in domain list
```

而登录没上的报错长得不一样（没有 `url not in domain list`）：

```
request:fail        status: undefined     ← 请求根本没发出
```

两个报错能用来快速区分是「域名校验没关」还是「没登录」。

### 怎么跑

```bash
# 1. 手动打开微信开发者工具并扫码登录
# 2. 跑（游客 appid 直接可用，不用 --appid）
npm run test:wechat
# 或显式：
node script/wechat-karma.cjs \
  --project ./test/hello-world-app \
  --dist    ./test/hello-world-app/dist/karma/app
```

仓库里 `src/project.config.json` 提交的就是 `touristappid`，**直接就能跑
测试**，不用换真实 AppID。想换成自己的也可以，用 `--appid` 注入，不进版本库。

脚本做的事：**登录态预检** → **自动 close 残留项目窗口** → 起 karma
→ 等 server ready → `cli auto` → 轮询日志里的 `Executed X of Y`
→ 杀进程 → 按结果 exit 0/1（可直接进 CI）。

**两个预检为什么重要**（都是踩过坑换来的）：

- **登录态**：未登录时 `cli auto` 会假成功，不预检就得干等 180s
  超时且看不出原因。现在几秒内直接告诉你：

```
[wechat-karma] 失败: 开发者工具未登录。
CLI 拉起的 IDE 实例是登出状态（实测同 profile 也不带登录态，等待也不会恢复），
必须手动打开微信开发者工具并扫码登录后再跑。
EXIT=1
```

- **残留窗口**：不先 close 上一轮，会话互斥会导致 `transport close`，
  表现是 `Executed 0`。脚本现在自动 close + 等 8 秒。

IDE 服务端口与 `.ide` 记录不一致时，用 `--ide-port <端口>` 直接指定，
不用去改文件。

### 端口机制（`.ide` 文件）

CLI **不直接问 IDE 端口**，而是读一个状态文件：

```
%LOCALAPPDATA%\微信开发者工具\User Data\<hash>\Default\
  ├── .ide          ← IDE 服务端口
  ├── .ide-status   ← 服务端口开关（"On" / "Off"）
  └── .cli          ← CLI 自己的端口
```

IDE 每次启动**随机挑端口**，而 `.ide` 只在 IDE 自己的启动流程里写。
用 `taskkill /F` 强杀、或直接双击 exe 启动，都会让 `.ide` 与实际端口脱节：

```
.ide = 40710（陈旧）
实际监听 = 41994
→ CLI 读 40710 → ECONNREFUSED → 判定「IDE 没启动」→ 去拉新实例
→ 但已有实例占着 → 40710 永远开不出来 → wait IDE port timeout
```

**`--port` 的关键限制**（实测确认）：

> `--port` 只在「CLI 亲自拉起 IDE」那一次生效。
> 要连**已经在跑**的 IDE，CLI 仍然只认 `.ide` 文件。

所以 IDE 已在跑但端口对不上时，直接把真实端口写回去最快：

```bash
echo 41994 > "$LOCALAPPDATA/微信开发者工具/User Data/<hash>/Default/.ide"
```

### 故障速查表

| 现象                                              | 原因                                   | 解法                                                  |
| ------------------------------------------------- | -------------------------------------- | ----------------------------------------------------- |
| `不存在此 AppID (code 10)`                        | 用了 `touristappid` 走 `cli open`      | 换真实 AppID                                          |
| `需要重新登录 (code 10)`                          | IDE 登录态丢了                         | 手动登录 IDE                                          |
| `✔ auto` 但无测试结果，最后超时                  | 登录态为 `false`（假成功）             | `islogin` 预检，登录后重跑                            |
| `wait IDE port timeout`                           | `.ide` 与实际端口不一致                | 写回真实端口，或干净退出后 `--port` 重拉              |
| `工具的服务端口已关闭`                            | IDE 安全设置里服务端口没开             | 设置 → 安全设置 → 服务端口 开                         |
| `Connected on socket` 后 `no message in 30000 ms` | 上一轮 DevTools 实例还在，把新会话挤掉 | 脚本已自动 `cli close`；手动跑就先 close 旧项目等几秒 |
| `Disconnected ... transport close` → `Executed 0` | 同上，**会话互斥**（不是 appid 问题）  | 同上                                                  |
| `Executed N of null`                              | karma adapter 的 `total` 竞态（已知）  | 脚本已按日志静默判定，不影响结果                      |

### 已验证的网络矩阵

```
目标                              真实 AppID    游客 appid
loopback  http://127.0.0.1:9901     ✅           ✅（标记串回传验证）
LAN       http://192.168.31.198:9901 ✅           ✅（标记串回传验证）
external  https://registry.npmjs.org  ✅           ✅
```

**局域网可通**：手机连同 WiFi 就能打本机 dev server，真机联调不用改代码
（把 karma 的 `clientHost` 指到本机局域网 IP 即可）。

游客与真实 AppID 在网络上**没有区别**，两者都需要：已登录 + `urlCheck:false`。

### 为什么 http spec 打本地服务而不是外部 API

原来打的是 `https://api.realworld.io/api/articles`，该域名已返
**HTTP 530**（Cloudflare 源站不在，宿主机 `curl` 同样 530），测试会
长期红且与代码无关。现在由 `karma.conf.js` 起一个本地 fixture 服务，
请求仍是真的 `wx.request → 127.0.0.1`，**适配层链路一字不变**，
只是响应可控、可重复。见 `src/spec/util/fixture-server.ts`。

---

## 🔴 发布产物形态：包必须是 `type: commonjs`

`src/library/package.json` 里显式写了 `"type": "commonjs"`，**不要删**。

ng-packagr 生成产物时是 `packageJson.type ??= 'module'`——你没写它就给你 `module`。
而 `builder/**` 和 `karma/**` 是 `script/build.ts` 用 CommonJS 编出来的
（`require` / `exports` + 无扩展名的相对 import）。一旦包顶层是 `type: module`，
Node 会把所有 `.js` 当 ESM，于是：

```
require('angular-miniprogram/karma/plugin')
  → exports is not defined in ES module scope
  → Cannot find module './main'   // ESM 解析要求带扩展名
```

库自己的产物是 `.mjs`（扩展名优先，永远是 ESM），所以顶层写 `commonjs`
**不影响 ESM 消费方**，只是让 `builder/` 和 `karma/` 的 CJS 能正常加载。
线上 1.5.2 没有 `type` 字段（等价 commonjs），就是同一个道理。

发布前自检（`npm run build` 之后）：

```bash
cd dist && npm pack && cd /tmp && mkdir s && cd s && npm init -y
npm i <绝对路径>/dist/angular-miniprogram-1.5.2.tgz @angular-devkit/architect --legacy-peer-deps
node -e "console.log(Object.keys(require('angular-miniprogram/karma/plugin')))"
# 期望：[ 'framework:@angular-devkit/build-angular', 'launcher:miniprogram' ]
```

另：`src/builder/karma/plugin/tsconfig.json` 的 `outDir` 是 `dist/karma` 而不是
`dist/karma/plugin`——因为 `index.ts` import 了 `../vite/karma-framework`，
TS 把 rootDir 推断到 `src/builder/karma`，outDir 多写一层会让产物变成
`karma/plugin/plugin/index.js`，与 `exports["./karma/plugin"]` 对不上。

## 🔴 开工前先读这一条

**进 `setData` 的数据里绝不允许 `undefined`，无值一律用 `null`。**

微信对 `setData` 里的 `undefined` 直接拒掉**整个调用**，界面从此冻结；
而且它**只在第二次及以后的 diff 更新才暴露**（首次走整体 setData 会被
JSON 序列化丢掉），所以「首次渲染通过」的测试完全测不到。

完整规则、历史回归案例、检查清单见文末
**《⚠️ 铁律：进 `setData` 的数据里绝不允许 `undefined`》**。

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

| 项目                                 | 说明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 版本                                 | `@angular/*` 22.1.7 / `@angular-devkit/*` 22.1.8 / ng-packagr 22.1.1 / TS 6.0.3 / webpack 5.109.2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **TS 6.0：strict 默认开启**          | 空 tsconfig 也会开 `noImplicitAny`。本仓库 `tsconfig.base.json` 已显式 `strict: false`，但 fixture 的没写，直接继承新默认值，冒出成堆 TS7006 / TS7008 / TS2564。显式补 `strict: false`（单独设置的 `strictNullChecks` 不受影响）                                                                                                                                                                                                                                                                                                                                                                               |
| TS 6.0：废弃项变硬错误               | `baseUrl` / `moduleResolution=node10` / `downlevelIteration` / `target=ES5` 全部报错，加 `"ignoreDeprecations": "6.0"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| TS 6.0：根 tsconfig                  | 根 `tsconfig.json` 是 solution-style（只有 references），但 `code-recycle` 跑 sync 时 ts-node 会拿它直接用。空 `compilerOptions` 让 TS 6 用默认 `target=ES5` 并因缺 `rootDir` 报 TS5107 / TS5011，补上 `target` / `module` / `rootDir`                                                                                                                                                                                                                                                                                                                                                                         |
| TS 6.0：@types 不再自动全量注入      | karma client 的 tsconfig 显式声明 `typeRoots` 与 `types`（`jasmine` 命名空间、`node` 的 `Console`）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `createNgModuleRef` 移除             | 改用 `createNgModule`（签名一致）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `ComponentFactoryResolver` 整体移除  | `NgModuleRef.componentFactoryResolver` 也没了。废弃的 `pageStartup(module, component)` 路径改为用模块 injector 当 `environmentInjector` 走 `createComponent`                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `@content` 新块                      | 内容查询块，依赖运行时 content query 观察投影内容并重渲染。小程序 slot / self 模板是静态的，对不上，按 `@defer` 先例显式抛错                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **ICU 消息**（`{x, plural/select}`） | 编译成 `ɵɵpipe` + `I18nSelect` 动态切换子模板。**实测该节点会真的出现在 `parseTemplate` 结果里**，而 `visitIcu` 曾是空实现 → 整段内容静默消失 + 后续节点槽位错位且不报错。现显式抛错。注：这**不是「做不到」**——本 fork 已有的 `__templateName`（`<template is="{{item.__templateName}}">`）恰好就是它需要的能力，只是未实现                                                                                                                                                                                                                                                                                   |
| **`<ng-content>` fallback 内容**     | 实测空标签与纯空白会被 Angular 归一成 `children = []`，只有写了兜底才有子节点。小程序 `<slot>` 无 fallback 能力，对非空 children 显式抛错（已确认仓内无此用法，不打破现有代码）                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `Object.hasOwn`                      | 同步过来的 `@angular/common` 用到 ES2022 的 `Object.hasOwn`，库的 `lib` 从 es2019 提到 es2022                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **CLI workspace schema**             | 发布包自带 `lib/config/schema.json`（`npm run build:schema` → `script/build-cli-schema.ts`），让 `angular.json` 的 `$schema` 指到本包时也能拿到 `angular-miniprogram:application / library / karma` 的补全与校验。基底直接读 devDependencies 里的 `@angular/cli/lib/config/schema.json`（不入库也不缓存），**跟的也就是 `package.json` 里钉住的那个 CLI 版本**，升 CLI 时产物自动跟着走。拼装逻辑对齐 CLI 的 `tools/ng_cli_schema_generator.js`（内联时剥掉 `required` / `$schema` / `x-prompt`，内部 `$ref` 命名空间化），并把本包 builder 加进兜底分支的 `not.enum`——漏了会让 `oneOf` 同时命中两条而校验失败 |

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

## 节点下标两端等价性（已完成）

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

### 根因一：链式调用 codegen（已修复）

`ɵɵelementStart` 的返回类型是 `typeof ɵɵelementStart`（**返回自身**），
所以 Angular 把连续的同类调用写成链：

```js
ɵɵelementStart(2, 'app-content-multi')(3, 'div', 0);
ɵɵelementEnd()();
```

这**合法且有意**，不是 corruption（webpack 与 Vite 产物中均存在，
与 CJS/ESM 格式无关，也不经我们任何 transform）。

但对提取器是陷阱：第二个节点没有独立的 `ɵɵelementStart(3,` 文本，
而是 `)(3, "div", 0)`，按「指令名 + 首参」匹配就漏掉 index 3。

这正是 `KNOWN_ROOT_BLOCK_GAPS` 里 4 个组件（ControlFlow /
CustomStructuralDirective / DefaultStructuralDirective / NgContent）
根视图下标缺口的**根因**。

### 修复一：展开调用链

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

**踩坑记录**：TypeScript 的 `CallExpression` 表示被调用方是
**`.expression`**，不是 ESTree 的 `.callee`。第一版写了 `cur.callee`，
恒得 `undefined`，链完全展不开。在 100+ spec 的大测试里看不出来，
在单测里一眼就见了。

**流程教训**：先写最小单测（`src/builder/node-manifest-unit.spec.ts`，
5 条，秒级反馈）确认提取器行为，再改 walk。上一轮直接改 walk 跑大测试，
在噪音里定位不动，白烧一轮上下文。

另外 `extractNodeManifest` 与 `extractViewTree` 是**两份独立的 walk 实现**，
只改一处不够（漏改时缺口只从 4 降到 4，补上才到 1）。

### 根因二：非贪婪正则切不开嵌套具名模板（已修复）

`splitWxmlBlocks` 用 `/<template name="x">[\s\S]*?<\/template>/g` 切具名
模板，但 wxml 里具名模板**可以嵌套**：

```html
<template name="Case_18_Template">
  <view>
    <template name="Case_18_Conditional_1_Template"> ... </template>
  </view>
</template>
```

非贪婪 `*?` 在**第一个** `</template>` 处停下，外层模板的闭合残尾
`</block></view></template>` 留在"根区"里，把不属于根视图的下标
算了进来。

修复：`test/util/wxml-blocks.ts` 做**标签深度平衡**扫描，嵌套具名模板
随父块整体带走。

**关键不变量**：不能断言根区「没有 `</template>`」——
`<template is="x">` **调用**标签本身就带闭合，那是合法的。
要防的是**孤儿闭合**，所以断言是开/闭标签**数量平衡**。

### 当前状态

| 清单                    | 演进      | 现状                      |
| ----------------------- | --------- | ------------------------- |
| `KNOWN_ROOT_BLOCK_GAPS` | 4 → **1** | 剩 `ControlFlowComponent` |
| `KNOWN_EXTRACTION_GAPS` | 1 → **0** | 已清空                    |
| `KNOWN_PRECISION_GAPS`  | 4 → **1** | 仅 `ControlFlowComponent` |

`KNOWN_PRECISION_GAPS` 保留的那一项是**该测试口径本身的局限**，不是产物
错误：「按组件精确」把组件所有 wxml 下标拍成并集去比，而
ControlFlowComponent 的 wxml 含大量具名块（`ifBlock_3` / `forBlock_11` /
`Case_18` ...），那些下标属于**各自子视图**的 0 基空间，混进组件级并集
必然串。更精确的「按视图分块」测试已**零缺口**覆盖同一批组件。

所有清单仍是子集断言——只能缩小，不会悄悄扩大。

### 验证矩阵（当前）

| 断言                       | 覆盖                                   |
| -------------------------- | -------------------------------------- |
| 下标并集两端一致           | 全部组件                               |
| 按组件精确                 | 除 ControlFlow（口径局限，已注释说明） |
| **按视图分块**             | 除 ControlFlow 根块（具名块下标串扰）  |
| 具名模板块无豁免           | 全部                                   |
| 反向对照（假等价必须被抓） | 3 条                                   |
| 分块器单测                 | 4 条                                   |
| 提取器 codegen 形态单测    | 5 条                                   |

### 根因三：repeaterCreate 的锚点槽未被记入（已修复）

`@for` 编译成 `ɵɵrepeaterCreate`，Angular 把**主模板与 @empty 模板都作为
参数**传入，不像 `@if` 那样为锚点单独发一条指令：

```js
repeaterCreate(
  10,
  ControlFlowComponent_For_11_Template,
  2,
  3,
  'div',
  8,
  ɵɵrepeaterTrackByIdentity,
  false,
  ControlFlowComponent_ForEmpty_12_Template,
  2,
  0,
  'div',
  9,
);
```

槽布局（与 builder 侧 `template-definition.ts` 注释一致）：

| 槽  | 含义                               |
| --- | ---------------------------------- |
| 10  | RepeaterMetadata（不可渲染但占位） |
| 11  | 主模板锚点                         |
| 12  | @empty 模板锚点（若有）            |

按「指令名 + 首参」提取只得到 `repeaterCreate@10`，漏掉 11/12。
wxml 却引用 `nodeList[11]` / `nodeList[12]` → 报未覆盖。

**这是提取器不完整，不是产物错误。**

锚点下标**直接编码在模板函数名里**（`For_11_Template` → 11），
提取器用它比按位置猜更稳，且能与名字交叉校验。

### 最终状态

| 清单                    | 演进          | 现状                                  |
| ----------------------- | ------------- | ------------------------------------- |
| `KNOWN_EXTRACTION_GAPS` | 1 → **0**     | 已清空                                |
| `KNOWN_ROOT_BLOCK_GAPS` | 4 → 1 → **0** | 已清空                                |
| `KNOWN_PRECISION_GAPS`  | 4 → **1**     | 仅 `ControlFlowComponent`（口径缺陷） |

`KNOWN_PRECISION_GAPS` 那一项是**该测试口径本身的缺陷**：组件级并集
把各视图的 0 基下标空间混在一起，而 Angular 明确「not unique between
views」。更强的「按视图分块」已零缺口覆盖同一批组件，本项实为被取代的
弱断言，保留只为不丢历史信号。

### 验证矩阵

| 断言                       | 覆盖                 | 抓到什么                    |
| -------------------------- | -------------------- | --------------------------- |
| 下标并集两端一致           | 全部组件             | 下标整体漂移                |
| **按视图分块**             | **全部组件，零缺口** | 视图级下标错位              |
| 具名模板块无豁免           | 全部                 | 漏验某个具名块              |
| **标签类型对应**           | **115 对**           | 下标对但节点类型错          |
| **运行时 lView→nodeList**  | **4 条**             | HEADER_OFFSET 用错 / 漏算槽 |
| 反向对照（假等价必须被抓） | 5 条                 | 校验本身失效                |
| 分块器单测                 | 4 条                 | 嵌套具名模板切分            |
| 提取器 codegen 形态单测    | 6 条                 | 链式调用 / repeater 锚点    |

### 「一一对应」的澄清

**断言是 ⊆（覆盖），不是一一对应，而且本就不该是一一对应**：
有些 Angular 槽不可渲染（`RepeaterMetadata@10`、管道槽等），
wxml 里没有对应元素是正常的。

准确表述是：**wxml 引用的每个下标，在对应视图的 Angular 指令槽号里
都真实存在，且类型一致；运行时 `lViewToWXView` 确实把该槽的节点
放到 `nodeList` 的对应位置。**

### 仍未覆盖

真实组件在小程序运行时里的完整渲染（`getCurrentPages()` / DevTools）。
本环境无法运行微信开发者工具。`test/hello-world-app/src/spec/**`
那些 karma spec 需要小程序模拟器，属于另一条链路。

但下标算术、节点身份、类型映射这三段已在 Node 侧覆盖，
真实渲染若出问题，出在这三段之外的概率已大幅降低。

三个根因（链式 codegen / 嵌套具名模板切分 / repeater 锚点槽）
都是**提取器与分块器**的缺陷，产物本身一直是对的。

## 半运行时测试（boot 已跑通，比对逻辑待接）

### 目标

在 Node 里 boot 真实组件，拿 `getPageRefreshContext` 产出的**真实
`nodeList`**，与页面 wxml 的下标需求比对：

nodeList.length 必须 > wxml 里最大的 nodeList[k]

现有 `lview-to-node-list.spec.ts` 用的是**合成** lView（N 是编的），
只验证下标算术，没跟真实 wxml 比对。这条补上后，「运行时数据是否
超出 wxml 索引范围」就是**测出来的**，不是推断的。

### 已铺好的前置（已提交 4d5bf73）

| 障碍                                   | 解法                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------- |
| 50 处包自引用 Node 运行时解析不了      | `tsconfig-paths` 挂 `Module._resolveFilename`                           |
| `MINIPROGRAM_GLOBAL = wx` 直接引用全局 | Proxy 兜底装 `wx` + `App`/`Page`/`Component`/`getApp`/`getCurrentPages` |

### 关于 zone 的澄清

项目**就是 zoneless**，zone.js 连装都没装。真实配置在 app 的 NgModule：

```ts
providers: [provideZonelessChangeDetection()];
```

spike 一度撞 NG0908 是因为用了裸 `createEnvironmentInjector` 且试图
import `NG_ZONE_CONFIG`（`ɵ` 私有 token，非公开 API）。

### spike 进展（逐关打通）

| 关卡                                     | 结果                                            |
| ---------------------------------------- | ----------------------------------------------- |
| 包自引用解析                             | ✅ 通                                           |
| `wx` / `App` 全局                        | ✅ 通                                           |
| zone（NG0908）                           | ✅ 用 `provideZonelessChangeDetection()` 后消失 |
| `RendererFactory2`（NG0407）             | ✅ 提供 `MiniProgramRendererFactory` 后解决     |
| `ChangeDetectionSchedulerImpl`（NG0201） | ✅ 见下                                         |
| 真实 boot                                | ✅ **已跑通**，拿到真实 lView / nodeList        |

### 打通最后两关的做法

`provideZonelessChangeDetection()` 返回 `{ɵproviders: [...]}`，其中
第 0 条只是 `{provide: <接口>, useExisting: ChangeDetectionSchedulerImpl}`
——**引用**实现但不**提供**实现。实现类由 bootstrap 内部注册，
裸 `createEnvironmentInjector` 拿不到。

解法：把实现类自己注册进去。

```ts
import { ɵChangeDetectionScheduler } from '@angular/core';

const env = createEnvironmentInjector(
  [
    ...flattenZonelessProviders(), // 摊平 ɵproviders（含一层嵌套）
    ɵChangeDetectionScheduler, // 实现类要自己补
    MiniProgramRendererFactory,
    { provide: RendererFactory2, useExisting: MiniProgramRendererFactory },
  ],
  platform.injector,
  'spike',
);
const ref = createComponent(SpikeComponent, {
  elementInjector: env,
  environmentInjector: env,
});
ref.changeDetectorRef.detectChanges();
const lView = (ref.hostView as any)._lView;
const ctx = getPageRefreshContext(lView); // 真实 nodeList
```

注意**不要**在 spec 文件里内联 `@NgModule` 并 import `MiniProgramModule`
——它的 `constructor(pageService: PageService)` 在 ts-node JIT 下会
NG0202。直接提供 renderer 绕开。

### 遗留疑点（下一步要查，且本身就是有价值的信号）

boot 出来的数据：

| 量                        | 值                                                           |
| ------------------------- | ------------------------------------------------------------ |
| `ɵcmp.decls`              | 6（模板 `<div>hello<span>x</span><p>y</p></div>`，编译正确） |
| `tView.bindingStartIndex` | 28                                                           |
| `LVIEW.HEADER_OFFSET`     | 27（已对 Angular 交叉验证）                                  |
| `nodeList.length`         | **1**                                                        |

`bindingStartIndex(28) - HEADER_OFFSET(27) = 1`，但 `decls = 6`。
两种可能：

(a) `ref.hostView._lView` 取的是**宿主视图**而非模板视图，
模板节点在子 lView 里；
(b) `detectChanges()` 没跑完 create pass，`bindingStartIndex` 是中间态。

**这个差异正是该测试要抓的东西** —— 如果真实运行时 nodeList 真的比
模板声明的节点少，wxml 引用高位下标就会越界。所以这不是「测试没写好」，
而是测试开始给出真实信号了，需要分辨是取错视图还是真问题。

### 下一步

1. 分辨上面 (a)/(b)：试 `ref._lView`、或从 `hostView` 往下找模板子视图，
   确认哪个 lView 的 `bindingStartIndex - HEADER_OFFSET === decls`。
2. 确认后用**真实页面组件**（非为测试造的组件）boot，
   与已构建产物 wxml 比对：
   `nodeList.length > max(nodeListIndices(wxml))`
   wxml 侧用 `test/util/wxml-blocks.ts` 的 `nodeListIndices()`。

### 本轮排查结论：JIT 这条路走不通（已定位根因）

试过把测试用的 `@NgModule` 移出 spec、独立成 fixture 文件、空 ctor、
`DoBootstrap` 手动挂 standalone 组件 —— 仍然 NG0202。

**根因**：`tsconfig.base.json` 里 `emitDecoratorMetadata` 是**注释掉的**：

```jsonc
"experimentalDecorators": true
// "emitDecoratorMetadata": true,     ← 没开
```

没有它，JIT 拿不到 `design:paramtypes`，于是
`MiniProgramModule.constructor(pageService)` / `PageService` 的 4 参 ctor
全部无法解析 → NG0202。

在 `tsconfig.spec.json` 里单独打开 `emitDecoratorMetadata` **也没用**
—— 与 `static-injector` 的 transformer 冲突（该 transformer 自己处理
DI，走的是另一套元数据，Angular 的 JIT 读不到）。

所以：**`platformMiniProgram().bootstrapModule()` 这条 JIT 路在本仓库
的编译设置下走不通**。库能正常构建是因为走的是 AOT 式 transform，
不是 JIT。

### 同时确认的事实

`node_modules/@angular/core/fesm2022/_pending_tasks-chunk.mjs`:

const HEADER_OFFSET = 27

**我们的 `LVIEW.HEADER_OFFSET = 27` 是对的**，之前怀疑它错了可以排除。

### 剩下的真问题

裸 `createEnvironmentInjector` 能 boot（拿到真实 lView / nodeList），
但 `nodeList.length = 1` 而 `decls = 6`。缺的是**完整的 create pass**，
而它需要 `ApplicationRef`（`attachView`）—— 裸 injector 里没有
`ApplicationRef`（NG0201）。

于是形成闭环死结：

| 路径                   | 缺什么                                   |
| ---------------------- | ---------------------------------------- |
| 裸 injector            | 缺 `ApplicationRef` → create pass 不完整 |
| 真实 `bootstrapModule` | JIT 元数据缺失 → NG0202                  |

### 若要继续，两条可选路（都需要新增件）

1. **加 `@internal` 测试专用 bootstrap**：在库里写一个函数，手工建立
   `ApplicationRef` + 完整 injector（不经 JIT），用 `@internal` 注释
   不对外导出。工作量中等，但要碰 Angular 内部装配逻辑。

2. **改用 karma 真实运行时**：`test/hello-world-app/src/spec/**` 那套
   已经在真实小程序运行时里跑（`getCurrentPages()`）。在那里读
   `nodeList` 与 wxml 比对，天然完整。需要小程序模拟器环境。

**推荐 2** —— 那条路已经在跑，且测的是真实运行时而非模拟装配。

---

# ⚠️ 铁律：进 `setData` 的数据里**绝不允许 `undefined`**

> 这是本仓库最容易反复踩的坑，且**只在第二次及以后的更新才暴露**。
> 写任何往 `setData` 送的东西之前，先读完这一节。

## 现象

微信开发者工具里报：

```
Setting data field "nodeList.11.0.__templateName" to undefined is invalid.
```

**关键：不是只丢那一个字段，而是整个 `setData` 调用被拒绝。**
后果是界面从此**完全不再更新** —— 用户看到「点一下动一次，之后就冻住」。

## 三种「没有值」的区别

| 写法        | `setData` 接受？    | wxml `{{x \|\| '兜底'}}`  | 说明                                         |
| ----------- | ------------------- | ------------------------- | -------------------------------------------- |
| `undefined` | ❌ **整次调用失败** | —                         | 绝对禁止                                     |
| `null`      | ✅                  | 走兜底（`null` 是 falsy） | **无值时的正确表示**                         |
| 字段不存在  | ✅                  | 走兜底                    | 但会让 diff 误判「key 数量变了」→ 退化成全量 |

**结论：无值一律用 `null`，不要用 `undefined`，也不要省字段。**

## 为什么「第一次正常，之后就坏」

这是它最难查的地方：

- **首次渲染**走**整体** `setData`，对象里的 `undefined` 在 JSON
  序列化时被直接丢掉 → 看不出任何问题
- **后续更新**走 **diff**，产出的是**路径式 key**：

  ```js
  { "nodeList.11.0.__templateName": undefined }
  ```

  路径式 key 上的 `undefined` **不会被序列化丢掉**，直接撞上微信的
  参数校验 → 整次 `setData` 被拒 → 冻结

所以「首次渲染通过」的测试**完全测不到这个坑**。必须测
「改状态 → 再渲染 → diff → setData」。

## 真实触发案例：`*ngIf` 切换

```html
<div *ngIf="flag; else ngIfElseTemplate">默认if为显示</div>
<ng-template #ngIfElseTemplate><div>else时显示</div></ng-template>
```

`__templateName` 取自模板声明名 `tView.declTNode.localNames[0]`：

| 分支   | 模板                              | 有无 `#ref` | 名字                 |
| ------ | --------------------------------- | ----------- | -------------------- |
| `if`   | `*ngIf` 脱糖出的 `<ng-template>`  | **无**      | 取不到               |
| `else` | `<ng-template #ngIfElseTemplate>` | 有          | `'ngIfElseTemplate'` |

于是：

```
第一次点（if → else）   diff 送出字符串        → 正常 ✅
第二次点（else → if）   diff 送出 undefined    → 整次 setData 被拒 ❌
```

「只能点击一次」就是这么来的。

## 历史回归：旧实现本来是 `null`，被改成了 `undefined`

**旧实现**（`script/package-sync.ts` 里的 AST patch，改 Angular 的
`ng_if.ts` / `ng_for_of.ts` / `ng_switch.ts` / `ng_template_outlet.ts`，
把 `__templateName` 注入到 `createEmbeddedView` 的 context）：

```js
// getTemplateNameExpressionStr()
(tpl as any)._declarationTContainer.localNames
  ? (tpl as any)._declarationTContainer.localNames[0]
  : null                    // ★ 兼底是 null
```

因为内置结构指令**全被 patch 过**，`context.__templateName` 一定存在，
值是**名字或 `null`**，走不到 `undefined`。

**改写后**（`c290628`，改为在 fork 自己代码里推导、不再 patch Angular）：

```js
__templateName:
  (item._lView[LVIEW.CONTEXT] && item._lView[LVIEW.CONTEXT].__templateName) ||
  item._lView[1]?.declTNode?.localNames?.[0] ||
  undefined,              // ★ 兼底写成了 undefined
```

patch 删掉后，`*ngIf` 这种脱糖无 `#ref` 的模板一路 fall through 到
`undefined` —— **回归就是这么引入的**。

| 版本        | 无名模板的值 | 结果            |
| ----------- | ------------ | --------------- |
| 旧（patch） | `null`       | ✅              |
| `c290628`   | `undefined`  | ❌ 切换两次即坏 |
| `492876b`   | `null`       | ✅ 恢复旧语义   |

### 一个把判断带偏的细节

旧代码的类型声明是 `__templateName: string | undefined`，
但实际值一直是 `null` —— **类型与实际值本来就不一致**。
看类型会以为 `undefined` 是正常态，于是照着写了。

**教训：改「等价替代」时，兼底值也要逐一对齐，不能只验证主路径取值相同。
类型声明与实际值不一致时，以实际值（跑一遍看产物）为准。**

## 现在的两道防线

### ① 源头：兼底用 `null`

`src/library/platform/default/component-template-hook.factory.ts`

```js
__templateName:
  (item._lView[LVIEW.CONTEXT] && item._lView[LVIEW.CONTEXT].__templateName) ||
  item._lView[1]?.declTNode?.localNames?.[0] ||
  null,
```

类型同步改为 `MPView.__templateName: string | null`。

### ② 出口：diff 统一净化

`src/library/platform/default/diff-node-data.ts` 的 `sanitizeUndefined()`，
在 `diffNodeData` 出口把**任意深度**的 `undefined` 换成 `null`。

**两条返回路径都要处理** —— 只改逐字段那处不够：当所有 key 都变了会走
`allChange` 分支直接返回整个 `to`，那里同样带着 `undefined`
（第一次修的时候就漏在这）。

这层是防住**整类**问题：`value` / `class` / `property.*` 任何一个字段
变 `undefined`，都会引发同样的「整次 setData 被拒 → 冻结」。

## 写代码时的检查清单

往 `setData`（或任何会进 diff 的数据结构）里塞东西前：

1. **可能为空的字段，兼底写 `null`，不要写 `undefined`**
2. **不要靠「省掉字段」表达无值** —— 会让 diff 误判 key 数量变化，
   退化成全量 setData
3. **类型声明要和实际值一致** —— 别写 `string | undefined` 而实际给 `null`
4. **测试必须覆盖「第二次更新」** —— 只测首次渲染等于没测这个坑。
   至少断言 `diffNodeData(from, to)` 的产出里
   **不存在任何 `undefined` 值**
5. 新增 `MPView` / `MPElementData` / `MPTextData` 字段时，
   回头再看一遍这一节

## 相关测试

| 位置                                                | 覆盖                                                                                                                       |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `diff-node-data.spec.ts` →「绝不产出 undefined 值」 | 顶层/嵌套/数组变 `undefined` → 转 `null`；复现 `nodeList.N.0.__templateName` 有名→无名；**反向对照**（朴素实现确实会漏出） |
| `template-name-coverage.spec.ts`                    | 断言容器项 `__templateName` 是 `null` 或 `string`（**不是** `undefined`）                                                  |

> 注：`template-name-coverage.spec.ts` 原先的断言写的是
> 「值可为 `undefined`，但字段必须存在」—— **这个断言本身就是错的**，
> 正是它让这个 bug 过了测试。已修正。

---

# 库元数据 sidecar（`mp-library-meta.json`）

## 一句话

库编译期算出的「指令 host 事件 / host 属性 / 组件产物路径」，**不再拼进 `.d.ts`**，
改成写一个独立的 `<库根>/mp-library-meta.json`；应用构建读这个文件。
`.d.ts` 回归成纯类型契约，一个字都不改。

## 为什么原来那套要换掉

旧实现是「把元数据当文本塞进产物」，一共三条通道，其中 d.ts 那条为了对抗
ng-packagr 的扁平化，叠了三层补丁：

| 通道                                                                  | 载体        | 写入                                                          | 读取                                                     |
| --------------------------------------------------------------------- | ----------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| `<T>_Listeners` / `<T>_Properties`                                    | `.d.ts`     | `AddDeclarationMetaDataService` 拼接                          | `getLibraryDirectiveMeta()` 用 CSS-selector-over-TS 反解 |
| `<T>_OutputPath`                                                      | `.d.ts`     | 同上                                                          | `getLibraryComponentMeta()`                              |
| `<C>_ExtraData` / `$self_Global_Template` / `library_Global_Template` | **JS 产物** | `SetupComponentDataService` / `OutputTemplateMetadataService` | `library-template.plugin.ts`                             |

d.ts 那条的真实问题不是「不好看」，而是**它和打包器打架**：

```
ng-packagr 22 扁平化 → 不在导出引用图里的 declare const 被 tree-shake
  → 标记丢失
  → getLibraryDirectiveMeta() 返回 listeners: []
  → ComponentContext 用 [] **覆盖** host.listeners
  → wxml 一个事件绑定都没有
  → 表单输入 / 勾选 / picker 全部不响应，且**零报错**
```

于是有了 `library-meta-marker.ts`：进程内暂存 + 构建后补写 + 哨兵幂等 +
「把全部 entry 的标记写进每一个 entry 的 d.ts」（散弹枪）。
实测旧产物 `dist/types/angular-miniprogram.d.ts` 645 行里 **311 行是标记（48%）**。

## 现在的结构

```
库构建（compile-ngc.transform）
  ├─ registerLibraryMetaEntry(moduleId, declarationsBundled, distRoot)   ← 登记主键
  ├─ compileSourceFiles → AddDeclarationMetaDataService.run() 只登记，不改 d.ts
  └─ writeLibraryMetaFile(distRoot)                                      ← 每个 entry 落一次盘
                                    ↓
                    <库根>/mp-library-meta.json
                                    ↓
应用构建（getLibraryDirectiveMeta / getLibraryComponentMeta）
  └─ lookupLibraryMeta(sourceFile.fileName, className)
```

### 主键为什么是「扁平化 d.ts 相对库根的 posix 路径」

读取侧唯一的线索是 `classDeclaration.getSourceFile().fileName`。
ng-packagr 把一个 entry point 扁平化成**恰好一个** `.d.ts`，所以
「d.ts 相对路径 ↔ entry point」是 1:1。拿它当 key，读取侧只需
`path.relative(包根, d.ts)` + 查表，**不用解析 `exports` map**。

包根定位：从 d.ts 向上找**第一个带 `name` 的 `package.json`**，找到就停
（哪怕它没有 sidecar 也不往上走，否则会误吃上层无关包的元数据）。
这条链路对以下场景都不用适配：

- node_modules 正常安装
- pnpm 的 `.pnpm/<pkg>/node_modules/<pkg>`
- `npm link` / symlink（TS 默认 resolve 到 realpath，包根跟着走）
- tsconfig `paths` 把 `angular-miniprogram/forms` 指到 `../../dist/forms`
  （解析到的 d.ts 在 `dist/types/`，最近 package.json 就是 `dist/package.json`）

### 文件形状

```jsonc
{
  "schemaVersion": 1,
  "generator": "angular-miniprogram",
  "libVersion": "2.0.2",
  "entries": {
    "types/angular-miniprogram-forms.d.ts": {
      "moduleId": "angular-miniprogram/forms",
      "typings": "types/angular-miniprogram-forms.d.ts",
      "directives": {
        "DefaultValueAccessor": {
          "listeners": ["bindinput", "bindblur"],
          "properties": ["value", "disabled"],
        },
      },
      "components": {},
    },
  },
}
```

## 收益（实测）

| 指标                                  | 旧                                | 新                         |
| ------------------------------------- | --------------------------------- | -------------------------- |
| `dist/types/angular-miniprogram.d.ts` | 645 行（311 行是标记）            | 332 行（0 标记）           |
| 标记重复份数                          | 12 份（每个 entry d.ts 一份全量） | 1 份                       |
| 构建后补写 / 哨兵 / 幂等逻辑          | 需要                              | 不需要                     |
| 与 d.ts 扁平化的冲突                  | 有                                | 无（不在 d.ts 里，碰不到） |
| 同名冲突处理                          | 散弹枪蒙混                        | 写侧显式告警               |

## 顺带修掉的静默失败

旧 `getLibraryDirectiveMeta()` 查不到就返回 `{ listeners: [] }` 并覆盖
`host.listeners`，**零报错**。现在所有「没查到」都进
`library-meta-diagnostics.ts`，每轮构建结束由 `runViteBuilder` 打汇总日志，
分两类：

- `sidecar-missing-class` —— 库有元数据文件但没这个类，**多半是库改完没重新构建**
- `no-sidecar` —— 来源包根本没有 sidecar（第三方库 / 应用自己的源码）

后者是正常情况（`NgIf` 这类非本工具链指令本来就没有），但「它不会生成 host
绑定」这个事实应该被看见，所以也列出来。

## 不做版本兼容

**旧版 d.ts 内联标记的读取通道已删除，不做任何版本兼容。**

- `readLegacyDtsMarkers` / `readLegacyDtsOutputPath` 不存在
- `LIBRARY_DIRECTIVE_LISTENERS_SUFFIX` / `LIBRARY_DIRECTIVE_PROPERTIES_SUFFIX` /
  `LIBRARY_COMPONENT_OUTPUT_PATH_SUFFIX` 三个常量已从 `const.ts` 删除

含义：应用只能用**当前工具链构建出来的库**。绑一个旧版（d.ts 内联标记格式）
的库，它会被当成「没有元数据的包」归入 `no-sidecar`，不会生成 host 绑定。
这是有意为之 —— 宁可少一个没人用的兼容分支，也不要多一处会腐坏的代码。

## 还没做（明确记下来）

（无。JS 通道已于下一节全部搬进 sidecar。）

---

# 库构建只出元数据（schemaVersion 3）

## 一句话

库构建不再改写自己的任何产物。`amp.propertyChange` 注入、`<C>_ExtraData`、
`$self_Global_Template` / `library_Global_Template` 全部取消：前者移到
**主构建**，后三者搬进 `mp-library-meta.json`。

库的 fesm = **vanilla ng-packagr 输出**，`grep angular-miniprogram` 一个命中都没有。

## 为什么

上一节把 `.d.ts` 那条通道治了，但库 JS 产物里还埋着三条：

| 载荷                                                        | 旧载体  | 问题                                                    |
| ----------------------------------------------------------- | ------- | ------------------------------------------------------- |
| `import * as amp` + `amp.propertyChange(...)`               | 库 fesm | 运行时 hook 与库版本死锁；库产物不是 vanilla            |
| `let <C>_ExtraData = {...}`                                 | 库 fesm | 顶层变量本模块内无人引用，全靠 ng-packagr 不 DCE 才活着 |
| `let $self_Global_Template` / `let library_Global_Template` | 库 fesm | 同上，且主构建要用 CSS-selector 从 JS 文本里反捞        |

共同病根：**把 JS bundle 当 key-value 存储用**，和 `.d.ts` 那条一模一样。

## 什么必须留在库构建（但只产出 JSON）

| 项                                  | 为什么留                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| 中间模板文本 `content`              | 需要库自己的 `R3ComponentMetadata.template.nodes`；主构建只有 fesm，从 `ɵɵproperty` 反推不出模板 |
| scss → css                          | 需要库源文件 + ng-packagr 的 stylesheet processor                                                |
| listeners / properties / outputPath | 需要库的 directive meta                                                                          |

关键区别：这些是「**算完写 JSON**」，不是「改 JS 产物」。

## 为什么 `content` 能让一份库通吃所有平台

`content` 不是最终 wxml，是一段带 **`${}` 插值的模板串**（平台中立）。
渲染引擎是 `es-toolkit/compat` 的 `template`，只是把分隔符自定义成 `${x}`。

```html
<block ${directivePrefix}:if="{{hasLoad}}">
  <view class="{{nodeList[0].class}}" ${eventListConvert(["tap"])}>hi</view>
</block>
```

| 写法                             | 是什么                        | 渲染结果（wx）            |
| -------------------------------- | ----------------------------- | ------------------------- |
| `${directivePrefix}`             | 我们的**插槽**，主构建填值    | `wx`                      |
| `${eventListConvert(["tap"])}`   | 我们的**插槽**，函数调用      | `bind:tap`                |
| `${fileExtname.contentTemplate}` | context 取值                  | `.wxml`                   |
| `{{hasLoad}}`                    | wxml 自己的插值，**静态文本** | `{{hasLoad}}`（原样进出） |

定义在 `src/builder/library/mp-template.ts`，**两步**：

| 步   | 函数                                     | 发生在 | 做什么                       |
| ---- | ---------------------------------------- | ------ | ---------------------------- |
| 导出 | `LibraryTransform` 产出带 `${}` 的模板串 | 库构建 | 写进 sidecar，不烘平台信息   |
| 导入 | `renderLibraryTemplate(src, values)`     | 主构建 | `template(src, opts)` + 调用 |

所以库构建一次，wx / zfb / bd / qq 都能用 —— 平台相关的东西一个都不烘进库里。

### 为什么是 `${}` 而不是 `{{}}`

**wxml 自己就用 `{{ }}`。** 拿 `{{}}` 当我们的分隔符，库模板里那些
`{{hasLoad}}` / `{{nodeList[0].class}}` 会被当成待填变量吃掉，只能靠转义绕。

`${}` 和 wxml 井水不犯河水 —— **转义那一层整个消失了**，`LibraryTransform`
连 `templateInterpolation` 都不用覆盖。

### 分隔符配置里两个必须知道的坑（均实测）

**坑一：不能用 `/(?!)/g` 这类「永不匹配」正则去顶掉 `escape`。**

那样会让 capture group 角色错位，`interpolate` 的内容被 `_.escape` 做 HTML 转义：

```
template('${v}', { interpolate: R, escape: /(?!)/g })({ v: 'a<b>&"c' })
// → 'a&lt;b&gt;&amp;&quot;c'   ← wxml 属性被直接污染
```

必须给一个「语法合法但内容永不出现」的分隔符，这里用 **NUL**：

```ts
escape: new RegExp(`\u0000=([\\s\\S]+?)=\u0000`, 'g');
```

**坑二：必须显式关掉默认的 `evaluate`（`<% %>`）。**

只覆盖 `interpolate` 时，lodash 默认的 `<% ... %>` **仍然生效**，会在构建期
**执行任意 JS**。所以 `evaluate` 也配成 NUL 分隔符，让它永不触发。

### 白名单预检：杜绝静默求值

光靠「未定义变量会 `ReferenceError`」不够，因为：

| 写法               | 不预检的话                                             |
| ------------------ | ------------------------------------------------------ |
| `${Math.random()}` | 逃到全局，**静默**渲染出一个数                         |
| `${100}`           | 合法表达式，用户 wxml 里的字面 `${100}` 被**静默**求值 |

所以渲染前先把已知占位符摘掉，**残留的 `${` 一律抛错**：

```ts
const residue = source.replace(KNOWN_PLACEHOLDER, '');
if (residue.indexOf('${') !== -1) throw new Error('未登记的插值…');
```

已知集是封闭的，与 `LibraryTransform` / `LibraryBuildPlatform` 的产出严格一一对应。

### 为什么不用自研结构

之前试过三种做法，都不合适：

**`vm` eval。** `literalResolve(`\`${content}\``, opts)` 把 content 反引号一包，
当 JS 模板字面量丢进 `vm.runInNewContext` 求值 —— 绕一圈「文本 → 假代码 → eval
→ 文本」。代价四条（均实测）：

| 情形                    | 旧行为                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| content 含反引号        | 模板字面量提前终止 → `SyntaxError`                                                                                         |
| content 含非我方 `${x}` | `x is not defined`                                                                                                         |
| content 含反斜杠        | 被当转义序列吃掉，内容被改                                                                                                 |
| 上面任一失败            | `runScript` 吞异常返回 `undefined`，拼出 `"<import .../>undefined"` 这种**非空**的损坏 wxml，`emit.asset` 的空值守卫挡不住 |

**正则替换。** 避开了上面几条，但仍需「把数据塞进字符串再认出来」。

**自研 `{ strings, values }` 结构。** 语义最干净，但要自己维护一套编码/解码接缝
（NUL 哨兵）去过 transform 那道只认字符串的关卡，代码量和心智负担都不小。

**现在：`es-toolkit/compat` 的 `template` + `${}` 分隔符。**
插值、编译缓存都是现成的，且不跟 wxml 抢语法。静态段里的反引号 / 反斜杠 /
引号 / CRLF 全部安全（实测），因为它们是作为字符串常量写进生成码的，
不会被当代码解析。

## 现在的结构

```
库构建（compile-ngc.transform → compileSourceFiles）
  ├─ registerLibraryMetaEntry(moduleId, dtsBundled, distRoot, fesm2022)  ← 主键 + fesm 映射
  ├─ compilerHost.writeFile 钩子：只读采集，写出去的一律是原内容
  │    ├─ .d.ts        → AddDeclarationMetaDataService  listeners / properties / outputPath
  │    ├─ flat .js     → OutputTemplateMetadataService  selfTemplate / scopeTemplates
  │    └─ 其余 .js     → SetupComponentDataService      content / useComponents / style
  └─ writeLibraryMetaFile(distRoot)                                      ← 每个 entry 落一次盘
                                    ↓
                    <库根>/mp-library-meta.json  (schemaVersion 3)
                                    ↓
主构建（vite / karma）
  ├─ component-transform.plugin  给库 fesm 注 amp.propertyChange
  └─ library-template.plugin     读 sidecar → emit wxml / wxss / library entry chunk
```

### 为什么采集钩子还挂在 `compilerHost.writeFile` 上

它是唯一能「按正在写的这个源文件」天然圈定当前 entry point 的时机。
直接扫 `componentMap` / `directiveMap` 会把上游 entry point 的类一并摄进来
（那两个 map 是整个 program 的）。钩子现在**只读不改**，写出去的一律是
TS 传进来的原始 `data`。

### 主构建怎么判断「这个 node_modules 包该不该处理」

**用 sidecar 存在作为唯一标记**（`isMpLibraryFile` / `readLibraryMetaForModule`）。

这点很关键：`@angular/common` 的 fesm 里同样有 `ɵɵdefineComponent`（NgIf /
NgFor），用「所有 node_modules」这种粗筛会把注入打进第三方库，等于给每个
`*ngIf` 加一次 setData。

注入还带幂等保护（`/\.propertyChange\s*\(/`）：按 `.propertyChange(` 而不是
`amp.propertyChange(` 判，因为 bundlers 会给命名空间导入改名，前缀不可靠。

### library entry chunk 的 import 用 bare specifier

`import * as lib from 'test-library'` 而不是绝对路径 —— 交给 rollup 按
`package.json#exports` 解析，npm link / pnpm 的 realpath 布局不用适配。

## 不做版本兼容

schemaVersion 1 → 2 → 3，**不读旧格式**：

- 老主构建读新库：`readLibraryMetaFile` 现有版本不匹配告警会响，库组件模板缺失
- 新主构建读老库（v1，只有 listeners/properties）：`assertTemplatePayload()`
  **直接抛错**「该库必须用当前版本工具链重新构建」

这里故意抛而不降级：这个仓库已经栽过好几次「静默丢事件绑定 / 静默丢模板，
零报错，页面白屏」。

## 主构建的键：组件名，不是文件路径

这是第两轮修正。上一版把注入闸门做成「包根有没有 sidecar」（
`isMpLibraryFile`），把 emit 范围做成「`meta.entry ? [entry] : 整包」——
**两个键粒度不一样**，同一个文件上会打架：

| 文件                                 | 注入（包级）  | emit（文件级）   |
| ------------------------------------ | ------------- | ---------------- |
| `entry.fesm`                         | ✅            | ✅ 该 entry      |
| 包内非 fesm 文件（worker / 工具 JS） | ✅ **也注入** | ⚠️ **emit 整包** |

### 不变式

**任何库里的组件都必须有清单。** 不存在「库里的组件但不用进清单」这种东西
—— 它最终要在小程序里渲染，就得变成 wxml，就得在 `mp-library-meta.json` 里。

所以「文件里有组件、清单里没有」不是合法状态，是**库构建的 bug**。

### 推论：键只能是组件名

```
transform(file):
  if (!code.includes('ɵɵdefineComponent'))  skip     廉价前置
  if (!包根有 sidecar)                      skip     生态判定
  names = detectComponentNames(code)                 真检测
  if (names.length === 0)                   skip     worker / 工具 JS，零成本
  missing = names 里清单查不到的
  if (missing.length)                       ERROR    不变式：没清单就炸
  emit(names)                                        精确 emit，绝不整包
```

立住的等式：**本文件检出的组件集 == 清单覆盖集 == emit 出去的集**。

### 为什么不是「按 `entry.fesm` 做文件级匹配」

那也是一种文件路径键。一旦某个组件不在声明的 fesm 里，它会**静默跳过**
—— 少产 wxml、白屏、零报错。恰好是要干掉的那类失败。

所以 `fesm` 不再是 load-bearing 的匹配键，降级成诊断字段（「这个 entry 的
组件应该在哪个文件」），**也不需要改成必填**。

### `isMpLibraryFile` 退回它该干的事

只做生态判定：这个包归不归本工具链管（挡 `@angular/common` 那种也含
`ɵɵdefineComponent` 的）。它**不再决定 emit 范围** —— 以前就是在这里越界，
才导致碰一个无关文件就整包 emit。

## 改动清单

**库侧**

| 文件                                      | 改动                                                                                                                                                                                          |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `library-meta-schema.ts`                  | `schemaVersion` → 3；component record 加 `id`/`className`/`content`/`contentTemplate`/`useComponents`/`style`（模板字段为 `${}` 插值模板串）；entry 加 `fesm`/`selfTemplate`/`scopeTemplates` |
| `library-meta-store.ts`                   | 登记改成**合并语义**（host 绑定与模板载荷两路写入，谁都不能抹掉对方）；新增 `patchLibraryComponentMeta` / `setLibrarySelfTemplate` / `setLibraryScopeTemplate`                                |
| `setup-component-data.service.ts`         | 从「拼 JS 文本」改成登记进 store，`run()` 原样返回 `data`                                                                                                                                     |
| `output-template-metadata.service.ts`     | 同上                                                                                                                                                                                          |
| `compile-source-files.ts`                 | `augmentLibraryMetadata` 改成只读采集，写出去的一律是原内容                                                                                                                                   |
| `change-component.ts`                     | 新增 `detectComponentNames()`（只认组件不改码，给库侧用）                                                                                                                                     |
| `const.ts` / `type.ts` / `shared/type.ts` | 删掉 `_ExtraData` / `Global_Template` 常量与 `ExportLibraryComponentMeta` / `LibraryLoaderContext` 等死类型                                                                                   |

**主构建侧**

| 文件                                         | 改动                                                                                                                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vite/plugins/component-transform.plugin.ts` | 放开 node_modules：应用 `.ts` + mp 库 `.mjs`；sidecar 作生态标记；用 `changed.componentNames` 做组件闸门（不额外解析）。**没有「已注入则跳过」的幂等保护**，理由见下                        |
| `vite/plugins/library-template.plugin.ts`    | 删掉 CSS-selector 反解 `let X_ExtraData`，改成读 sidecar；**删掉 `meta.entry ? [entry] : 整包` 退化分支**，改成 `detectComponentNames` + 按组件名定位所属 entry + 清单未覆盖则 `this.error` |
| `library/library-meta-reader.ts`             | 新增 `isMpLibraryFile`（仅生态判定）/ `readLibraryMetaForModule`                                                                                                                            |

## 相关测试

| 位置                                                                     | 覆盖                                                                                                                                                                                                        |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `library/library.spec.ts`                                                | **反向断言**：库 fesm 里 `angular-miniprogram` / `propertyChange` / `_ExtraData` / `Global_Template` 一个都不能有；sidecar 带 `fesm` / `selfTemplate` / `content` / `useComponents` / `style`               |
| `library-meta-sidecar.spec.ts` →「库组件的 propertyChange 由主构建注入」 | 库 fesm 自身零 `propertyChange`；app chunk 里每个库组件恰好被注入 1 次；注入落在 `rf & 2` 块末尾、无游离调用                                                                                                |
| `library-multiplatform.spec.ts`                                          | **一份库产物跑非 wx 平台**（zfb）：模板出 `.axml` 不出 `.wxml`、`wx:if`→`a:if`、`bind:tap`→`onTap`、样式出 `.acss`；库**不重新构建**，只换主构建平台；注入与平台无关（仍恰好 1 次）                         |
| `library/library-meta-unit.spec.ts` →「注入与包边界加固」                | `assertLibraryTemplatePayload` 对 v1 形态抛错且点名库+版本、空组件表不误伤、空串不算载荷；`isMpLibraryFile` 包边界（无 sidecar / schema 不合法 / 找不到包根均 false）                                       |
| `library/library-meta-unit.spec.ts` →「键的选择：组件名，不是文件路径」  | 无组件文件 `detectComponentNames` 返回空→不处理（但包级闸门仍 true，两者是两件事）；检出组件能在清单里查到；清单未覆盖时 `missing` 非空（主构建报错的依据）                                                 |
| `library-meta-sidecar.spec.ts` →「二级出口在主构建下」                   | 二级出口组件产出自己的 wxml/wxss，内容只含它自己的模板（不串一级组件）；host 事件 `bind:tap` 从 sidecar listeners 过来；一级产物没被顶掉；`usingComponents` 同时指到一级与二级出口；二级组件被注入恰好 1 次 |

### 为什么没有「已注入则跳过」的幂等保护

曾经有过一个 `hasPropertyChangeInjection`，已删。两个理由：

**1. 结构上重复注入到不了。** 能走到注入那一行，`isMpLibraryFile` 必须为
true → 包根必须有 **v3** sidecar（旧版本在 `readLibraryMetaFile` 的版本检查里
就被判 undefined）→ 而 v3 sidecar 只有当前构建器会产，当前构建器**不
注入**。所以能到这里文件不可能已经带着注入调用。

**2. 它有害，不只是多余。** 它是整文件级的正则 `return null`，而正则匹配
整段文本 —— 注释和字符串字面量都算：

```
amp.propertyChange(view);                        → true   真注入
// 这里调用 amp.propertyChange(view) 触发 setData  → true   注释
const msg = "amp.propertyChange(x)";             → true   字符串
/** 见 amp.propertyChange() */                   → true   文档注释
```

一个库 fesm 里只要有一句注释提到 `.propertyChange(`，这个文件里**所有
组件**的注入全被静默跳过。它防的问题不存在，却能制造「整文件组件静默
少注入、零报错」这个真问题。

真出现重复注入，那是模块图 / 构建链路本身出了 bug，应该查源头，不是
在这里把它挡掉。

### 为什么 `assertLibraryTemplatePayload` 被提出来

它原来闭在插件函数内部，**不跑一次真实构建就测不到**。提到
`library-meta-schema.ts` 后，相关 describe 跑完只要 0.08 秒。「旧库必须
炸」这条恰好是最不能靠肉眼看的，必须便宜到愿意跑。

## 相关文件

| 文件                                                        | 职责                                                           |
| ----------------------------------------------------------- | -------------------------------------------------------------- |
| `src/builder/library/library-meta-schema.ts`                | 常量 + 类型 + 宽松校验                                         |
| `src/builder/library/library-meta-store.ts`                 | 写侧暂存区 + 落盘（全量重写，幂等）                            |
| `src/builder/library/library-meta-reader.ts`                | 读侧：包根定位 + sidecar 查找 + mtime 缓存 + `isMpLibraryFile` |
| `src/builder/library/library-meta-diagnostics.ts`           | 缺失 / 回退记录 + 汇总文案                                     |
| `src/builder/library/compile-ngc.transform.ts`              | 登记主键、编译完落盘                                           |
| `src/builder/library/compile-source-files.ts`               | 只读采集钩子（三个 service）                                   |
| `src/builder/component-template-inject/change-component.ts` | 注入器（主构建用）+ `detectComponentNames`（库侧用）           |
| `src/builder/vite/plugins/component-transform.plugin.ts`    | 主构建注入（app `.ts` + mp 库 `.mjs`）                         |
| `src/builder/vite/plugins/library-template.plugin.ts`       | 读 sidecar 产 wxml / wxss / entry chunk                        |

## 相关文件

| 文件                                                                 | 职责                                       |
| -------------------------------------------------------------------- | ------------------------------------------ |
| `src/builder/library/library-meta-schema.ts`                         | 常量 + 类型 + 宽松校验                     |
| `src/builder/library/library-meta-store.ts`                          | 写侧暂存区 + 落盘（全量重写，幂等）        |
| `src/builder/library/library-meta-reader.ts`                         | 读侧：包根定位 + sidecar 查找 + mtime 缓存 |
| `src/builder/library/library-meta-diagnostics.ts`                    | 缺失 / 回退记录 + 汇总文案                 |
| `src/builder/library/compile-ngc.transform.ts`                       | 登记主键、编译完落盘                       |
| `src/builder/library/add-declaration-metadata.service.ts`            | 只登记，**不改 d.ts**                      |
| `src/builder/mini-program-compiler/mini-program-compiler.service.ts` | 读侧接入（只读 sidecar，无回退通道）       |

## 相关测试

| 位置                                            | 覆盖                                                                                                                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/builder/library/library-meta-unit.spec.ts` | 写侧 key 形态 / 幂等 / 冲突告警；读侧包边界、schema 校验、大小写兜底、mtime 缓存失效                                                                                                  |
| `src/builder/library-meta-sidecar.spec.ts`      | 端到端：sidecar 内容正确 → wxml 生成 `bind:input` / `bind:change`；**反向对照**（wxml 事件全部可追溯到 sidecar）；**d.ts 里不再出现任何内联标记**                                     |
| 同上 →「库元数据 demo 页」                      | 专用 demo 页 `pages/library-meta-demo`，逐字段钉住 **test-library（第二个库）** 的调用：指令 listeners/properties、组件 properties、组件+指令叠加合并、`outputPath → usingComponents` |

## demo 库 fixture 的三个坑

这两个都是写 demo 时踩到、已修的问题，记下来避免再犯。

### 1. fixture 组件的模板不能是空的

`TestLibraryComponent` 原来是 `template: \`\``，导出的
`library/test-library/test-library-component/test-library-component.wxml` 就只剩：

```html
<import src="/library-template/TestLibrary.wxml" /><import
  src="/library/test-library/self.wxml"
/><block wx:if="{{hasLoad}}"></block>
```

**空 block —— 根本看不出“渲染了还是没渲染”**，拿它做验收没意义。
现在给了带标记的真实模板：

```html
<p class="lib-test-library__body">
  [LIB_TEST_LIBRARY_RENDERED] input1={{ input1() }}
</p>
```

产物变成（有子节点，可断言）：

```html
<block wx:if="{{hasLoad}}"
  ><view class="{{nodeList[0].class}}" ...>{{nodeList[1].value}}</view></block
>
```

注意两点：

- 库里的组件模板用**标准 HTML 元素**（`<p>`），用 `<view>` 会 `NG8001: 'view' is not a known element`。
- **文本不会以字面量形式进 wxml**，而是存进 vnode、运行时由 `{{nodeList[N].value}}` 填。
  所以“渲染标记在不在”不能靠 wxml 字面量查；可字面量验收的是 **wxss 类名**
  （`.lib-test-library__body{color:#06c}`）和 **JS 产物里的模板文本**。

### 2. input / output **不在 wxml 里**，也不在 sidecar 里

实测：`<lib-test-library [input1]="x">` 生成的 wxml 与不传时**一模一样**：

```html
<lib-test-library
  nodePath="{{nodePath}}"
  nodeIndex="6"
  class="..."
  style="..."
  property1="{{nodeList[6].property.property1}}"
></lib-test-library>
```

没有 `input1="..."`。原因：

- **wxml 只需要两类东西**：host 事件（`bind:*`）和 host 属性（`{{...property.X}}`）。
- **input 走 vnode**：运行时由组件自己从 `nodeList[N].property.input1` 读，
  不需要 wxml 属性。
- **output 也走运行时**：组件 `output1.emit(v)` → 父组件回调，同样不落 wxml。
- 而且 input/output 名**也不在 sidecar 里**（sidecar 只有 `listeners` /
  `properties` / `outputPath`），它们仍走未迁移的 JS 通道 `_ExtraData`。

所以“input 到底传没传”只能在**编译后的 JS** 里看，Angular 会把绑定名保留成
字符串字面量：

```js
consts: [
  [`libTestLibrary`, ``],
  [3, `input1`],                                              // <lib-test-library [input1]>
  [`libTestLibrary`, ``, 3, `input1`],                        // 叠加指令那个
  [`libInputOutput`, ``, 3, `output1`, `output2`, `input1`, `input2`],
],
template: (t, n) => {
  t & 2 && (
    e.I(6), e.ht(`input1`, n.libInputValue),                  // ɵɵproperty：input 绑定
    e.I(6), e.ht(`input1`, n.libInputValue)(`input2`, n.libInputCount),
    ...
  );
}
```

spec 里对应两条断言（查 JS，不查 wxml）：值进了产物 + `input1`/`input2`/`output1`/`output2`
绑定名作为字面量保留。

> 教训：**别拿 wxml 字面量去验 input**。之前模板里写了 `input1={{ input1() }}`
> 却没在调用侧传值，页面渲染出来就是 `input1=`，看着像坏了——其实是 demo 本身缺接线。

### 3. `node_modules/test-library` 副本会过期

app 侧 spec 读的是 `node_modules/test-library`，而它由
`src/builder/library/library.spec.ts` 构建后拷入。但按文件名排序，
`builder/library-meta-sidecar.spec.ts` 在 `builder/library/library.spec.ts`
**之前**（`library-` < `library/`），所以单跑 `npm test` 时可能读到**上一次残留的旧副本**。

本 harness 的 builder 是 app builder，跑不了 library target，无法自己重建，
所以 `load()` 里加了**新鲜度守卫**：读不到、或 JS 里没有当前模板标记，就直接报错

> `node_modules/test-library 副本已过期，请先跑 npm run test:jasmine library（或直接 npm run test:ci）`

宁可大声失败，也不要测着旧副本给假绿灯。正规入口是 **`npm run test:ci`**，
它开头就是 `build:library && test:jasmine library`，顺序天然是对的。

（读副本要用 devkit host + `Buffer.from(...)`：`host.root()` 是虚拟路径
`/C/code/...`，Windows 下 Node 的 `fs` 解不了；`host.read()` 发的是 `ArrayBuffer`，
`fileBufferToString` 对它返回的是 `"[object ArrayBuffer]"`。）

## 库成员可以完全脱离 NgModule（已验证）

`test-library` 里的指令和组件**全部改成 standalone**，`DirectiveModule` 已删除，
工具链全链路正常。

### `standalone` 可以不写（Angular 19+ 默认就是 `true`）

本库所有成员都已**不写** `standalone`，编译产物依旧全部是 `standalone: true`：

```
TestLibraryComponent         cmp -> standalone = true     // 源码里没写
TestLibraryDirective         dir -> standalone = true     // 源码里没写
OtherComponent               cmp -> standalone = true
LibComp1Component            cmp -> standalone = true
LibDir1Directive             dir -> standalone = true
InputOutputDirective         dir -> standalone = true
OutsideTemplateComponent     cmp -> standalone = true
GlobalSelfTemplateComponent  cmp -> standalone = true
```

sidecar 登记走的是 `ɵdir` / `ɵcmp` 静态成员，**不关心 `standalone` 是写的还是
默认的**，所以两种写法对工具链等价。

> 反过来说：只有 **`standalone: false`** 才会挡住直接 import（进不了 standalone
> 组件的 `imports`，并且被模块 `declarations` 时才会报错）。想被直接引用，
> 要么不写，要么写 `true`；写 `false` 就必须走模块。

### 为什么可以

sidecar 的登记逻辑是 **扫 d.ts 里的 `ɵdir` / `ɵcmp` 静态成员**
（`add-declaration-metadata.service.ts` 里
`createCssSelectorForTs(data).queryAll('ClassDeclaration')`），
**不是**沿 NgModule 的 `exports` 走的。所以只要类出现在扁平化 d.ts 里
（= 被 entry point 导出），它就会被记录，跟有没有模块包着它无关。

删除 `DirectiveModule` 后，sidecar 记录**一条没少**：

```
指令: TestLibraryDirective{L:[tap,touchstart] P:[value]} | LibDir1Directive{L:[tap,bindtap] P:[]} | InputOutputDirective{L:[] P:[]}
组件: TestLibraryComponent{L:[] P:[property1]} | OtherComponent{L:[] P:[]} | LibComp1Component{L:[tap,bindtap] P:[]} | ...
```

### 推荐写法

```ts
// 直接 import standalone 成员，不经过任何 NgModule
import {
  InputOutputDirective,
  LibComp1Component,
  TestLibraryComponent,
  TestLibraryDirective,
} from 'test-library';

@Component({
  standalone: true,
  imports: [CommonModule, TestLibraryDirective, TestLibraryComponent, LibComp1Component],
  // ...
})
```

### 两个约定

1. **standalone 成员不能进 `declarations`**（NG6008），也不能没 import 就
   `exports`（NG6004）。若要保留模块做兼容，只能 `imports` + `exports` 转发：

   ```ts
   @NgModule({
     imports: [TestLibraryComponent, TestLibraryDirective],
     exports: [TestLibraryComponent, TestLibraryDirective],
   })
   export class TestLibraryModule {}
   ```

2. **standalone 组件不从模块继承作用域**，模板里用到的东西必须自己 `imports`。
   例如 `GlobalSelfTemplateComponent` 的模板用了 `app-outside-template` / `app-other`，
   就得在组件上写 `imports: [OutsideTemplateComponent, OtherComponent]`，
   写在模块里没用。
