/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * `angular-miniprogram/common/http` —— 薄再导出层。
 *
 * ## 为什么不再 vendor
 *
 * 以前这个 entry point 是由 `npm run sync`（code-recycle）从
 * angular/angular 同步下来的整份 `packages/common/http`（约 9000 行）。
 * 但小程序并不需要它：
 *
 *   - Angular 把 `HttpBackend` 设计成可插拔的传输接缝
 *   - `platform/http/MiniprogramHttpBackend` 用 `wx.request` 实现它
 *   - `platform/http/provider.ts` 只做一件事：
 *       `ngProvideHttpClient(...features)`
 *       + `{provide: HttpBackend, useExisting: MiniprogramHttpBackend}`
 *
 * 而 vendor 副本里在小程序环境下**全是死代码**：
 *   xhr(448) / jsonp(349) / xsrf(141) / transfer_cache(729) / fetch(493)
 *
 * 所以现在直接依赖 `@angular/common/http`，本文件只做转发，
 * 对外 API 表面保持不变。
 */
export {
  HttpBackend,
  HttpHandler,
  // 官方就是以 `ɵ` 前缀暴露这个符号（以前 vendor 里叫
  // `HttpInterceptorHandler`，这里映射成同样的对外名字）。
  ɵHttpInterceptingHandler,
} from '@angular/common/http';
export {HttpClient} from '@angular/common/http';
export {HttpContext, HttpContextToken} from '@angular/common/http';
export {FetchBackend} from '@angular/common/http';
export {HttpHeaders} from '@angular/common/http';
export {
  HTTP_INTERCEPTORS,
  HttpHandlerFn,
  HttpInterceptor,
  HttpInterceptorFn,
} from '@angular/common/http';
export {JsonpClientBackend, JsonpInterceptor} from '@angular/common/http';
export {HttpClientJsonpModule, HttpClientModule, HttpClientXsrfModule} from '@angular/common/http';
export {
  HttpParameterCodec,
  HttpParams,
  HttpParamsOptions,
  HttpUrlEncodingCodec,
} from '@angular/common/http';
export {
  HttpFeature,
  HttpFeatureKind,
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
  withJsonpSupport,
  withNoXsrfProtection,
  withRequestsMadeViaParent,
  withXhr,
  withXsrfConfiguration,
} from '@angular/common/http';
export {HttpRequest, HttpRequestOptions} from '@angular/common/http';
// `export {...} from` 不会把符号引入本地作用域，
// 而下面 `HttpClientCommonOptions` 的定义要用到它，所以单独 import。
import type { HttpRequestOptions } from '@angular/common/http';
export {httpResource, HttpResourceFn} from '@angular/common/http';
export {HttpResourceOptions, HttpResourceRef, HttpResourceRequest} from '@angular/common/http';
export {
  HttpDownloadProgressEvent,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpResponseBase,
  HttpSentEvent,
  HttpStatusCode,
  HttpUploadProgressEvent,
  HttpUserEvent,
} from '@angular/common/http';
export {
  HTTP_TRANSFER_CACHE_ORIGIN_MAP,
  HttpTransferCacheOptions,
  // 官方导出形态是 `withHttpTransferCache as ɵwithHttpTransferCache`，
  // 对外名已带 `ɵ`，直接引对外名。
  ɵwithHttpTransferCache,
} from '@angular/common/http';
export {HttpXhrBackend} from '@angular/common/http';
export {HttpXsrfTokenExtractor} from '@angular/common/http';

/**
 * fork 新增的公开类型（官方无对应），原先定义在 vendor 的 `src/client.ts`。
 *
 * 内部无人使用，仅作为对外 API 表面保留，避免破坏既有用户代码。
 * 语义：去掉 `headers` / `params` 两个需要特殊构造器类型的选项后的
 * `HttpRequestOptions`。
 */
export type HttpClientCommonOptions = Omit<HttpRequestOptions, 'headers' | 'params'>;

// 私有导出：官方以 `ɵ` 前缀暴露（形态为 `X as ɵX`），
// 这里直接引对外名，保持本包对外 API 不变。
export {
  ɵHTTP_FETCH_MAX_RESPONSE_SIZE,
  ɵHTTP_ROOT_INTERCEPTOR_FNS,
  ɵREQUESTS_CONTRIBUTE_TO_STABILITY,
} from '@angular/common/http';
