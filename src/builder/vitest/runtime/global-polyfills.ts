/**
 * 小程序里缺的那几个全局能力，测试链路自己补上。
 *
 * 小程序 appservice 没有 `Event` / `EventTarget`，而 vitest 侧两处要用：
 * tinybench 顶层 `class extends EventTarget` 加载即求值；vite 的 preload helper
 * 在动态 import 失败时会 `new Event('vite:preloadError')`。
 *
 * 打包时 `buildPlatformDefine` 把裸 `Event` / `EventTarget` 重定向到全局能力表，
 * 所以往表里塞就是源码里裸标识符看到的值。类名故意不叫 Event / EventTarget，
 * 避免被同一份 define 替换搞混。只做到够用，没有 composed / capture / once。
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
 * `AggregateError` 在开发者工具的 appservice 里没有，而 `@vitest/runner` 拿它做
 * `instanceof` 且没做保护。define 把裸名指到全局表，这里就是表里的那个值。
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
 * 把小程序真 global 上的能力抄到全局能力表上。第三方库写的是 `globalThis.Date`，
 * 而 `globalThis` 被 define 换成了这张表，表上没有它们就报错。
 * 所以一律用裸标识符取值。定时器要包一层再挂：直接赋引用会让调用时的 `this` 变成全局表，
 * 原生实现不认。
 */
function copyRealmGlobals(table: Record<string, unknown>): void {
  // 语言内建，直接抄；必须用裸标识符取
  table['Date'] ??= Date;
  table['JSON'] ??= JSON;
  table['Math'] ??= Math;
  table['Promise'] ??= Promise;
  // console 是宿主提供的，不是语言保证的，这个 typeof 得留着
  if (typeof console !== 'undefined') {
    table['console'] ??= console;
  }

  // 定时器一律包一层再挂，原生实现不认全局表当 this
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
 * 要抄到全局表上的定时器。取的时候不能用 `globalThis[name]`，那个 globalThis 已经是这张表。
 * 前四个小程序一定有；后两个是 Node 独有的，只能 `typeof` 探，探不到就跳过。
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
 * 把 Event / EventTarget 和一套全局事件口塞进平台全局能力表。幂等，只补还没有的那几样。
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

  // `globalThis.addEventListener(...)`：globals chunk 的错误上报、vite preload helper 都要它
  if (typeof table['dispatchEvent'] !== 'function') {
    const root = new MpEventTarget();
    table['addEventListener'] = root.addEventListener.bind(root);
    table['removeEventListener'] = root.removeEventListener.bind(root);
    table['dispatchEvent'] = root.dispatchEvent.bind(root);
  }
}

/**
 * 模块加载时就装，不能等 `startupMiniProgramTest()`。`@vitest/runner` 的 chunk 在 import
 * 阶段就把定时器抄成常量，等 app.onLaunch 再补就晚了。本模块在 runtime 的 import 图里
 * 排在 vitest 前面。
 */
installMiniProgramGlobals();
