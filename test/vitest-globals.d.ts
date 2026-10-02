/**
 * 测试全局的类型声明。
 *
 * `vitest.config.mts` 开了 `globals: true`，运行时由 vitest 注入
 * `describe` / `it` / `expect` 等；`test/vitest-setup.ts` 再补上
 * 历史 spec 沿用的 jasmine 风格 API。运行时已经就位，这里只补类型。
 *
 * 注意 `@types/jasmine` 仍然装着，但那是给 `src/builder/karma/**` 用的
 * （karma builder 对外暴露的就是 jasmine 接口，属于产品表面）。
 * `tsconfig.spec.json` 的 `types` 里**不**包含它，本文件才是 spec 侧的口径。
 */
/// <reference types="vitest/globals" />

import type { Mock } from 'vitest';

/** jasmine 的 `spy.calls.*`。 */
interface JasmineSpyCalls {
  readonly length: number;
  count(): number;
  any(): boolean;
  mostRecent(): { args: any[]; firstArg: any; object: any };
  first(): { args: any[]; firstArg: any; object: any };
  argsFor(index: number): any[];
  allArgs(): any[];
  reset(): void;
}

/**
 * jasmine 的 `spy.and.*` 链。
 *
 * 每个方法都**返回 spy 本身**，所以 `.and.callFake(f)` 之后还能继续
 * `.calls.mostRecent()`。返回 `void` 会让这条链在类型上断掉。
 */
interface JasmineAnd {
  returnValue(...values: unknown[]): JasmineSpy;
  resolveTo(...values: unknown[]): JasmineSpy;
  rejectTo(value: unknown): JasmineSpy;
  callFake(fn: (...args: any[]) => any): JasmineSpy;
  callThrough(): JasmineSpy;
  stub(): JasmineSpy;
  throwError(error: unknown): JasmineSpy;
}

interface JasmineSpy extends Mock<(...args: any[]) => any> {
  readonly and: JasmineAnd;
  readonly calls: JasmineSpyCalls;
}

declare global {
  /** jasmine 的 `spyOn(obj, key)`，返回带 `.and` / `.calls` 的 vitest spy。 */
  function spyOn<T extends object, K extends keyof T>(
    obj: T,
    key: K,
  ): JasmineSpy;

  /** jasmine 的 `createSpy(name)`。 */
  function createSpy(name?: string): JasmineSpy;

  /** jasmine 的 `fail()`。 */
  function fail(reason?: string): never;

  /** jasmine 的 `expectAsync(promise)`。 */
  function expectAsync(promise: Promise<unknown>): AsyncMatchers;

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jasmine {
    function createSpy(name?: string): JasmineSpy;
    function spyOn<T extends object, K extends keyof T>(
      obj: T,
      key: K,
    ): JasmineSpy;
    /** 数组内容相同、顺序无关。 */
    function arrayWithExactContents(expected: unknown[]): unknown;
    function objectContaining<T extends object>(expected: T): T;
    function any(ctor: unknown): unknown;
    function anything(): unknown;
  }
}

interface AsyncMatchers {
  toBeResolved(): Promise<void>;
  toBeResolvedTo(expected: unknown): Promise<void>;
  toBeResolvedWith(expected: unknown): Promise<void>;
  toBeRejected(): Promise<void>;
  toBeRejectedWith(expected?: unknown): Promise<void>;
  toBeRejectedWithError(expected?: unknown): Promise<void>;
}

declare module 'vitest' {
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    T = unknown,
  > {
    /** jasmine 的严格 `=== true`。 */
    toBeTrue(): R;
    /** jasmine 的严格 `=== false`。 */
    toBeFalse(): R;
    /** jasmine 的 `toThrowError`，vitest 叫 `toThrow`。 */
    toThrowError(expected?: unknown): R;
  }
  interface Assertion<R = void, T = unknown> {
    /** jasmine 的 `expect(x).withContext(msg)`，失败时附带上下文。 */
    withContext(context: unknown): Assertion<R, T>;
  }
}

export {};
