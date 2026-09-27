/**
 * 全局 polyfill 入口。
 *
 * ## 为什么需要单独一个入口
 *
 * `app-template.js` 是被 `fs.readFileSync` 当**纯文本**内联进 app.js 的，
 * 完全不经过 Vite/Rollup。所以在模板里写 `import` 是不会被解析的——
 * 想把 npm 包打进产物，必须让它成为 Vite 的入口模块，由 bundler
 * 负责解析、打包、落盘。这就是「改构建入口而不是改模板」的原因。
 *
 * ## 为什么不能直接用 polyfill 的默认入口
 *
 * `abortcontroller-polyfill` 的默认入口（`umd-polyfill.js` /
 * `polyfill-patch-fetch.js`）靠给 `self` / `global` 赋值来挂载，
 * 而这两个标识符在微信小程序里都不存在，装了也不生效。
 *
 * 这里改用纯 ponyfill `dist/abortcontroller`——它只 `exports`，
 * 不碰任何全局——由我们**手动**塞进全局能力表 `obj`，再配合
 * `buildPlatformDefine` 把源码里的裸 `AbortController` / `AbortSignal`
 * 重定向到 `wx.__window.AbortController`。
 *
 * 两步缺一不可：
 *   - 只 define 不导出 → `wx.__window.AbortController` 是 undefined
 *   - 只导出不 define → 源码里的裸 `AbortController` 仍指向不存在的全局
 */
import {
  AbortController,
  AbortSignal,
} from 'abortcontroller-polyfill/dist/abortcontroller';

/**
 * `globalThis` 会被 `buildPlatformDefine` 替换成 `<平台>.__window`。
 *
 * app.js 的拼接顺序是 `importTemplate` 在前、require 列表在后，
 * 而 `importTemplate` 已经执行过
 * `wx.__global = wx.__window = obj`，所以这里赋值的目标就是那个 `obj`。
 *
 * 注意右侧的 `AbortController` / `AbortSignal` 是 import 绑定，
 * 属于局部作用域，不会被 define 改写掉。
 */
const globalTable = globalThis as Record<string, unknown>;

globalTable.AbortController = AbortController;
globalTable.AbortSignal = AbortSignal;
