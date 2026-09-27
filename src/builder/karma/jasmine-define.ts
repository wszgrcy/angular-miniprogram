import type { BuildPlatform } from '../platform/platform';

/**
 * jasmine 全局 -> 小程序运行时全局的映射。
 *
 * 小程序里没有 window / global 那套全局对象，jasmine 的 describe / it / expect
 * 等全局函数在编译期被替换成 `wx.__window.xxx`（由 karma client 挂上去）。
 *
 * webpack 侧用 DefinePlugin，Vite 侧用 `define`，语义一致：
 * 都是编译期文本替换。这里抽成一份，两条链路共用，避免以后改漏。
 */
export function jasmineGlobalDefine(
  buildPlatform: BuildPlatform
): Record<string, string> {
  const p = buildPlatform.globalVariablePrefix;

  return {
    describe: `${p}.describe`,
    xdescribe: `${p}.xdescribe`,
    fdescribe: `${p}.fdescribe`,
    it: `${p}.it`,
    xit: `${p}.xit`,
    fit: `${p}.fit`,
    beforeEach: `${p}.beforeEach`,
    afterEach: `${p}.afterEach`,
    beforeAll: `${p}.beforeAll`,
    afterAll: `${p}.afterAll`,
    setSpecProperty: `${p}.setSpecProperty`,
    setSuiteProperty: `${p}.setSuiteProperty`,
    expect: `${p}.expect`,
    expectAsync: `${p}.expectAsync`,
    pending: `${p}.pending`,
    fail: `${p}.fail`,
    spyOn: `${p}.spyOn`,
    spyOnProperty: `${p}.spyOnProperty`,
    spyOnAllFunctions: `${p}.spyOnAllFunctions`,
    jsApiReporter: `${p}.jsApiReporter`,
    jasmine: `${p}.jasmine`,
  };
}

/**
 * karma client 需要的编译期常量。
 *
 * webpack 侧是 DefinePlugin 的 KARMA_CLIENT_CONFIG / KARMA_PORT，
 * client/main.ts 里 `declare const KARMA_CLIENT_CONFIG` 读它。
 */
export function karmaClientDefine(options: {
  clientConfig: unknown;
  port: number | string;
}): Record<string, string> {
  return {
    KARMA_CLIENT_CONFIG: JSON.stringify(options.clientConfig),
    KARMA_PORT: JSON.stringify(options.port),
  };
}
