import {
  HttpBackend,
  HttpFeature,
  HttpFeatureKind,
} from '@angular/common/http';
import { MiniprogramHttpBackend } from './backend';

/**
 * 小程序请求后端，以 feature 形式接入 `provideHttpClient`。
 *
 * 官方 `withFetch` / `withXhr` 的实现是 `makeHttpFeature(kind, [Backend, {provide: HttpBackend, useExisting: Backend}])`，
 * 也就是说 backend 是通过 feature 机制插进去的，不是在外面往 `makeEnvironmentProviders` 里追加。
 * 后者的问题：覆盖发生在 `ngProvideHttpClient()` 之后，用户显式传的 `withFetch()` 会被静默覆盖；
 * 而且绕过了 `provideHttpClient` 的 devMode 校验，配置冲突不会被发现。
 *
 * `makeHttpFeature` 本身没有被导出，但 `HttpFeature` 是公开接口，只有 `ɵkind` / `ɵproviders` 两个字段，
 * 直接构造等价对象即可。
 *
 * `HttpFeatureKind` 是闭合枚举，没有小程序项。`wx.request` 语义上就是平台原生请求 API，与 Xhr 最接近；
 * 用 Xhr 还能让 `withRequestsMadeViaParent()` 互斥校验正常生效。用户自己传 `withXhr()` 会被拒绝。
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
