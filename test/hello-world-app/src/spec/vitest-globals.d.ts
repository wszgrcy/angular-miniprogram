/**
 * 设备端跑的是 vitest（`setupCommonEnv` 在运行时装 describe/it/expect），
 * 这里补编译期的全局声明。
 *
 * 用 `/// <reference>` 而不是 tsconfig 的 `types: ["vitest/globals"]`：
 * 派生 tsconfig 把 `typeRoots` 钉死到 `<root>/node_modules/@types`
 * （见 src/builder/shared/derived-tsconfig.ts），而 vitest 不在 @types 下，
 * 那种写法只会得到 TS2688。reference 走正常模块解析，能向上找到根 node_modules。
 */
/// <reference types="vitest/globals" />
