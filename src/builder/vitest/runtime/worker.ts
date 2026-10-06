import { createBirpc } from 'birpc';
import { EvaluatedModules } from 'vite/module-runner';
import type {
  CancelReason,
  RunnerRPC,
  RuntimeRPC,
  VitestTestRunner,
  WorkerGlobalState,
} from 'vitest';
import {
  collectTests,
  setupCommonEnv,
  startTests,
} from 'vitest/internal/browser';
import type { WorkerRequest, WorkerResponse } from 'vitest/node';
import type { TestModuleRegistry } from './registry';
import { MiniProgramTestRunner } from './runner';
/**
 * 把一帧 payload 发给宿主。信封（kind / frame）由调用方拼，
 * worker 不操心传输层长什么样。
 */
export type MpSendFrame = (payload: unknown) => void;

/** vitest 用它读当前 worker 状态，必须挂在 globalThis 上。 */
const NAME_WORKER_STATE = '__vitest_worker__';

export interface MiniProgramWorkerOptions {
  sendFrame: MpSendFrame;
  registry: TestModuleRegistry;
  /** 每条 spec 跑完后的回调，用于日志 */
  onFileFinished?(filepath: string): void;
}

/**
 * CancelReason 的联合里那条 `(string & Record<never, never>)` 兜底分支
 * 不接受字面量，只能显式断言。语义就是「宿主主动取消」。
 */
const HOST_CANCEL_REASON = 'miniprogram-host-cancel' as CancelReason;

function serializeError(error: unknown): unknown {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      // Error.cause 要 lib >= es2022，本 tsconfig 是 es2021，这里按形状取。
      cause: (error as unknown as { cause?: unknown }).cause,
    };
  }
  return error;
}

/**
 * 设备端的 worker：把 WebSocket 当成 vitest 的 worker 通道。
 *
 * vitest 的宿主 ↔ worker 协议是一对 `WorkerRequest` / `WorkerResponse`，
 * 中间再套一层 birpc 做双向 RPC（`onTaskUpdate` / `onConsoleLog` 等
 * 都由 RPC 反向调用）。只要这两层接上，reporter 完全不知道对端是小程序。
 */
export class MiniProgramWorker {
  private readonly rpc: ReturnType<typeof createBirpc<RuntimeRPC, RunnerRPC>>;
  private readonly rpcHandlers = new Set<(message: unknown) => void>();
  private readonly cancelListeners = new Set<
    (reason: CancelReason) => unknown
  >();
  private readonly cleanupListeners = new Set<() => unknown>();
  private startContext: Extract<WorkerRequest, { type: 'start' }> | undefined;
  private running = false;

  constructor(private readonly options: MiniProgramWorkerOptions) {
    this.rpc = createBirpc<RuntimeRPC, RunnerRPC>(
      {
        // 设备端能响应的反向调用极少，取消是唯一一个必须实现的：
        // 不实现的话宿主发 cancel 会一直等超时。
        onCancel: async (reason: CancelReason) => {
          for (const listener of this.cancelListeners) {
            await listener(reason);
          }
        },
      },
      {
        eventNames: ['onCancel'],
        timeout: -1,
        post: (message) => this.options.sendFrame(message),
        on: (handler) => this.rpcHandlers.add(handler as (m: unknown) => void),
        off: (handler) =>
          this.rpcHandlers.delete(handler as (m: unknown) => void),
      },
    );
  }

  /** 传输层收到一条消息时调用；返回 true 表示这条是 RPC 帧，已被消费。 */
  feedRpc(message: unknown): boolean {
    if (!this.looksLikeRpc(message)) {
      return false;
    }
    for (const handler of this.rpcHandlers) {
      handler(message);
    }
    return true;
  }

  /**
   * birpc 帧没有显式标记，只能靠形状区分：
   * worker 请求带 `__vitest_worker_request__`，其余都交给 birpc。
   */
  private looksLikeRpc(message: unknown): boolean {
    return (
      typeof message === 'object' &&
      message !== null &&
      (message as { __vitest_worker_request__?: unknown })
        .__vitest_worker_request__ !== true
    );
  }

