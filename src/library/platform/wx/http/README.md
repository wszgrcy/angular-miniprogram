# 微信小程序 HTTP

## 注意事项

### 微信小程序额外参数

为保持 API 的统一，需要借助 `HttpContext` 来传递微信小程序额外的参数。

```ts
import {
  WX_UPLOAD_FILE_TOKEN,
  WX_DOWNLOAD_FILE_TOKEN,
  WX_REQUSET_TOKEN,
} from 'angular-miniprogram';
import { HttpContext, HttpContextToken } from 'angular-miniprogram/common/http';

// ...

// 微信小程序开启 HTTP2
http.get('url', {
  context: new HttpContext().set(WX_REQUSET_TOKEN, {
    enableHttp2: true,
  }),
});

// 微信小程序文件上传
http.post('url', null, {
  context: new HttpContext().set(WX_UPLOAD_FILE_TOKEN, {
    filePath: 'filePath',
    fileName: 'fileName',
  }),
});

// 微信小程序文件下载
http.get('url', {
  context: new HttpContext().set(WX_DOWNLOAD_FILE_TOKEN, {
    filePath: 'filePath',
  }),
});
```
