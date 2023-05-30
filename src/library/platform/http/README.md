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
