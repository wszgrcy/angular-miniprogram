/**
 * 宿主（vitest 进程）与小程序运行时之间的线协议。一条 WebSocket 上跑两类消息：
 *
 *  - 控制帧（`kind`）：握手、worker 就绪、错误。
 *  - vitest 帧（`frame`）：vitest 自己的 `WorkerRequest` / `WorkerResponse`，用 `flatted`
 *    序列化后原样透传。vitest 的 reporter 走的就是这套 RPC，所以标准 reporter 一字不改都能用。
 *
 * 不自造结果协议，只把 vitest 既有的 worker 协议换个传输层。
 * 协议版本 2：v1 每条帧带一个 `slot`（并发执行道编号）。一个小程序进程只有一条连接、一个常驻运行环境，
 * 编号永远恒为 0，分流字段就是噪声。v2 把它删干净。
 */

export const MP_VITEST_PROTOCOL_VERSION = 2 as const;

export const DEFAULT_MP_VITEST_PORT = 17_900;

export type MpVitestWireMessage =
  | {
      kind: 'hello';
      protocol: typeof MP_VITEST_PROTOCOL_VERSION;
      /** 小程序侧上报的平台，仅用于日志 */
      platform?: string;
    }
  | { kind: 'worker-ready' }
  | { kind: 'worker-message'; frame: string }
  | { kind: 'error'; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isMpVitestWireMessage(
  value: unknown,
): value is MpVitestWireMessage {
  if (!isRecord(value) || typeof value.kind !== 'string') {
    return false;
  }
  switch (value.kind) {
    case 'hello':
      return value.protocol === MP_VITEST_PROTOCOL_VERSION;
    case 'worker-ready':
      return true;
    case 'worker-message':
      return typeof value.frame === 'string';
    case 'error':
      return typeof value.message === 'string';
    default:
      return false;
  }
}
