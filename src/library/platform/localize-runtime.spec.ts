/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ɵcomputeMsgId as computeMsgId,
  loadTranslations,
} from '@angular/localize';

import { initMiniProgramTestEnv } from './test-util/init-env';

/**
 * 运行时 i18n 的接线是否真的通。
 *
 * ## 为什么单独钉这个
 *
 * 构建器把 `polyfills` 里声明的 `@angular/localize` 归一成
 * `@angular/localize/init` 注入（见 `builder/vite/index.ts`）。这引出一个
 * 必须回答的问题：app 自己 `import { loadTranslations }` 会不会被架空？
 *
 * 不会。两个入口共用同一个 `_localize-chunk.mjs`，所以
 *  - `/init` 挂上全局的那个 `$localize` 对象
 *  - `loadTranslations` 写 `translate` / `TRANSLATIONS` 就在**同一个对象**上
 *
 * 注册表只有一份（产物侧也验过：`$localize` 只在 `polyfills.js` 里定义一次，
 * 业务 chunk 一律读 `wx.__window.$localize`）。下面 `translate` 那两条断言
 * 就是这个意思——哪天解析分叉成两份副本，它会立刻红。
 *
 * ## 两个踩过的坑（都记下来）
 *
 * - `loadTranslations(translations)` **只收一个参数**。老文档里的第二个
 *   `locale` 参数在这个版本没有，多传会被静默忽略。
 * - 插值的占位符名是 `$PH`（`hi {$PH}`），不是 `EXP_0`。id 算错就是
 *   「翻译没命中」，而且不报错，只会退回源文案，极难查。
 */
describe('运行时 i18n 接线', () => {
  beforeEach(() => initMiniProgramTestEnv());

  /** 必须当**模板标签**用：普通函数调用拿不到 `.raw`，`$localize` 内部会炸 */
  const $l = () => (globalThis as any).$localize;

  it('没加载翻译时原样返回', () => {
    expect($l()`hello`).toBe('hello');
    expect($l().translate).toBeUndefined();
  });

  it('loadTranslations 写的就是全局那个 $localize', () => {
    loadTranslations({ [computeMsgId('hello', '')]: '你好' });
    expect($l()`hello`).toBe('你好');
    // 写回落在同一个对象上，不是另一份副本
    expect(typeof $l().translate).toBe('function');
    expect($l().TRANSLATIONS).toBeDefined();
  });

  it('带插值的消息能翻，占位符仍取实参', () => {
    loadTranslations({ [computeMsgId('hi {$PH}', '')]: '你好 {$PH}' });
    expect($l()`hi ${'世界'}`).toBe('你好 世界');
  });

  it('没命中的消息退回源文案，不抛', () => {
    loadTranslations({ [computeMsgId('别的', '')]: 'x' });
    expect($l()`未翻译的文案`).toBe('未翻译的文案');
  });
});
