/// <reference types="miniprogram-api-typings" />

/**
 * 设备端的 WebSocket 传输。
 *
 * 小程序没有 `new WebSocket(url)`，只有 `wx.connectSocket` 返回的 SocketTask，
 * 事件名也不同（onOpen / onMessage / onError / onClose），
 * 所以这里抽一层极窄的接口，测试时可以直接塞假的进来。
 */
export interface MpSocketLike {
  send(options: {
    data: string;
    success?: () => void;
    fail?: (err: unknown) => void;
  }): unknown;
  close(options?: { code?: number; complete?: () => void }): unknown;
  onOpen?(handler: () => void): unknown;
  onMessage?(handler: (event: { data: string | ArrayBuffer }) => void): unknown;
  onError?(handler: (event: unknown) => void): unknown;
  onClose?(handler: (event: unknown) => void): unknown;
  /** 浏览器 / Node 风格的事件口，SocketTask 没有，给测试用 */
  addEventListener?(type: string, handler: (event: unknown) => void): void;
}

export interface MpTransportHandlers {
  onOpen(): void;
  onMessage(data: string): void;
  onClose(reason: string): void;
  onError(error: Error): void;
}

export type MpSocketFactory = (url: string) => MpSocketLike;

function defaultFactory(url: string): MpSocketLike {
  const api = (
    globalThis as unknown as {
      wx?: { connectSocket(options: { url: string }): MpSocketLike };
    }
  ).wx;
  if (!api?.connectSocket) {
    throw new Error(
      `找不到 wx.connectSocket，无法连回 vitest 宿主（url=${url}）`,
    );
  }
  return api.connectSocket({ url });
}

/**
 * 用 SocketTask 或任何兼容对象拼出一个统一的事件接口。
 *
 * SocketTask 的 onXxx 是「注册回调」而不是「addEventListener」，
 * 而且注册时机必须在 send 之前，否则首帧会丢 —— 这里在构造时就全挂上。
 */
export class MpTransport {
  private readonly socket: MpSocketLike;

  constructor(
    url: string,
    private readonly handlers: MpTransportHandlers,
    factory: MpSocketFactory = defaultFactory,
  ) {
    this.socket = factory(url);
    this.bind();
  }

  private bind(): void {
    const s = this.socket;
    if (typeof s.onOpen === 'function') {
      s.onOpen(() => this.handlers.onOpen());
      s.onMessage?.((event) => {
        const data = event.data;
        this.handlers.onMessage(
          typeof data === 'string' ? data : bufferToString(data),
        );
      });
      s.onError?.((event) => {
        this.handlers.onError(
          event instanceof Error
            ? event
            : new Error(`WebSocket 错误: ${JSON.stringify(event)}`),
        );
      });
      s.onClose?.(() => this.handlers.onClose('closed'));
      return;
    }
    if (typeof s.addEventListener === 'function') {
      s.addEventListener('open', () => this.handlers.onOpen());
      s.addEventListener('message', (event) => {
        const data = (event as { data?: string | ArrayBuffer }).data;
        this.handlers.onMessage(
          typeof data === 'string'
            ? data
            : bufferToString(data ?? new ArrayBuffer(0)),
        );
      });
      s.addEventListener('close', () => this.handlers.onClose('closed'));
      s.addEventListener('error', (event) =>
        this.handlers.onError(
          event instanceof Error ? event : new Error('WebSocket 错误'),
        ),
      );
      return;
    }
    throw new Error(
      '传输对象既没有 onOpen 也没有 addEventListener，无法收消息',
    );
  }

  send(payload: string): void {
    this.socket.send({ data: payload });
  }

  close(): void {
    this.socket.close({});
  }
}

function bufferToString(data: ArrayBuffer): string {
  const bytes = new Uint8Array(data);
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) {
    out += String.fromCharCode(bytes[i]);
  }
  // 只在小程序里用，中文等多字节由 JSON 侧的 escape 兜住
  return decodeURIComponent(
    encodeURIComponent(out).replace(/%([0-9A-F]{2})/g, (_, hex: string) =>
      String.fromCharCode(parseInt(hex, 16)),
    ),
  );
}

export function buildSocketUrl(host: string, port: number): string {
  return `ws://${host}:${port}`;
}
