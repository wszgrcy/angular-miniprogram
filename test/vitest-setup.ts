/**
 * vitest 版的全局环境准备，对标 `script/startup-jasmine.ts` 里那套。
 *
 * 分两件事：
 *  1. 装小程序全局（`wx` / `App` / `Page` / `Component` / `getApp` / `getCurrentPages`）。
 *     `platform-core.ts` 里 `MINIPROGRAM_GLOBAL = wx` 是**模块求值时**就读全局，
 *     所以必须早于任何 spec 的 import，只能放 setupFiles。
 *  2. 补 jasmine 遗留 API。75 个 spec 文件、800+ 断言全是 jasmine 写法，
 *     逐个改写成 vitest 不现实也没必要，这里做一层薄兼容。
 */
import { expect, vi } from 'vitest';
import { createRequire } from 'node:module';

/* -------------------------------------------------------------------------- */
/* 小程序全局                                                                  */
/* -------------------------------------------------------------------------- */

const wxOverrides: Record<string, unknown> = {};

function makeStub(name: string): any {
  const fn = function (...args: unknown[]) {
    void args;
    return undefined;
  };
  return new Proxy(fn, {
    get(_t, prop) {
      if (prop === 'then') {
        // 别让它被误当成 thenable
        return undefined;
      }
      if (prop in wxOverrides) {
        return wxOverrides[prop as string];
      }
      return makeStub(`${name}.${String(prop)}`);
    },
    has() {
      return true;
    },
    apply() {
      return undefined;
    },
  });
}

(globalThis as any).wx = new Proxy({} as any, {
  get(_t, prop) {
    if (prop in wxOverrides) {
      return wxOverrides[prop as string];
    }
    return makeStub(`wx.${String(prop)}`);
  },
  has() {
    return true;
  },
});

const g = globalThis as Record<string, unknown>;
g.App = g.App || ((...a: unknown[]) => void a);
g.Page = g.Page || ((...a: unknown[]) => void a);
g.Component = g.Component || ((...a: unknown[]) => void a);
g.getApp = g.getApp || (() => ({ globalData: {} }));
g.getCurrentPages = g.getCurrentPages || (() => []);

/* -------------------------------------------------------------------------- */
/* CJS 互操作                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * `test/cyia-ngx-devkit` 里有 `require('fs')` 这种 CJS 写法，
 * vite 把模块转成 ESM 之后 `require` 不存在，这里补一个。
 */
if (typeof g.require !== 'function') {
  g.require = createRequire(process.cwd() + '/');
}

/* -------------------------------------------------------------------------- */
/* jasmine 兼容层                                                              */
/* -------------------------------------------------------------------------- */

/**
 * 给 `jasmine.arrayWithExactContents` 用的极简深比较。
 *
 * 不用 `expect.utils.equals`：vitest 5 不保证这个命名空间存在，
 * 之前就是在这里静默返回 false，导致 matcher 永远不匹配。
 * 比较对象就是几个字符串 / 数字 / 普通对象 / 数组，手写足够。
 */
function deepEquals(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every(
    (k) =>
      kb.includes(k) &&
      deepEquals(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
      ),
  );
}

/**
 * jasmine 的 `spyOn(obj, key).and.xxx()` 链。
 *
 * vitest 的 `vi.spyOn` 返回的 mock 上没有 `.and`，而 spec 里
 * `.and.callFake` 出现了 56 次、`.and.returnValue` 13 次，
 * 所以给每个 spy 挂一个 `.and` 适配器，语义按 jasmine 文档对齐。
 */
function attachAnd(spy: any) {
  const original = spy.__jasmineOriginal ?? (() => undefined);

  // jasmine 的 `spy.calls.*`：spec 里用到 mostRecent / count / length / any。
  Object.defineProperty(spy, 'calls', {
    configurable: true,
    get() {
      const calls: unknown[][] = spy.mock.calls;
      const wrap = (args: unknown[]) => ({
        args,
        firstArg: args?.[0],
        object: undefined,
      });
      return {
        get length() {
          return calls.length;
        },
        count: () => calls.length,
        any: () => calls.length > 0,
        mostRecent: () => wrap(calls[calls.length - 1] ?? []),
        first: () => wrap(calls[0] ?? []),
        argsFor: (i: number) => calls[i] ?? [],
        allArgs: () => calls.map((a) => a[0]),
        reset: () => spy.mockClear(),
      };
    },
  });

  Object.defineProperty(spy, 'and', {
    configurable: true,
    value: {
      returnValue: (...v: unknown[]) => (spy.mockReturnValue(...v), spy),
      resolveTo: (...v: unknown[]) => (spy.mockResolvedValue(...v), spy),
      rejectTo: (v: unknown) => (spy.mockRejectedValue(v), spy),
      callFake: (fn: (...a: unknown[]) => unknown) => (
        spy.mockImplementation(fn), spy
      ),
      callThrough: () => (spy.mockImplementation(original), spy),
      stub: () => (spy.mockImplementation(() => undefined), spy),
      throwError: (e: unknown) => (
        spy.mockImplementation(() => {
          throw e;
        }),
        spy
      ),
    },
  });
  return spy;
}

