/**
 * 小程序里缺的那几个全局能力，测试链路自己补上。
 *
 * ## 为什么必须补
 *
 * 小程序 appservice 没有 `Event` / `EventTarget`，而 vitest 侧两处要用：
 *
 *   - `globals: true` 时动态 import 的 globals chunk 会拖进 tinybench，
 *     它顶层就是 `class extends EventTarget`，**加载即求值**；
 *   - vite 的 preload helper 在动态 import 失败时走
 *     `new Event('vite:preloadError')` + `globalThis.dispatchEvent`。
 *
 * 缺了它们最阴的地方是「报错盖报错」：真错误（某个 chunk require 失败）
 * 被 `Event is not defined` 顶掉，宿主端只看到一句没头没尾的
 * `处理 worker 请求失败：Event is not defined`。
 *
 * ## 为什么挂全局表而不是真 global
 *
 * 打包时 `buildPlatformDefine` 把裸 `Event` / `EventTarget` 重定向到
 * `wx.__window.*`（和 AbortController 一个套路），所以往全局能力表里塞
 * 就是源码里裸标识符看到的值。类名故意不叫 Event / EventTarget：本文件
 * 也在这份 define 的作用域里，同名声明容易被替换搞混。
 *
 * 只做到「够用」：没有 composed / capture / once / AbortSignal 那套。
 */

interface MpEventListenerLike {
  (event: MpEvent): void;
  handleEvent?(event: MpEvent): void;
}

class MpEvent {
  readonly type: string;
  readonly cancelable: boolean;
  defaultPrevented = false;
  target: unknown = null;
  currentTarget: unknown = null;
  /** vite preload helper 会往上挂 payload */
  payload?: unknown;

  constructor(type: string, init: { cancelable?: boolean } = {}) {
    this.type = type;
    this.cancelable = !!init.cancelable;
  }

  preventDefault(): void {
    if (this.cancelable) {
      this.defaultPrevented = true;
    }
  }

  stopPropagation(): void {
    // 没有传播链，单点即可
  }

  stopImmediatePropagation(): void {
    // 同上
  }
}

class MpEventTarget {
  private readonly listeners = new Map<string, MpEventListenerLike[]>();

  addEventListener(type: string, handler?: MpEventListenerLike | null): void {
    if (!handler) {
      return;
    }
    const list = this.listeners.get(type) ?? [];
    if (!list.includes(handler)) {
      list.push(handler);
    }
    this.listeners.set(type, list);
  }

  removeEventListener(
    type: string,
    handler?: MpEventListenerLike | null,
  ): void {
    if (!handler) {
      return;
    }
    const list = this.listeners.get(type);
    if (!list) {
      return;
    }
    const at = list.indexOf(handler);
    if (at >= 0) {
      list.splice(at, 1);
    }
  }

  dispatchEvent(event: MpEvent): boolean {
    event.target = event.target ?? this;
    event.currentTarget = this;
    for (const handler of [...(this.listeners.get(event.type) ?? [])]) {
      // this 必须是 target 本身，原生实现不认别的 this
      if (handler.handleEvent) {
        handler.handleEvent(event);
      } else {
        handler.call(this, event);
      }
    }
    return !event.defaultPrevented;
  }
}

/**
 * `AggregateError` 在开发者工具的 appservice 里没有（小程序 JS 引擎偏旧），
 * 而 `@vitest/runner` 的 `failTask` 拿它做 `instanceof` 且没做保护。
 * define 把裸名指到全局表，这里就是表里的那个值。
 */
class MpAggregateError extends Error {
  readonly errors: unknown[];

  constructor(errors?: Iterable<unknown>, message?: string) {
    super(message ?? 'AggregateError');
    this.name = 'AggregateError';
    this.errors = errors ? [...errors] : [];
  }
}

let installed = false;

