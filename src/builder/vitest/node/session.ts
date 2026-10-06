import { parse as flatParse, stringify as flatStringify } from 'flatted';
import { createServer } from 'http';
import { type RawData, WebSocket, WebSocketServer } from 'ws';
import {
  MP_VITEST_PROTOCOL_VERSION,
  type MpVitestWireMessage,
  isMpVitestWireMessage,
} from '../protocol';
import { tryServeFixture } from './fixture-server';
import type { ResolvedMiniProgramVitestPluginOptions } from './options';

type MessageListener = (message: unknown) => void;

/**
 * 小程序 worker 的「已就绪」信号。设备端 worker 起来后发 `worker-ready`，在那之前宿主下发的
 * `WorkerRequest` 必须排队，否则第一帧 `start` 会丢。
 */
interface ReadyDeferred {
  promise: Promise<void>;
  resolve: () => void;
}

function createDeferred(): ReadyDeferred {
  let resolveReady: (() => void) | undefined;
  const promise = new Promise<void>((resolve) => {
    resolveReady = resolve;
  });
  return { promise, resolve: () => resolveReady?.() };
}

function rawToString(data: RawData): string {
  if (Array.isArray(data)) {
    return Buffer.concat(data).toString('utf8');
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString('utf8');
  }
  return data.toString('utf8');
}

/**
 * 宿主侧的 WebSocket 会话。只有一个 worker、只有一条连接：小程序一个 appservice 进程就一个常驻
 * 运行环境，`onConnection` 还是「后来者顶掉前一个」，所以上面不需要任何分流／编号。
 * 引用计数：每个 pool worker 引用一次，全部 stop 后才关服务，否则先结束的会把还在跑的同事的连接掐了。
 */
export class MiniProgramVitestSession {
  private server: WebSocketServer | undefined;
  private httpServer: ReturnType<typeof createServer> | undefined;
  private socket: WebSocket | undefined;
  private startPromise: Promise<void> | undefined;
  private references = 0;
  private workerReady = false;
  private ready: ReadyDeferred = createDeferred();
  private readonly listeners = new Set<MessageListener>();

  constructor(
    private readonly options: ResolvedMiniProgramVitestPluginOptions,
  ) {}

  retain(): void {
    this.references += 1;
  }

  async release(): Promise<void> {
    this.references = Math.max(0, this.references - 1);
    if (this.references === 0) {
      await this.close();
    }
  }

  start(): Promise<void> {
    this.startPromise ??= this.listen();
    return this.startPromise;
  }

