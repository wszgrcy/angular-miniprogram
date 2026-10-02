/**
 * 测试环境的全局准备（`vitest.config.mts` 的 `setupFiles`）。
 *
 * 只装小程序全局（`wx` / `App` / `Page` / `Component` / `getApp` / `getCurrentPages`）。
 * `platform-core.ts` 里 `MINIPROGRAM_GLOBAL = wx` 是**模块求值时**就读全局，
 * 所以必须早于任何 spec 的 import，只能放 setupFiles。
 *
 * 这里**没有任何断言/spy 兼容层**：spec 全部用 vitest 原生 API。
 */
import { expect, vi } from 'vitest';

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
