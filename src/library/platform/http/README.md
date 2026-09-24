# 小程序 HTTP

## 注意事项

### 导入

```ts
import { HttpClientModule } from 'angular-miniprogram';

@NgModule({
  imports: [
    HttpClientModule
  ]
})
export class AppModule { }
```

或

```ts
import { provideHttpClient } from 'angular-miniprogram';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient()
  ]
});
```

### 关于 withFetch / withXhr

本模块的 backend 是以 **feature** 形式接入 `provideHttpClient` 的，
与官方 `withFetch()` / `withXhr()` 同构：

```ts
export function withMiniProgramRequest(): HttpFeature<HttpFeatureKind.Xhr> {
  return {
    ɵkind: HttpFeatureKind.Xhr,
    ɵproviders: [
      MiniprogramHttpBackend,
      { provide: HttpBackend, useExisting: MiniprogramHttpBackend },
    ],
  };
}
```

`provideHttpClient()` 会把它作为最后一个 feature 交给官方装配，
所以 backend 的绑定顺序与 devMode 校验都由 `provideHttpClient` 统一管理。

小程序里没有 `fetch` 也没有 `XMLHttpRequest`，因此**传入
`withFetch()` 或 `withXhr()` 会直接报错**，而不是被静默覆盖：

```ts
provideHttpClient(withFetch());
// ✗ Error: provideHttpClient(): 小程序环境没有 fetch / XMLHttpRequest，
//   withFetch() 与 withXhr() 在此不可用。请求一律走 wx.request()，请移除该 feature。
```

其余 feature（`withInterceptors` / `withInterceptorsFromDi` /
`withXsrfConfiguration` 等）照常可用。

### 小程序额外参数

为保持 API 的统一，需要借助 `HttpContext` 来传递小程序额外的参数。

```ts
import {
  UPLOAD_FILE_TOKEN,
  DOWNLOAD_FILE_TOKEN,
  REQUSET_TOKEN,
} from 'angular-miniprogram';
import { HttpContext, HttpContextToken } from 'angular-miniprogram/common/http';

// ...

// 小程序开启 HTTP2
http.get('url', {
  context: new HttpContext().set(REQUSET_TOKEN, {
    enableHttp2: true,
  }),
});

// 小程序文件上传
http.post('url', null, {
  context: new HttpContext().set(UPLOAD_FILE_TOKEN, {
    filePath: 'filePath',
    fileName: 'fileName',
  }),
});

// 小程序文件下载
http.get('url', {
  context: new HttpContext().set(DOWNLOAD_FILE_TOKEN, {
    filePath: 'filePath',
  }),
});
```
