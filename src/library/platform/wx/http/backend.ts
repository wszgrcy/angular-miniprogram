import {
  HttpBackend,
  HttpContextToken,
  HttpDownloadProgressEvent,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaderResponse,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
  HttpUploadProgressEvent,
} from 'angular-miniprogram/common/http';
import { Observable, Observer } from 'rxjs';
import { WxHttpDownloadResponse, WxHttpResponse } from './response';

/** Use this token to pass additional `wx.uploadFile()` parameter */
export const WX_UPLOAD_FILE_TOKEN = new HttpContextToken<{
  filePath?: string;
  name?: string;
  timeout?: number;
}>(() => ({}));

/** Use this token to pass additional `wx.downloadFile()` parameter */
export const WX_DOWNLOAD_FILE_TOKEN = new HttpContextToken<{
  filePath?: string;
  timeout?: number;
}>(() => ({}));

/** Use this token to pass additional `wx.request()` parameter */
export const WX_REQUSET_TOKEN = new HttpContextToken<{
  enableCache?: boolean;
  enableHttp2?: boolean;
  enableQuic?: boolean;
  timeout?: number;
}>(() => ({}));

export class WxHttpBackend implements HttpBackend {
  handle(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    if (
      request.method === 'POST' &&
      // TODO angular v13.1 后采用 context.has()
      request.context.get(WX_UPLOAD_FILE_TOKEN)?.filePath
    ) {
      return this.upload(request);
    }

    if (
      request.method === 'GET' &&
      // TODO angular v13.1 后采用 context.has()
      request.context.get(WX_DOWNLOAD_FILE_TOKEN)?.filePath
    ) {
      return this.download(request);
    }

    return this.request(request);
  }

  /**
   * wx upload file
   * @param request
   */
  private upload(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    return new Observable((observer: Observer<HttpEvent<any>>) => {
      // The response header event handler
      const onHeadersReceived: WechatMiniprogram.OnHeadersReceivedCallback = ({
        header,
      }) => {
        observer.next(
          new HttpHeaderResponse({
            url: request.url,
            headers: new HttpHeaders(header),
          })
        );
      };

      // The upload progress event handler
      const onUpProgressUpdate: WechatMiniprogram.UploadTaskOnProgressUpdateCallback =
        ({ totalBytesSent, totalBytesExpectedToSend }) => {
          observer.next({
            type: HttpEventType.UploadProgress,
            loaded: totalBytesSent,
            total: totalBytesExpectedToSend,
          } as HttpUploadProgressEvent);
        };

      const { filePath, name, timeout } =
        request.context.get(WX_UPLOAD_FILE_TOKEN);

      const task = wx.uploadFile({
        url: request.urlWithParams,
        filePath: filePath!,
        name: name!,
        header: this.buildHeaders(request),
        formData: request.body,
        timeout: timeout,
        success: ({ data, statusCode: status, errMsg: statusText }) => {
          let ok = status >= 200 && status < 300;
          let body: any | null = null;

          if (
            request.responseType === 'json' &&
            typeof data === 'string' &&
            data !== ''
          ) {
            try {
              body = JSON.parse(data);
            } catch (error) {
              if (ok) {
                ok = false;
                body = { error, text: body };
              }
            }
          }

          if (ok) {
            observer.next(
              new HttpResponse({
                url: request.url,
                body,
                status,
                statusText,
              })
            );
            observer.complete();
          } else {
            observer.error(
              new HttpErrorResponse({
                url: request.url,
                error: body,
                status,
                statusText,
              })
            );
          }
        },
        fail: ({ errMsg }: WechatMiniprogram.GeneralCallbackResult) => {
          observer.error(
            new HttpErrorResponse({
              url: request.url,
              statusText: errMsg,
            })
          );
        },
      });

      observer.next({ type: HttpEventType.Sent });

      if (request.reportProgress) {
        task.onHeadersReceived(onHeadersReceived);
        task.onProgressUpdate(onUpProgressUpdate);
      }

      return () => {
        if (request.reportProgress) {
          task.offHeadersReceived(onHeadersReceived);
          task.offProgressUpdate(onUpProgressUpdate);
        }

        task.abort();
      };
    });
  }

