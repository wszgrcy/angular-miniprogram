import { createStartFn } from './adapter';
import { KarmaClient } from './karma';
import { IO } from './platform';
import { StatusUpdater } from './updater';

declare const KARMA_CLIENT_CONFIG: any;

/**
 * 给 jasmine 当作 global 的那个对象补齐它要读的宿主能力。
 *
 * jasmine 5 的 Env 在**构造时**就抓走一批宿主方法：
 *   const realSetTimeout = global.setTimeout;
 *   const realClearTimeout = global.clearTimeout;
 *   new j$.MockDate(global)        // 要 global.Date
 *   installGlobalErrors()         // 要 global.addEventListener
 * 而它拿到的 global 是小程序运行时自建的 `wx.__global`——一个普通 Object，
 * 上面只有 Angular 要的那几样，没有 setTimeout / Date / addEventListener。
 *
 * 两个坑叠在一起，现象完全看不出关联：
 *   1. 缺 addEventListener → execute() 直接 reject
 *      TypeError: global.addEventListener is not a function
 *   2. 缺 setTimeout → runner 起来、total 也报了，但第一个 spec 都跑不动，
 *      Function.prototype.apply was called on undefined，
 *      karma 那边就是 Executed 0 of N + no message in 30000 ms
 *
 * 所以这里把 jasmine 依赖的那几样从真 global（小程序的 Window）搬到
 * wx.__global 上。定时器一律包一层再挂，不直接赋引用：直接挂的话
 * 调用时 this 会变成 wx.__global，小程序原生定时器不认这个 this。
 */
function ensureJasmineGlobals(target: any): void {
  if (!target) {
    return;
  }

  /**
   * 一律用**裸标识符**拿宿主能力，不能用 globalThis。
   *
   * 打包器会把 globalThis / window / self 改写成 wx.__window，而
   * wx.__window 就是 wx.__global 本身（app.js 里 `wx.__global =
   * wx.__window = obj`）。于是 real === target，real.setTimeout 永远是
   * undefined，补丁看起来跑了、实际一个都没打上。
   * 裸 setTimeout / Date / console 不会被改写，运行时由小程序提供。
   */
  // 定时器：包一层，不把 this 泄给原生实现
  if (
    typeof target.setTimeout !== 'function' &&
    typeof setTimeout === 'function'
  ) {
    const impl = setTimeout as unknown as (...a: unknown[]) => number;
    target.setTimeout = function (
      fn: (...a: never[]) => void,
      ms?: number,
      ...rest: unknown[]
    ) {
      return impl(fn, ms, ...rest);
    };
  }
  if (
    typeof target.clearTimeout !== 'function' &&
    typeof clearTimeout === 'function'
  ) {
    const impl = clearTimeout as unknown as (...a: unknown[]) => void;
    target.clearTimeout = function (handle?: number) {
      return impl(handle);
    };
  }
  if (
    typeof target.setInterval !== 'function' &&
    typeof setInterval === 'function'
  ) {
    const impl = setInterval as unknown as (...a: unknown[]) => number;
    target.setInterval = function (
      fn: (...a: never[]) => void,
      ms?: number,
      ...rest: unknown[]
    ) {
      return impl(fn, ms, ...rest);
    };
  }
  if (
    typeof target.clearInterval !== 'function' &&
    typeof clearInterval === 'function'
  ) {
    const impl = clearInterval as unknown as (...a: unknown[]) => void;
    target.clearInterval = function (handle?: number) {
      return impl(handle);
    };
  }

  if (typeof target.Date === 'undefined' && typeof Date !== 'undefined') {
    target.Date = Date;
  }
  if (typeof target.console === 'undefined' && typeof console !== 'undefined') {
    target.console = console;
  }

  // 小程序没有 rAF，jasmine 某些分支会要，退化成 setTimeout
  if (typeof target.requestAnimationFrame !== 'function') {
    target.requestAnimationFrame = function (cb: (t: number) => void) {
      return target.setTimeout(() => cb(Date.now()), 0);
    };
  }
  if (typeof target.cancelAnimationFrame !== 'function') {
    target.cancelAnimationFrame = function (handle: unknown) {
      return target.clearTimeout(handle);
    };
  }

  // DOM 事件 API：只存不播——小程序没有真实 DOM 事件流，
  // 同步异常 jasmine 自己 try/catch 得下来，不依赖这个。
  const listeners = new Map<string, Set<unknown>>();

  target.addEventListener = function (type: string, handler: unknown) {
    if (!type || !handler) {
      return;
    }
    if (!listeners.has(type)) {
      listeners.set(type, new Set());
    }
    (listeners.get(type) as Set<unknown>).add(handler);
  };

  target.removeEventListener = function (type: string, handler: unknown) {
    const set = listeners.get(type);
    if (set && handler) {
      set.delete(handler);
    }
  };

  target.dispatchEvent = function (event: any): boolean {
    const set = event ? listeners.get(event.type) : undefined;
    if (!set) {
      return true;
    }
    for (const handler of Array.from(set)) {
      try {
        if (typeof handler === 'function') {
          (handler as (e: unknown) => void).call(target, event);
        } else if (typeof (handler as any)?.handleEvent === 'function') {
          (handler as any).handleEvent(event);
        }
      } catch {
        /* 单个 listener 挂掉不影响其他，也不要把异常冒到调用方 */
      }
    }
    return true;
  };
}

