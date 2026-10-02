import { parse as flatParse, stringify as flatStringify } from 'flatted';
import { type RawData, WebSocket, WebSocketServer } from 'ws';
import { type MpVitestWireMessage, isMpVitestWireMessage } from '../protocol';
import type { ResolvedMiniProgramVitestPluginOptions } from './options';

type MessageListener = (message: unknown) => void;

/**
 * 一个 slot 的「已就绪」信号。小程序侧每个 worker 起来后发 `worker-ready`，
 * 在那之前宿主下发的 `WorkerRequest` 必须排队，否则第一帧 `start` 会丢。
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
 * 宿主侧的 WebSocket 会话。
 *
 * 引用计数：一个 slot 一个 pool worker，全部 worker stop 后才关服务，
 * 否则先结束的 worker 会把还在跑的同事的连接掐了。
 */
export class MiniProgramVitestSession {
  private server: WebSocketServer | undefined;
  private socket: WebSocket | undefined;
  private startPromise: Promise<void> | undefined;
  private references = 0;
  private readonly ready = new Map<number, ReadyDeferred>();
  private readonly readySlots = new Set<number>();
  private readonly listeners = new Map<number, Set<MessageListener>>();
  private readonly socketOpen = createDeferred();

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
      const server = new WebSocketServer({ host, port });
      this.server = server;
      server.once('error', (err) => {
        reject(
          new Error(
            `监听 ${host}:${port} 失败：${err.message}。` +
              '端口被占就换个 port，注意产物里的 MP_VITEST_PORT 要一起变。',
          ),
        );
      });
      server.once('listening', () => resolve());
      server.on('connection', (socket) => this.onConnection(socket));
    });
  }

  private onConnection(socket: WebSocket): void {
    // 小程序一个进程只有一条连接；后来者顶掉前一个，
    // 免得开发者工具重编译后新旧两条并存、结果串台。
    this.socket?.close();
    this.socket = socket;
    socket.on('message', (data) => this.onMessage(rawToString(data)));
    socket.once('close', () => {
      if (this.socket === socket) {
        this.socket = undefined;
        this.readySlots.clear();
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
    if (!isMpVitestWireMessage(parsed)) {
      return;
    }
    switch (parsed.kind) {
      case 'hello':
        this.emit('hello', parsed);
        break;
      case 'worker-ready': {
        this.readySlots.add(parsed.slot);
        this.getReady(parsed.slot).resolve();
        break;
      }
      case 'worker-message': {
        let frame: unknown;
        try {
          // frame 是 flatted 字符串，外层再套一层 JSON，
          // 这样控制帧能用最朴素的 JSON.parse 分流。
          frame = flatParse(parsed.frame);
        } catch {
          break;
        }
        this.listeners.get(parsed.slot)?.forEach((cb) => cb(frame));
        break;
      }
      case 'error':
        this.emit('error', new Error(parsed.message));
        break;
    }
  }

  private readonly channelListeners = new Map<string, Set<MessageListener>>();

  private emit(name: string, payload: unknown): void {
    this.channelListeners.get(name)?.forEach((cb) => cb(payload));
  }

  on(name: 'hello' | 'error', listener: (payload: never) => void): () => void {
    let set = this.channelListeners.get(name);
    if (!set) {
      set = new Set();
      this.channelListeners.set(name, set);
    }
    set.add(listener as MessageListener);
    return () => set?.delete(listener as MessageListener);
  }

  private getReady(slot: number): ReadyDeferred {
    let deferred = this.ready.get(slot);
    if (!deferred) {
      deferred = createDeferred();
      this.ready.set(slot, deferred);
    }
    return deferred;
  }

  /** 等某个 slot 的小程序 worker 上线。 */
  async waitForWorker(slot: number): Promise<void> {
    if (this.readySlots.has(slot)) {
      return;
    }
    await this.start();
    const deferred = this.getReady(slot);
    const { connectTimeout } = this.options;
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(
          new Error(
            `slot ${slot} 在 ${connectTimeout}ms 内没连上来。` +
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
          reject(err);
        },
      );
    });
  }

  send(slot: number, message: unknown): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('小程序端未连接，无法下发 vitest 指令');
    }
    const frame: MpVitestWireMessage = {
      kind: 'worker-message',
      slot,
      frame: flatStringify(message),
    };
    this.socket.send(JSON.stringify(frame));
  }

  subscribe(slot: number, listener: MessageListener): () => void {
    let set = this.listeners.get(slot);
    if (!set) {
      set = new Set();
      this.listeners.set(slot, set);
    }
    set.add(listener);
    return () => set?.delete(listener);
  }

  private async close(): Promise<void> {
    this.readySlots.clear();
    this.ready.clear();
    this.socket?.close();
    this.socket = undefined;
    this.startPromise = undefined;
    const server = this.server;
    this.server = undefined;
    await new Promise<void>((resolve) => {
      if (!server) {
        resolve();
        return;
      }
      server.close(() => resolve());
    });
  }
}