  /**
   * wx download file
   * @param request
   */
  private download(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    return new Observable((observer: Observer<HttpEvent<any>>) => {
      // The response header event handler
      const onHeadersReceived: WechatMiniprogram.OnHeadersReceivedCallback = ({
        header,
      }) => {
        observer.next(
          new HttpHeaderResponse({
            url: request.url,
            headers: new HttpHeaders(header),
          })
        );
      };

      // The download progress event handler
      const onDownProgressUpdate: WechatMiniprogram.DownloadTaskOnProgressUpdateCallback =
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          observer.next({
            type: HttpEventType.DownloadProgress,
            loaded: totalBytesWritten,
            total: totalBytesExpectedToWrite,
          } as HttpDownloadProgressEvent);
        };

      const { filePath, timeout } = request.context.get(WX_DOWNLOAD_FILE_TOKEN);

      const task = wx.downloadFile({
        url: request.urlWithParams,
        filePath: filePath,
        header: this.buildHeaders(request),
        timeout: timeout,
        success: ({
          statusCode: status,
          errMsg: statusText,
          filePath,
          tempFilePath,
          profile,
        }) => {
          const ok = status >= 200 && status < 300;

          if (ok) {
            observer.next(
              new WxHttpDownloadResponse({
                url: request.url,
                status,
                statusText,
                filePath,
                tempFilePath,
                profile,
              })
            );
            observer.complete();
          } else {
            observer.error(
              new HttpErrorResponse({
                url: request.url,
                status,
                statusText,
              })
            );
          }
        },
        fail: ({ errMsg }: WechatMiniprogram.GeneralCallbackResult) => {
          observer.error(
            new HttpErrorResponse({
              url: request.url,
              statusText: errMsg,
            })
          );
        },
      });

      observer.next({ type: HttpEventType.Sent });

      if (request.reportProgress) {
        task.onHeadersReceived(onHeadersReceived);
        task.onProgressUpdate(onDownProgressUpdate);
      }

      return () => {
        if (request.reportProgress) {
          task.offHeadersReceived(onHeadersReceived);
          task.offProgressUpdate(onDownProgressUpdate);
        }

        task.abort();
      };
    });
  }

  /**
   * wx http request
   * @param request
   */
  private request(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    if (['PATCH', 'JSONP'].includes(request.method)) {
      throw Error(
        'WeChat MiniProgram does not support http method as ' + request.method
      );
    }
    return new Observable((observer: Observer<HttpEvent<any>>) => {
      // The response header event handler
      const onHeadersReceived: WechatMiniprogram.OnHeadersReceivedCallback = ({
        header,
      }) => {
        observer.next(
          new HttpHeaderResponse({
            url: request.url,
            headers: new HttpHeaders(header),
          })
        );
      };

      const task = wx.request({
        url: request.urlWithParams,
        method: request.method as WechatMiniprogram.RequestOption['method'],
        data: request.body,
        header: this.buildHeaders(request),
        // wx 从 responseType 中拆分出 dataType，这里需要处理一下
        responseType:
          request.responseType === 'arraybuffer'
            ? request.responseType
            : 'text',
        dataType:
          request.responseType === 'json' ? request.responseType : '其他',
        success: ({
          data,
          header,
          statusCode: status,
          errMsg: statusText,
          cookies,
          profile,
        }) => {
          const ok = status >= 200 && status < 300;
          const headers = new HttpHeaders(header);

          if (ok) {
            observer.next(
              new WxHttpResponse({
                url: request.url,
                body: data,
                status,
                statusText,
                headers,
                cookies,
                profile,
              })
            );
            observer.complete();
          } else {
            observer.error(
              new HttpErrorResponse({
                url: request.url,
                error: data,
                status,
                statusText,
                headers,
              })
            );
          }
        },
        fail: ({ errMsg }: WechatMiniprogram.GeneralCallbackResult) => {
          observer.error(
            new HttpErrorResponse({
              url: request.url,
              statusText: errMsg,
            })
          );
        },
        ...request.context.get(WX_REQUSET_TOKEN),
      });

      observer.next({ type: HttpEventType.Sent });

      if (request.reportProgress) {
        task.onHeadersReceived(onHeadersReceived);
      }

      return () => {
        if (request.reportProgress) {
          task.offHeadersReceived(onHeadersReceived);
        }

        task.abort();
      };
    });
  }

  private buildHeaders(request: HttpRequest<any>): { [key: string]: string } {
    return request.headers.keys().reduce((headers, name) => {
      headers[name] = request.headers.getAll(name)!.join(',');
      return headers;
    }, {} as { [key: string]: string });
  }
}