/**
 * 把小程序真 global 上的能力抄到全局能力表上。
 *
 * 为什么业务里 `new Date()` 一直好好的，这里还得特意抄一份：第三方库不写
 * 裸 `Date`，它们写 `globalThis.Date`（跳平台库的标准写法，fake-timers 还要
 * 拿它做替换目标），而 `globalThis` 被 define 换成了这张表 —— 表上没有，
 * 它们就报「global scope doesn't have a `Date`」。
 *
 * 所以一律用**裸标识符**取：`globalThis` 在本文件里已经是那张表本身，
 * `globalThis.Date` 永远拿不到东西。（`performance` 更坑：它就在
 * `buildPlatformDefine` 里，写 `typeof performance` 编完就是
 * `typeof wx.__window.performance`，读的是自己写的这张表。）
 *
 * 定时器要包一层再挂：直接赋引用的话调用时 `this` 就是全局表，
 * 小程序原生定时器不认这个 `this`（karma 时代踩过）。
 */
function copyRealmGlobals(table: Record<string, unknown>): void {
  // 语言内建，任何 JS 引擎都有，直接抄，不用 typeof 探。
  // 必须用裸标识符取：`globalThis` 在本文件里已经是那张表本身。
  table['Date'] ??= Date;
  table['JSON'] ??= JSON;
  table['Math'] ??= Math;
  table['Promise'] ??= Promise;
  // console 是宿主提供的，不是语言保证的，这个 typeof 得留着。
  if (typeof console !== 'undefined') {
    table['console'] ??= console;
  }

  // 定时器一律包一层再挂：直接赋引用的话调用时 `this` 是那张表，
  // 原生实现不认。
  for (const [name, impl] of TIMER_GLOBALS) {
    if (typeof table[name] === 'function') {
      continue; // app.js 或别人已经放过了，不抢
    }
    if (typeof impl !== 'function') {
      continue; // 这个平台没有
    }
    const fn = impl as (...a: unknown[]) => unknown;
    table[name] = (...args: unknown[]) => fn(...args);
  }
}

/**
 * 要抄到全局表上的定时器。取的时候不能用 `globalThis[name]`：
 * 那个 globalThis 已经是这张表了，只能拿裸标识符。
 *
 * 前四个小程序一定有，直接引用。后两个是 Node 独有的，小程序没有，
 * 裸引用会 `ReferenceError`（跟 `Event` 一个下场），只能 `typeof` 探，
 * 探不到就跳过 —— 这里的 typeof 不是保险丝，是「这个平台就是没有」。
 */
const TIMER_GLOBALS: ReadonlyArray<readonly [string, unknown]> = [
  ['setTimeout', setTimeout],
  ['clearTimeout', clearTimeout],
  ['setInterval', setInterval],
  ['clearInterval', clearInterval],
  [
    'setImmediate',
    typeof setImmediate === 'function' ? setImmediate : undefined,
  ],
  [
    'clearImmediate',
    typeof clearImmediate === 'function' ? clearImmediate : undefined,
  ],
];

/**
 * 把 Event / EventTarget 和一套全局事件口塞进平台全局能力表。
 *
 * 幂等，重复调用只补还没有的那几样。
 */
export function installMiniProgramGlobals(): void {
  if (installed) {
    return;
  }
  installed = true;

  const table = globalThis as unknown as Record<string, unknown>;
  if (!table['Event']) {
    table['Event'] = MpEvent;
  }
  if (!table['EventTarget']) {
    table['EventTarget'] = MpEventTarget;
  }
  if (!table['AggregateError']) {
    table['AggregateError'] = MpAggregateError;
  }
  copyRealmGlobals(table);

  // `globalThis.addEventListener(...)`：globals chunk 里的错误上报、
  // vite preload helper 都要它存在。
  if (typeof table['dispatchEvent'] !== 'function') {
    const root = new MpEventTarget();
    table['addEventListener'] = root.addEventListener.bind(root);
    table['removeEventListener'] = root.removeEventListener.bind(root);
    table['dispatchEvent'] = root.dispatchEvent.bind(root);
  }
}

/**
 * 模块加载时就装，不能等 `startupMiniProgramTest()`。
 *
 * `@vitest/runner` 的 chunk 在 `import` 阶段就求值，它一进来就
 * `({ clearTimeout, setTimeout } = getSafeTimers())` 把定时器**抄成常量**；
 * 等 app.onLaunch 再补就晚了，后面每次超时都报
 * `clearTimeout$1 is not a function`。本模块在 runtime 的 import 图里排
 * 在 vitest 前面，所以模块级执行刚好赶得上。
 */
installMiniProgramGlobals();
