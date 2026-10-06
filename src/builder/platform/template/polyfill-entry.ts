/**
 * 全局 polyfill 入口。
 *
 * `app-template.js` 是被 `fs.readFileSync` 当纯文本内联进 app.js 的，完全不经过 Vite/Rollup，
 * 所以在模板里写 `import` 不会被解析。想把 npm 包打进产物，必须让它成为 Vite 的入口模块。
 *
 * `abortcontroller-polyfill` 的默认入口靠给 `self` / `global` 赋值来挂载，而这两个标识符在
 * 微信小程序里都不存在。这里改用纯 ponyfill `dist/abortcontroller`——它只 exports，不碰全局——
 * 由我们手动塞进全局能力表 `obj`，再配合 `buildPlatformDefine` 把源码里的裸 `AbortController` /
 * `AbortSignal` 重定向到 `wx.__window.AbortController`。两步缺一不可。
 */
import {
  AbortController,
  AbortSignal,
} from 'abortcontroller-polyfill/dist/abortcontroller';

/**
 * `globalThis` 会被 `buildPlatformDefine` 替换成 `<平台>.__window`。
 * app.js 的拼接顺序保证 `wx.__global = wx.__window = obj` 已经执行过，所以这里赋值的目标就是那个 `obj`。
 * 右侧的 `AbortController` / `AbortSignal` 是 import 绑定，属于局部作用域，不会被 define 改写掉。
 */
const globalTable = globalThis as Record<string, unknown>;

globalTable.AbortController = AbortController;
globalTable.AbortSignal = AbortSignal;
