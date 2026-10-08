import type { BuildPlatform } from '../../platform/platform';

/**
 * vitest 全局 API -> 小程序全局能力表。
 *
 * spec 里写的是裸 `describe` / `it` / `expect`，而小程序里没有 window / global 那套全局对象：
 * `globals: true` 时 vitest 的 `registerApiGlobally` 把 API 挂到 `globalThis`（编译期即 `wx.__window`），
 * 源码里的裸标识符却仍然指向不存在的真 global，于是每个 spec 都 `describe is not defined`。
 * 所以必须编译期把裸名重定向到同一张表。
 *
 * 名字撞车是这套映射唯一的真风险（`test` / `it` / `expect` 都是常见变量名），好在 define 是 AST
 * 作用域感知的，局部声明不受影响，而且只作用于测试构建。
 */
export function miniProgramVitestGlobalDefine(
  buildPlatform: BuildPlatform,
): Record<string, string> {
  const p = buildPlatform.globalVariablePrefix;
  const names = [
    'suite',
    'test',
    'describe',
    'it',
    'chai',
    'expect',
    'assert',
    'expectTypeOf',
    'assertType',
    'vitest',
    'vi',
    'beforeAll',
    'afterAll',
    'beforeEach',
    'afterEach',
    'onTestFinished',
    'onTestFailed',
    'aroundEach',
    'aroundAll',
  ];
  return Object.fromEntries(names.map((name) => [name, `${p}.${name}`]));
}

/**
 * 小程序没有（或版本旧到没有）的全局构造器，实现由 runtime 的 `installMiniProgramGlobals()`
 * 在启动时塞进同一张表。这里负责把裸标识符指过去——两侧必须配套，见 global-polyfills.ts。
 *
 * 为什么非得走 define：这些名字在小程序里是真的不存在，光往表里写没用，源码里的裸 `AggregateError`
 * 仍指向不存在的真 global。`@vitest/runner` 的 `failTask` 就有一句不加保护的
 * `e instanceof AggregateError`，缺了它每条失败用例都会变成 `Right-hand side of 'instanceof' is not an object`。
 */
export function miniProgramBuiltinDefine(
  buildPlatform: BuildPlatform,
): Record<string, string> {
  const p = buildPlatform.globalVariablePrefix;
  return {
    Event: `${p}.Event`,
    EventTarget: `${p}.EventTarget`,
    AggregateError: `${p}.AggregateError`,
  };
}