  private listen(): Promise<void> {
    const { port, host } = this.options;
    return new Promise((resolve, reject) => {
      /**
       * HTTP 和 WS 共用同一个端口：upgrade 请求走 WS，普通请求走 fixture。
       * http spec 要的是真 `wx.request`，得有个真 HTTP 端点；另起一个端口就得再维护一份常量，
       * 两边飘了就是「连得上但请求 404」这种难查的坑。
       */
      const httpServer = createServer((req, res) => {
        if (tryServeFixture(req, res)) {
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('angular-miniprogram vitest host');
      });
      this.httpServer = httpServer;
      const server = new WebSocketServer({ server: httpServer });
      this.server = server;
      httpServer.once('error', (err) => {
        reject(
          new Error(
            `监听 ${host}:${port} 失败：${err.message}。` +
              '端口被占就换个 port，注意产物里的 MP_VITEST_PORT 要一起变。',
          ),
        );
      });
      httpServer.once('listening', () => {
        // 给外部启动器当 ready 信号用（见 script/wechat-vitest.cjs）。没这行的话脚本只能 sleep 一个固定时长去赌服务已绑上。
        process.stdout.write(
          `[mp-vitest] 已监听 ws://${host}:${port}，等设备连入\n`,
        );
        resolve();
      });
      httpServer.listen({ host, port });
      server.on('connection', (socket) => this.onConnection(socket));
    });
  }

  private onConnection(socket: WebSocket): void {
    // 小程序一个进程只有一条连接；后来者顶掉前一个，免得开发者工具重编译后新旧两条并存、结果串台。
    this.socket?.close();
    this.socket = socket;
    socket.on('message', (data) => this.onMessage(rawToString(data)));
    socket.once('close', () => {
      if (this.socket === socket) {
        this.socket = undefined;
        this.workerReady = false;
        // 重连后得重新等一次 worker-ready，旧的 deferred 已经 resolve 了。
        this.ready = createDeferred();
      }
    });
    socket.once('error', () => {
      /* close 会跟着来，错误在 close 分支统一收敛 */
    });
  }

  private onMessage(raw: string): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }
    // 协议对不上要当场说清楚：否则 hello 会被下面的校验静默丢掉，表现是「设备根本没连上」，而真原因只是产物是旧版编的。
    const hello = parsed as { kind?: string; protocol?: unknown } | null;
    if (
      hello?.kind === 'hello' &&
      hello.protocol !== MP_VITEST_PROTOCOL_VERSION
    ) {
      process.stderr.write(
        `[mp-vitest] 协议版本不匹配：设备端 ${String(hello.protocol)}，宿主 ${MP_VITEST_PROTOCOL_VERSION}。` +
          '重新构建测试产物（ng run app:test）。\n',
      );
      return;
    }
    if (!isMpVitestWireMessage(parsed)) {
      return;
    }
    switch (parsed.kind) {
      case 'hello':
        // 给外部启动器当「设备真连上了」的信号（见 script/wechat-vitest.cjs）。没这行脚本只能区分「已监听」和「跑完了」，
        // 中间那段黑盒只能拿长超时去赌。
        process.stdout.write('[mp-vitest] 设备已连接\n');
        break;
      case 'worker-ready': {
        this.workerReady = true;
        this.ready.resolve();
        break;
      }
      case 'worker-message': {
        let frame: unknown;
        try {
          // frame 是 flatted 字符串，外层再套一层 JSON，这样控制帧能用最朴素的 JSON.parse 分流。
          frame = flatParse(parsed.frame);
        } catch {
          break;
        }
        this.listeners.forEach((cb) => cb(frame));
        break;
      }
      case 'error':
        process.stderr.write(`[mp-vitest] 设备报错：${parsed.message}\n`);
        break;
    }
  }

  /** 等设备端 worker 上线。 */
  async waitForWorker(): Promise<void> {
    if (this.workerReady) {
      return;
    }
    await this.start();
    const deferred = this.ready;
    const { connectTimeout } = this.options;
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(
          new Error(
            `小程序在 ${connectTimeout}ms 内没连上来。` +
              '确认微信开发者工具已打开构建产物目录，且 project.config.json 允许 ws 连接。',
          ),
        );
      }, connectTimeout);
      timer.unref?.();
      void deferred.promise.then(
        () => {
          clearTimeout(timer);
          resolve();
        },
        (err: unknown) => {
          clearTimeout(timer);
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject(err);
        },
      );
    });
  }

  send(message: unknown): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('小程序端未连接，无法下发 vitest 指令');
    }
    const frame: MpVitestWireMessage = {
      kind: 'worker-message',
      frame: flatStringify(message),
    };
    this.socket.send(JSON.stringify(frame));
  }

  subscribe(listener: MessageListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private async close(): Promise<void> {
    this.workerReady = false;
    this.ready = createDeferred();
    this.listeners.clear();
    this.socket?.close();
    this.socket = undefined;
    this.startPromise = undefined;
    const server = this.server;
    this.server = undefined;
    const httpServer = this.httpServer;
    this.httpServer = undefined;
    await new Promise<void>((resolve) => {
      if (!server) {
        resolve();
        return;
      }
      server.close(() => {
        // WS 挂在 httpServer 上，光关 WS 不关 HTTP 会把端口留着。
        if (!httpServer) {
          resolve();
          return;
        }
        httpServer.close(() => resolve());
      });
    });
  }
}
