---
title: 'HTTP 请求'
---

`HttpClient` 照常注入、照常写拦截器，底层换成 `wx.request()`。Angular 那套
`HttpRequest` / `HttpHandler` / `HttpInterceptor` 的模型完全没动。

```ts
import { HttpClient } from '@angular/common/http';

export class ArticlesComponent {
  private readonly http = inject(HttpClient);
  readonly list = signal<Article[]>([]);

  load() {
    this.http.get<Article[]>('https://example.com/api/articles').subscribe({
      next: (res) => this.list.set(res),
      error: (err) => console.error(err.status, err.error),
    });
  }
}
```

`bootstrapApplication()` 已经装好了 `provideHttpClient(withMiniProgramRequest(), withInterceptorsFromDi())`，
不需要你显式提供。加拦截器见下文。

## 不能用的 feature

`withFetch()` / `withXhr()` 没有意义：小程序逻辑层既没有 `fetch` 也没有
`XMLHttpRequest`。它们会把 `HttpBackend` 换成 `FetchBackend` / `HttpXhrBackend`，
而装配阶段**不检查这个**——构建照过，第一个请求才在运行时撞
`fetch is not a function`。

其余 feature（`withInterceptors` / `withInterceptorsFromDi` /
`withXsrfConfiguration` 等）照常。

## 与浏览器的差异

| 项 | 说明 |
| --- | --- |
| 方法 | `GET` `POST` `PUT` `DELETE` `HEAD` `OPTIONS` 可用；`PATCH` / `JSONP` 直接抛错 |
| 域名 | 必须在小程序后台的 request 合法域名里登记。开发者工具可关校验，真机不行 |
| 状态码 | 非 2xx 走 `error`，`HttpErrorResponse` 的形态跟浏览器一致 |
| `responseType` | `json`（默认）/ `text` / `arraybuffer` 都支持 |
| 进度 | 请求本身没有上传/下载进度事件，`HttpEventType.UserEvent` 那类拿不到 |
| cookie | 不自动携带。`Set-Cookie` 在响应的 `headers` 里，要自己管 |

响应对象是 `MiniProgramHttpResponse`，比标准 `HttpResponse` 多两个字段：
`cookies`（字符串数组）和 `profile`（网络调试信息）。用 `observe: 'response'` 时
直接能读到。

## 上传与下载

走 `wx.uploadFile()` / `wx.downloadFile()`，参数用 `HttpContext` 传：

```ts
import { HttpContext } from '@angular/common/http';
import { UPLOAD_FILE_TOKEN, DOWNLOAD_FILE_TOKEN } from 'angular-miniprogram';

// 上传：POST + UPLOAD_FILE_TOKEN
this.http.post('/upload', formData, {
  context: new HttpContext().set(UPLOAD_FILE_TOKEN, {
    filePath: tempFilePath,
    name: 'file',
    timeout: 30000,
  }),
});

// 下载：GET + DOWNLOAD_FILE_TOKEN
this.http.get('/file', {
  context: new HttpContext().set(DOWNLOAD_FILE_TOKEN, {
    filePath: savedPath,
    timeout: 30000,
  }),
});
```

`wx.request()` 自己的额外参数（`enableCache` / `enableHttp2` / `enableQuic` /
`timeout`）走 `REQUSET_TOKEN`（注意这个 token 名字里少个 Q，是历史拼写，已固化）。

## 拦截器

**不要再调一次 `provideHttpClient()`。** 它内部会重新绑 `HttpBackend`，
后写的胜出，结果就是 backend 变回 `FetchBackend`，所有请求在运行时撞
`fetch is not a function`。要再调就必须把小程序那个 feature 一起带上。

函数式拦截器（推荐写法）：

```ts
import { withMiniProgramRequest } from 'angular-miniprogram';

bootstrapApplication({
  providers: [
    provideHttpClient(
      withMiniProgramRequest(), // 必须带上，否则 backend 被换掉
      withInterceptors([loggingInterceptor]),
    ),
  ],
});
```

DI 式拦截器不需要重调 `provideHttpClient`——`withInterceptorsFromDi()` 已经开了：

```ts
bootstrapApplication({
  providers: [
    { provide: HTTP_INTERCEPTORS, multi: true, useClass: AuthInterceptor },
  ],
});
```

拦截器本身跟浏览器版完全一样：

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const clone = req.clone({
    setHeaders: { Authorization: `Bearer ${token()}` },
  });
  return next(clone);
};
```

小程序的请求没有 CORS 概念，浏览器那套 preflight 拦截器可以删掉。