  private respond(response: WorkerResponse): void {
    this.options.sendFrame(response);
  }

  async handle(message: WorkerRequest): Promise<void> {
    switch (message.type) {
      case 'start':
        this.startContext = message;
        this.respond({ __vitest_worker_response__: true, type: 'started' });
        return;
      case 'run':
      case 'collect':
        await this.execute(message.type, message.context);
        return;
      case 'cancel':
        for (const listener of this.cancelListeners) {
          await listener(HOST_CANCEL_REASON);
        }
        return;
      case 'stop':
        for (const listener of this.cleanupListeners) {
          await listener();
        }
        this.respond({ __vitest_worker_response__: true, type: 'stopped' });
        return;
    }
  }

  private async execute(
    method: 'run' | 'collect',
    context: Extract<WorkerRequest, { type: 'run' }>['context'],
  ): Promise<void> {
    if (!this.startContext) {
      throw new Error('收到 run/collect 之前必须先收到 start');
    }
    if (this.running) {
      throw new Error('上一个文件还没跑完就收到新的 run 请求');
    }
    this.running = true;
    const state = this.createState(context);
    (globalThis as Record<string, unknown>)[NAME_WORKER_STATE] = state;
    try {
      // 装 vitest 的运行期全局（expect 的 global state、fake timers 依赖等）。
      // Node worker 由 pool 负责，设备端得自己调。
      await setupCommonEnv(this.startContext.context.config);
      const runner: VitestTestRunner = new MiniProgramTestRunner({
        config: this.startContext.context.config,
        registry: this.options.registry,
        onTaskUpdate: async (packs, events) => {
          await this.rpc.onTaskUpdate(packs, events);
        },
        // Node worker 这些是 vitest 的 resolveTestRunner 包的，自定义 runner
        // 得自己调；少了 onCollected 宿主就认不得任务 id。
        onQueued: (file) => {
          // birpc 把每个方法都包成 Promise，发完不等（宿主那边是 fire-and-forget）。
          void this.rpc.onQueued(file);
        },
        onCollected: (files) => this.rpc.onCollected(files),
        onFileFinished: (filepath) => {
          this.options.onFileFinished?.(filepath);
        },
      });
      if (method === 'run') {
        await startTests(context.files, runner);
      } else {
        await collectTests(context.files, runner);
      }
    } finally {
      this.running = false;
      this.respond({
        __vitest_worker_response__: true,
        type: 'testfileFinished',
      });
    }
  }

  private createState(
    context: Extract<WorkerRequest, { type: 'run' }>['context'],
  ): WorkerGlobalState {
    const start = this.startContext!;
    const config = start.context.config;
    const cleanups: Array<() => unknown> = [];
    return {
      ctx: {
        pool: start.context.pool,
        projectName: context.providedContext?.['__vitest_project_name'] ?? '',
        config,
        environment: start.context.environment,
        rpc: this.rpc,
        metaEnv: {},
        files: context.files,
        providedContext: context.providedContext,
        invalidates: context.invalidates,
        workerId: context.workerId,
        concurrencyId: context.workerId,
      },
      config,
      rpc: this.rpc,
      metaEnv: {},
      // 小程序没有 jsdom / happy-dom，环境就是小程序自己那套全局。
      environment: { name: context.environment.name, options: null } as never,
      evaluatedModules: new EvaluatedModules(),
      resolvingModules: new Set<string>(),
      moduleExecutionInfo: new Map<string, unknown>(),
      durations: { environment: 0, prepare: 0, fetch: 0 },
      providedContext: context.providedContext,
      onCancel: (listener: (reason: CancelReason) => unknown) => {
        this.cancelListeners.add(listener);
        return () => this.cancelListeners.delete(listener);
      },
      onCleanup: (listener: () => unknown) => {
        this.cleanupListeners.add(listener);
        cleanups.push(listener);
      },
      onFilterStackTrace: (stack: string) => stack,
    } as unknown as WorkerGlobalState;
  }

  /** 把内部错误上报给宿主，避免小程序里静默失败。 */
  reportError(message: string): void {
    void this.rpc.onUnhandledError(
      serializeError(new Error(message)),
      'miniprogram-worker',
    );
  }
}
