---
title: 'HTTP 请求'
---

`HttpClient` 的注入方式与拦截器写法均与浏览器环境一致，底层实现替换为
`wx.request()`。Angular 的 `HttpRequest` / `HttpHandler` / `HttpInterceptor` 模型未做
改动。

## 配置

小程序侧的请求能力由 `withMiniProgramRequest()` 这个 feature 提供：

```ts
import { provideHttpClient } from '@angular/common/http';
import { withMiniProgramRequest } from 'angular-miniprogram';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withMiniProgramRequest())],
});
```

`bootstrapApplication()` 已默认提供该 feature，通常无需显式配置。

**一旦自行调用 `provideHttpClient()`，就必须同时带上 `withMiniProgramRequest()`。**
该 feature 负责把 `HttpBackend` 替换为小程序实现，而 `provideHttpClient()` 内部会重新
绑定 `HttpBackend`，后写的配置胜出。缺少它时构建不会报错，首个请求才在运行时抛出
`fetch is not a function`。

此外，接口域名需要在小程序后台的 request 合法域名列表中登记。开发者工具可以关闭域名
校验，真机不行。

### 不支持的 feature

`withFetch()` / `withXhr()` 在小程序中无效：逻辑层既没有 `fetch` 也没有
`XMLHttpRequest`。它们会把 `HttpBackend` 替换为 `FetchBackend` / `HttpXhrBackend`，
而装配阶段不校验这一项——构建照常通过，首个请求才在运行时失败。

其余 feature（`withInterceptors` / `withXsrfConfiguration` 等）均可正常使用；
`withInterceptorsFromDi()` 由 `provideHttpClient()` 默认开启，无需显式书写。

## 基本用法

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

## 拦截器

函数式拦截器（推荐写法）：

```ts
import { withMiniProgramRequest } from 'angular-miniprogram';

bootstrapApplication({
  providers: [
    provideHttpClient(
      withMiniProgramRequest(), // 必须带上，否则 HttpBackend 被替换
      withInterceptors([loggingInterceptor]),
    ),
  ],
});
```

DI 式拦截器无需额外配置——`provideHttpClient()` 默认已启用 `withInterceptorsFromDi()`：

```ts
bootstrapApplication({
  providers: [
    { provide: HTTP_INTERCEPTORS, multi: true, useClass: AuthInterceptor },
  ],
});
```

拦截器本身的实现与浏览器环境完全一致：

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const clone = req.clone({
    setHeaders: { Authorization: `Bearer ${token()}` },
  });
  return next(clone);
};
```

小程序不存在 CORS 概念，浏览器侧用于处理 preflight 的拦截器可以移除。

## 上传与下载

上传与下载分别走 `wx.uploadFile()` / `wx.downloadFile()`，参数通过 `HttpContext`
传递：

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

`wx.request()` 自身的额外参数（`enableCache` / `enableHttp2` / `enableQuic` /
`timeout`）通过 `REQUSET_TOKEN` 传递。该 token 名称缺少字母 Q，属于历史拼写，已固定
不变。

## 与浏览器的差异

| 项             | 说明                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| 方法           | 支持 `GET` `POST` `PUT` `DELETE` `HEAD` `OPTIONS`；`PATCH` 与 JSONP 直接抛错 |
| 域名           | 必须在小程序后台的 request 合法域名列表中登记                                |
| 状态码         | 非 2xx 走 `error` 分支，`HttpErrorResponse` 的结构与浏览器一致               |
| `responseType` | 支持 `json`（默认）/ `text` / `arraybuffer`                                  |
| 进度           | 请求不提供上传/下载进度事件，无法获取 `HttpEventType.UserEvent`              |
| cookie         | 不自动携带。`Set-Cookie` 位于响应的 `headers` 中，需自行处理                 |

响应对象为 `MiniProgramHttpResponse`，比标准 `HttpResponse` 多两个字段：`cookies`
（字符串数组）与 `profile`（网络调试信息）。使用 `observe: 'response'` 时可直接读取。
