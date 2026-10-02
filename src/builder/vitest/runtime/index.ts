import { parse as flatParse, stringify as flatStringify } from 'flatted';
import {
  MP_VITEST_PROTOCOL_VERSION,
  type MpVitestWireMessage,
} from '../protocol';
import {
  type TestModuleMap,
  type TestModuleRegistry,
  createRequireContextRegistry,
  createTestModuleRegistry,
} from './registry';
import { type MpSocketFactory, MpTransport, buildSocketUrl } from './transport';
import { MiniProgramWorker } from './worker';

export interface StartupMiniProgramTestOptions {
  /**
   * spec 模块表：key 是构建期给的模块标识，value 是懒加载函数。
   * 宿主下发的是宿主机绝对路径，这里按后缀匹配，所以 key 用
   * `src/spec/foo.spec.ts` 这种相对形式即可。
   */
  modules?: TestModuleMap;
  /** 已经建好的注册表，给了它就忽略 modules */
  registry?: TestModuleRegistry;
  host?: string;
  port?: number;
  slot?: number;
  /** 覆盖 Socket 构造，测试或换平台时用 */
  createSocket?: MpSocketFactory;
  /** 连上之后是否自动发 hello，正常流程都要发 */
  autoHello?: boolean;
  log?(...args: unknown[]): void;
}

export interface MiniProgramTestSession {
  /** 传输层收到消息时调用 */
  onMessage(data: string): void;
  close(): void;
  readonly worker: MiniProgramWorker;
}

/**
 * 在小程序运行时里起一个 vitest worker。
 *
 * 由测试工程的引导入口（`test.ts`）调用，**必须在 app 启动之后**：
 * spec 里 `import` 的组件要能拿到已初始化的 Angular 运行时。
 *
 * 典型用法：
 *
 * ```ts
 * bootstrapApplication().then(() =>
 *   startupMiniProgramTest({
 *     modules: import.meta.glob('./**\/*.spec.ts'),
 *   }),
 * );
 * ```
 */
export function startupMiniProgramTest(
  options: StartupMiniProgramTestOptions = {},
): MiniProgramTestSession {
  const log =
    options.log ??
    ((...a: unknown[]) => {
      // eslint-disable-next-line no-console
      console.log(...a);
    });
  // 没显式传参时，退回 builder 的 define 注入的同名编译期常量。
  const g = globalThis as unknown as Record<string, unknown>;
  const host = options.host ?? (g['MP_VITEST_HOST'] as string) ?? '127.0.0.1';
  const port = options.port ?? (g['MP_VITEST_PORT'] as number) ?? 17900;
  const slot = options.slot ?? 0;

  const registry =
    options.registry ??
    (options.modules
      ? createTestModuleRegistry(options.modules)
      : createRequireContextRegistry(
          // 没有显式给模块表时，退回 require.context 形态（本仓库既有机制）
          (globalThis as unknown as { __MP_VITEST_CONTEXT__?: never })
            .__MP_VITEST_CONTEXT__!,
        ));

  const url = buildSocketUrl(String(host), Number(port));
  const workerRef: { current?: MiniProgramWorker } = {};

  const transport = new MpTransport(
    url,
    {
      onOpen: () => {
        log(`[vitest] 已连上宿主 ${url}`);
        if (options.autoHello !== false) {
          send({
            kind: 'hello',
            protocol: MP_VITEST_PROTOCOL_VERSION,
            platform: platformName(),
          });
        }
        send({ kind: 'worker-ready', slot });
      },
      onMessage: (data) => session.onMessage(data),
      onClose: (reason) => log(`[vitest] 连接断开：${reason}`),
      onError: (error) => log(`[vitest] 连接错误：${error.message}`),
    },
    options.createSocket,
  );

  function send(message: MpVitestWireMessage): void {
    transport.send(JSON.stringify(message));
  }

  /**
   * worker 的一帧（WorkerRequest / WorkerResponse / RPC）必须套信封。
   *
   * 宿主那边 `session.onMessage` 是先 JSON.parse 看 `kind` 分流的，
   * 裸帧没有 `kind`，不套信封会被整条丢掉 —— 表现是小程序里
   * spec 明明跑了、宿主 reporter 一条结果都收不到。
   */
  function sendFrame(payload: unknown): void {
    send({
      kind: 'worker-message',
      slot,
      frame: flatStringify(payload),
    });
  }

  const worker = new MiniProgramWorker({
    sendFrame,
    registry,
    slot,
    onFileFinished: (filepath) => log(`[vitest] 完成 ${filepath}`),
  });
  workerRef.current = worker;

  const session: MiniProgramTestSession = {
    worker,
    onMessage(data: string): void {
      let envelope: unknown;
      try {
        envelope = JSON.parse(data);
      } catch {
        log('[vitest] 收到非 JSON 帧，忽略');
        return;
      }
      // 下行同样带信封，拆出内层 flatted 帧再分流。
      const frameText = (envelope as { frame?: unknown })?.frame;
      if (typeof frameText !== 'string') {
        return;
      }
      let parsed: unknown;
      try {
        parsed = flatParse(frameText);
      } catch {
        log('[vitest] worker-message 帧不是合法 flatted，忽略');
        return;
      }
      // worker 请求走 handle，其余（RPC 反向调用）走 birpc。
      if (
        (parsed as { __vitest_worker_request__?: unknown })
          .__vitest_worker_request__ === true
      ) {
        void worker
          .handle(parsed as never)
          .catch((error: unknown) =>
            worker.reportError(
              `处理 worker 请求失败：${(error as Error)?.message ?? error}`,
            ),
          );
        return;
      }
      worker.feedRpc(parsed);
    },
    close: () => transport.close(),
  };

  return session;
}

function platformName(): string {
  const info = (
    globalThis as unknown as {
      wx?: { getSystemInfoSync?(): { host?: { name?: string } } };
    }
  ).wx;
  try {
    return info?.getSystemInfoSync?.()?.host?.name ?? 'miniprogram';
  } catch {
    return 'miniprogram';
  }
}

export {
  createRequireContextRegistry,
  createTestModuleRegistry,
  type TestModuleMap,
  type TestModuleRegistry,
} from './registry';
export { MiniProgramTestRunner } from './runner';
export { MiniProgramWorker } from './worker';
export {
  MpTransport,
  buildSocketUrl,
  type MpSocketFactory,
  type MpSocketLike,
} from './transport';