function jasmineSpyOn(obj: any, key: string) {
  const original = typeof obj?.[key] === 'function' ? obj[key] : undefined;
  const spy = vi.spyOn(obj, key as never);
  spy.__jasmineOriginal = original;
  return attachAnd(spy);
}

function jasmineCreateSpy(name?: string) {
  return attachAnd(vi.fn(name));
}

/**
 * `jasmine.DEFAULT_TIMEOUT_INTERVAL`：`describeBuilder` 会写它来放宽超时。
 * vitest 没有等价全局，这里存下来供 vitest.config 的 testTimeout 读取，
 * 保证「builder 全量构建要跑几分钟」这件事仍然生效。
 */
const jasmineGlobal: Record<string, unknown> = {
  DEFAULT_TIMEOUT_INTERVAL: 500 * 1000,
  createSpy: jasmineCreateSpy,
  spyOn: jasmineSpyOn,
  /** 数组内容相同、顺序无关。 */
  arrayWithExactContents(expected: unknown[]) {
    return {
      asymmetricMatch(other: unknown) {
        if (!Array.isArray(other) || other.length !== expected.length) {
          return false;
        }
        const rest = [...expected];
        return other.every((item) => {
          const i = rest.findIndex((e) => deepEquals(e, item));
          if (i < 0) return false;
          rest.splice(i, 1);
          return true;
        });
      },
      toString() {
        return `ArrayWithExactContents(${JSON.stringify(expected)})`;
      },
      getExpectedType() {
        return 'array';
      },
    };
  },
  objectContaining: (expected: object) => expect.objectContaining(expected),
  any: (c: unknown) => expect.any(c),
  anything: () => expect.anything(),
};

(g as any).jasmine = jasmineGlobal;
(g as any).spyOn = jasmineSpyOn;

/**
 * jasmine 的 `expectAsync(promise)`。
 *
 * vitest 侧对应 `expect(p).rejects/resolves`，但 jasmine 的六个方法名
 * 在 spec 里写死了，直接包一层比改 12 处调用点便宜。
 */
(g as any).expectAsync = (promise: Promise<unknown>) => {
  const settle = async () => {
    try {
      return { value: await promise, rejected: false };
    } catch (e) {
      return { value: e, rejected: true };
    }
  };
  const assertRejected = (expected?: unknown, kind = 'rejected') => {
    return settle().then(({ value, rejected }) => {
      if (!rejected) {
        throw new Error(`Expected promise to be ${kind}, but it resolved`);
      }
      if (typeof expected === 'undefined') return;
      if (typeof expected === 'string' || expected instanceof RegExp) {
        const message = (value as Error)?.message ?? String(value);
        const ok =
          expected instanceof RegExp
            ? expected.test(message)
            : message.includes(expected);
        if (!ok) {
          throw new Error(
            `Expected rejection message "${message}" to match ${String(expected)}`,
          );
        }
        return;
      }
      expect(value).toEqual(expected);
    });
  };
  return {
    toBeResolved: () =>
      settle().then(({ rejected, value }) => {
        if (rejected) {
          throw new Error(
            `Expected promise to be resolved, but it rejected: ${String(
              (value as Error)?.message ?? value,
            )}`,
          );
        }
      }),
    toBeResolvedTo: (expected: unknown) =>
      settle().then(({ value }) => expect(value).toEqual(expected)),
    toBeResolvedWith: (expected: unknown) =>
      settle().then(({ value }) => expect(value).toEqual(expected)),
    toBeRejected: () => assertRejected(),
    toBeRejectedWith: (expected?: unknown) => assertRejected(expected),
    toBeRejectedWithError: (expected?: unknown) =>
      assertRejected(expected, 'rejected with an error'),
  };
};

(g as any).createSpy = jasmineCreateSpy;
(g as any).fail = (reason?: string) => {
  throw new Error(reason ?? 'Spec failed');
};

expect.extend({
  toBeTrue(received: unknown) {
    return {
      pass: received === true,
      message: () => `expected ${String(received)} to be true`,
    };
  },
  toBeFalse(received: unknown) {
    return {
      pass: received === false,
      message: () => `expected ${String(received)} to be false`,
    };
  },
  toThrowError(received: unknown, expected?: unknown) {
    try {
      if (typeof expected === 'undefined') {
        expect(received).toThrow();
      } else {
        expect(received).toThrow(expected as never);
      }
      return { pass: true, message: () => 'expected not to throw' };
    } catch (e) {
      return { pass: false, message: () => (e as Error).message };
    }
  },
});

declare module '@vitest/expect' {
  interface Matchers<R = void> {
    toBeTrue(): R;
    toBeFalse(): R;
    toThrowError(expected?: unknown): R;
  }
}
