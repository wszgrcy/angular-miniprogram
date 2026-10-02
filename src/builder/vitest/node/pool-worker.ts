import type { PoolTask, PoolWorker, WorkerRequest } from 'vitest/node';
import type { MiniProgramVitestSession } from './session';

type EventCallback = (argument: unknown) => void;

/**
 * 设备端那个常驻运行环境的 PoolWorker 代理。
 *
 * vitest 只认「worker 是个能 send/on 的双向通道」，不关心对端是子进程还是
 * 微信开发者工具里的小程序运行时 —— 这里就是把这条通道接到 WebSocket 上。
 */
export class MiniProgramPoolWorker implements PoolWorker {
  readonly name = 'miniprogram';
  readonly reportMemory = false;

  private readonly listeners = new Map<string, Set<EventCallback>>();
  private readonly unsubscribe: () => void;
  private stopped = false;

  constructor(private readonly session: MiniProgramVitestSession) {
    session.retain();
    this.unsubscribe = session.subscribe((message) => {
      this.emit('message', message);
    });
  }

  on(event: string, callback: EventCallback): void {
    let callbacks = this.listeners.get(event);
    if (!callbacks) {
      callbacks = new Set();
      this.listeners.set(event, callbacks);
    }
    callbacks.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    this.listeners.get(event)?.delete(callback);
  }

  deserialize(data: unknown): unknown {
    return data;
  }

  async start(): Promise<void> {
    await this.session.start();
  }

  async stop(): Promise<void> {
    if (this.stopped) {
      return;
    }
    this.stopped = true;
    this.unsubscribe();
    await this.session.release();
  }

  /**
   * 小程序端是常驻运行环境，换文件不用重建，
   * 复用可以省掉每次重开开发者工具的十几秒。
   */
  canReuse(_task: PoolTask): boolean {
    return true;
  }

  send(message: WorkerRequest): void {
    // `start` 的对端没有真实的 worker 进程可以回 `started`，
    // 这里就地补一个，否则 vitest 会一直等不到 worker 启动完成。
    if (message.type === 'start') {
      this.emit('message', {
        __vitest_worker_response__: true,
        type: 'started',
      });
    }
    void this.forwardWhenReady(message);
  }

  private async forwardWhenReady(message: WorkerRequest): Promise<void> {
    try {
      await this.session.start();
      await this.session.waitForWorker();
      this.session.send(message);
    } catch (error) {
      // 连不上也要给 vitest 一个收尾响应，否则整个 run 挂在 pending 上。
      this.emit('message', {
        __vitest_worker_response__: true,
        type: message.type === 'stop' ? 'stopped' : 'testfileFinished',
        error,
      });
    }
  }

  private emit(event: string, argument: unknown): void {
    this.listeners.get(event)?.forEach((callback) => callback(argument));
  }
}