declare const wx: any;

/**
 * 模块加载即打补丁，不能等 startupTest() 再补。
 *
 * jasmine 的 Env 在**构造时**就把 `global.setTimeout` 抓进闭包了
 * （`const realSetTimeout = global.setTimeout`），而模板里
 * `bootWithoutGlobals()` / `jasmine.getEnv()` 跑在 test.ts 顶层，
 * 比 setTimeout(…, 1000) 里的 startupTest() 早得多。
 * 在 startupTest 里补，Env 已经拿着 undefined 在用了，
 * 表现就是 runner 起来、total 也报了，但第一个 spec 都跑不动。
 *
 * app.js 是先 `wx.__global = wx.__window = obj` 再 require 各 chunk，
 * 所以这里模块一求值就能拿到 obj，赶在 Env 构造之前把能力补上。
 * 这里不走 jasmine.getGlobal()，因为此时 jasmine 还不存在。
 */
try {
  ensureJasmineGlobals(typeof wx !== 'undefined' ? wx.__global : undefined);
} catch {
  /* 补不上不阻断模块加载，后面 execute 会报出真实原因 */
}

export function startupTest() {
  // 必须在 execute 之前补，否则 jasmine 抓宿主方法时就扑空了
  try {
    ensureJasmineGlobals((jasmine as any)?.getGlobal?.());
  } catch {
    /* getGlobal 拿不到就算了，下面 execute 会给出真实错误 */
  }
  const socket = new IO();
  const updater = new StatusUpdater(socket);
  const karmaClient = new KarmaClient(updater, socket);
  if (KARMA_CLIENT_CONFIG.captureConsole) {
    // patch the console
    const localConsole = console || {
      log: function () {},
      info: function () {},
      warn: function () {},
      error: function () {},
      debug: function () {},
    };
    const logMethods: (keyof Console)[] = [
      'log',
      'info',
      'warn',
      'error',
      'debug',
    ];
    const patchConsoleMethod = function (method: keyof Console) {
      const orig = localConsole[method];
      if (!orig) {
        return;
      }
      localConsole[method] = function () {
        try {
          return Function.prototype.apply.call(orig, localConsole, arguments);
        } catch (error) {
          karmaClient.log('warn', [
            'Console method ' + method + ' threw: ' + error,
          ]);
        }
        karmaClient.log(method, Array.from(arguments));
      } as any;
    };
    for (let i = 0; i < logMethods.length; i++) {
      patchConsoleMethod(logMethods[i]);
    }
  }
  createStartFn(karmaClient, jasmine.getEnv())();
}
