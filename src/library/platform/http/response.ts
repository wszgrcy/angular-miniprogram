import { HttpHeaders, HttpResponse } from 'angular-miniprogram/common/http';

export class MiniProgramHttpResponse<T> extends HttpResponse<T> {
  /**
   * 开发者服务器返回的 cookies，格式为字符串数组
   */
  readonly cookies: string[] | null;
  /**
   * 网络请求过程中一些调试信息，[查看详细说明](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/network.html)
   */
  readonly profile: WechatMiniprogram.RequestProfile | null;

  /**
   * Construct a new `WxHttpResponse`.
   */
  constructor(
    init: {
      body?: T | null;
      headers?: HttpHeaders;
      status?: number;
      statusText?: string;
      url?: string;
      cookies?: string[];
      profile?: WechatMiniprogram.RequestProfile;
    } = {}
  ) {
    super(init);
    this.cookies = init.cookies ?? null;
    this.profile = init.profile ?? null;
  }

  clone(): MiniProgramHttpResponse<T>;
  clone(update: {
    headers?: HttpHeaders;
    status?: number;
    statusText?: string;
    url?: string;
    cookies?: string[];
    profile?: WechatMiniprogram.RequestProfile;
  }): MiniProgramHttpResponse<T>;
  clone<V>(update: {
    body?: V | null;
    headers?: HttpHeaders;
    status?: number;
    statusText?: string;
    url?: string;
    cookies?: string[];
    profile?: WechatMiniprogram.RequestProfile;
  }): MiniProgramHttpResponse<V>;
  clone(
    update: {
      body?: any | null;
      headers?: HttpHeaders;
      status?: number;
      statusText?: string;
      url?: string;
      cookies?: string[];
      profile?: WechatMiniprogram.RequestProfile;
    } = {}
  ): MiniProgramHttpResponse<any> {
    return new MiniProgramHttpResponse<any>({
      body: update.body !== undefined ? update.body : this.body,
      headers: update.headers || this.headers,
      status: update.status !== undefined ? update.status : this.status,
      statusText: update.statusText || this.statusText,
      url: update.url || this.url || undefined,
      cookies: update.cookies || this.cookies || undefined,
      profile: update.profile || this.profile || undefined,
    });
  }
}

export class MiniProgramHttpDownloadResponse<T> extends HttpResponse<T> {
  /** 用户文件路径 (本地路径)。传入 filePath 时会返回，跟传入的 filePath 一致 */
  readonly filePath: string | null;
  /** 临时文件路径 (本地路径)。没传入 filePath 指定文件存储路径时会返回，下载后的文件会存储到一个临时文件 */
  readonly tempFilePath: string | null;
  /**
   * 网络请求过程中一些调试信息，[查看详细说明](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/network.html)
   */
  readonly profile: WechatMiniprogram.RequestProfile | null;

  /**
   * Construct a new `WxHttpDownloadResponse`.
   */
  constructor(
    init: {
      body?: T | null;
      headers?: HttpHeaders;
      status?: number;
      statusText?: string;
      url?: string;
      filePath?: string;
      tempFilePath?: string;
      profile?: WechatMiniprogram.RequestProfile;
    } = {}
  ) {
    super(init);
    this.filePath = init.filePath ?? null;
    this.tempFilePath = init.tempFilePath ?? null;
    this.profile = init.profile ?? null;
  }

  clone(): MiniProgramHttpDownloadResponse<T>;
  clone(update: {
    headers?: HttpHeaders;
    status?: number;
    statusText?: string;
    url?: string;
    filePath?: string;
    tempFilePath?: string;
    profile?: WechatMiniprogram.RequestProfile;
  }): MiniProgramHttpDownloadResponse<T>;
  clone<V>(update: {
    body?: V | null;
    headers?: HttpHeaders;
    status?: number;
    statusText?: string;
    url?: string;
    filePath?: string;
    tempFilePath?: string;
    profile?: WechatMiniprogram.RequestProfile;
  }): MiniProgramHttpDownloadResponse<V>;
  clone(
    update: {
      body?: any | null;
      headers?: HttpHeaders;
      status?: number;
      statusText?: string;
      url?: string;
      filePath?: string;
      tempFilePath?: string;
      profile?: WechatMiniprogram.RequestProfile;
    } = {}
  ): MiniProgramHttpDownloadResponse<any> {
    return new MiniProgramHttpDownloadResponse<any>({
      body: update.body !== undefined ? update.body : this.body,
      headers: update.headers || this.headers,
      status: update.status !== undefined ? update.status : this.status,
      statusText: update.statusText || this.statusText,
      url: update.url || this.url || undefined,
      filePath: update.filePath || this.filePath || undefined,
      tempFilePath: update.tempFilePath || this.tempFilePath || undefined,
      profile: update.profile || this.profile || undefined,
    });
  }
}
