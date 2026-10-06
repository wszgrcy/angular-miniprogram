import { parse as flatParse, stringify as flatStringify } from 'flatted';
import {
  DEFAULT_MP_VITEST_PORT,
  MP_VITEST_PROTOCOL_VERSION,
  type MpVitestWireMessage,
} from '../protocol';
// 必须排在 ./worker 前面：本模块的副作用要给后面的 vitest chunk 铺好全局能力。
import { installMiniProgramGlobals } from './global-polyfills';
import { type TestModuleMap, createTestModuleRegistry } from './registry';
import {
  type MpSocketFactory,
  MpTransport,
  buildSocketUrl,
  hostWx,
} from './transport';
import { MiniProgramWorker } from './worker';

export interface StartupMiniProgramTestOptions {
  /**
   * spec 模块表：key 是构建期给的相对短名（`spec/foo/bar.spec.ts`），value 是懒加载函数。
   * 宿主下发的是宿主机上的绝对路径，这里按后缀匹配。
   */
  modules: TestModuleMap;
  host?: string;
  port?: number;
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
 * 在小程序运行时里起一个 vitest worker。由测试工程的引导入口（`test.ts`）调用，
 * 必须在 app 启动之后：spec 里 `import` 的组件要能拿到已初始化的 Angular 运行时。
 *
 * ```ts
 * declare const __MP_SPEC_MODULES__: TestModuleMap;
 * bootstrapApplication().then(() => startupMiniProgramTest({ modules: __MP_SPEC_MODULES__ }));
 * ```
 *
 * 不能在这里 `import.meta.glob`：spec 走的是 Angular 自己的编译，vite 的 transform 不作用于它。
 */
export function startupMiniProgramTest(
  options: StartupMiniProgramTestOptions,
): MiniProgramTestSession {
  // 先补全局：后面 `config.globals` 动态拉进来的 chunk 在加载时就要求 EventTarget 存在，等不到第一个 spec。
  installMiniProgramGlobals();

  const log =
    options.log ??
    ((...a: unknown[]) => {
      // eslint-disable-next-line no-console
      console.log(...a);
    });
  // 没显式传参时，退回 builder 的 define 注入的同名编译期常量。
  const host = options.host ?? definedHost() ?? '127.0.0.1';
  const port = options.port ?? definedPort() ?? DEFAULT_MP_VITEST_PORT;

  const registry = createTestModuleRegistry(options.modules);

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
        send({ kind: 'worker-ready' });
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
   * 宿主那边是先 JSON.parse 看 `kind` 分流的，裸帧没有 `kind`，不套信封会被整条丢掉。
   */
  function sendFrame(payload: unknown): void {
    send({
      kind: 'worker-message',
      frame: flatStringify(payload),
    });
  }

  const worker = new MiniProgramWorker({
    sendFrame,
    registry,
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
  const info = hostWx();
  try {
    return info?.getSystemInfoSync?.()?.host?.name ?? 'miniprogram';
  } catch {
    return 'miniprogram';
  }
}

/**
 * builder 用 vite `define` 注进来的编译期常量。只能拿裸标识符：`globalThis['MP_VITEST_PORT']`
 * 不会被 define 替换，而 `globalThis` 在小程序产物里又指向 app.js 自建的普通对象，
 * 最后就是静默用掉写死的默认值。`typeof` 包一层是为了让没带 define 的场合不抛 ReferenceError。
 */
declare const MP_VITEST_HOST: string | undefined;
declare const MP_VITEST_PORT: number | undefined;

function definedHost(): string | undefined {
  return typeof MP_VITEST_HOST === 'string' ? MP_VITEST_HOST : undefined;
}
function definedPort(): number | undefined {
  return typeof MP_VITEST_PORT === 'number' ? MP_VITEST_PORT : undefined;
}

export {
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
