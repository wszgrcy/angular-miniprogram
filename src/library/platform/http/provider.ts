import {
  HttpBackend,
  HttpFeature,
  HttpFeatureKind,
} from '@angular/common/http';
import { MiniprogramHttpBackend } from './backend';

/**
 * 小程序请求后端，以 **feature** 形式接入 `provideHttpClient`。
 *
 * ## 为什么必须是 feature
 *
 * 官方 `withFetch` / `withXhr` 的实现是（`@angular/common/http` 编译产物）：
 *
 * ```js
 * function withFetch() {
 *   return makeHttpFeature(HttpFeatureKind.Fetch, [
 *     FetchBackend,
 *     {provide: HttpBackend, useExisting: FetchBackend},
 *   ]);
 * }
 * ```
 *
 * 也就是说 **backend 是通过 feature 机制插进去的**，不是在外面往
 * `makeEnvironmentProviders` 里追加。之前那种写法有两个问题：
 *
 * 1. 覆盖发生在 `ngProvideHttpClient()` 之后，属于「后写胜出」的隐式行为。
 *    用户若显式传了 `withFetch()` / `withXhr()`，会被静默覆盖掉。
 * 2. 绕过了 `provideHttpClient` 的 devMode 校验（比如
 *    `withRequestsMadeViaParent()` 与 backend 互斥那条），配置冲突
 *    不会被发现。
 *
 * `makeHttpFeature` 本身没有被导出（连 `ɵ` 形式都没有），但
 * `HttpFeature` 是公开接口，只有 `ɵkind` / `ɵproviders` 两个字段，
 * 直接构造等价对象即可。
 *
 * ## 为什么 kind 用 Xhr
 *
 * `HttpFeatureKind` 是闭合枚举（0~7），没有小程序项。`wx.request` 语义上
 * 就是「平台原生请求 API」，与 Xhr 最接近；用 Xhr 还能让 Angular 自带的
 * `withRequestsMadeViaParent()` 互斥校验正常生效。
 * 用户自己传 `withXhr()` 在本模块里会被拒绝（见下），所以不会混淆。
 */
export function withMiniProgramRequest(): HttpFeature<HttpFeatureKind.Xhr> {
  return {
    ɵkind: HttpFeatureKind.Xhr,
    ɵproviders: [
      MiniprogramHttpBackend,
      { provide: HttpBackend, useExisting: MiniprogramHttpBackend },
    ],
  };
}
