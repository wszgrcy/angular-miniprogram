import {
  DEFAULT_MP_VITEST_PORT,
  MP_VITEST_PROTOCOL_VERSION,
} from '../protocol';

export interface MiniProgramVitestPluginOptions {
  /**
   * WebSocket 监听端口。必须和编译期 `define` 进产物的 `MP_VITEST_PORT`
   * 是同一个来源，否则小程序去连 A、宿主在 B，表现为永远连不上。
   */
  port?: number;
  /** 监听地址，默认 127.0.0.1。开发者工具在同机，不需要对外。 */
  host?: string;
  /** 等小程序连上来的毫秒数，默认 120_000（开发者工具冷启动慢）。 */
  connectTimeout?: number;
  /** 要跑的 spec，默认由 builder 生成。 */
  include?: string[];
  exclude?: string[];
}

export interface ResolvedMiniProgramVitestPluginOptions {
  port: number;
  host: string;
  connectTimeout: number;
  include?: string[];
  exclude?: string[];
}

export function resolveMiniProgramVitestPluginOptions(
  options: MiniProgramVitestPluginOptions = {},
): ResolvedMiniProgramVitestPluginOptions {
  return {
    port: options.port ?? DEFAULT_MP_VITEST_PORT,
    host: options.host ?? '127.0.0.1',
    connectTimeout: options.connectTimeout ?? 120_000,
    include: options.include,
    exclude: options.exclude,
  };
}

/** 编译期注入小程序产物的三个常量，宿主与设备共用同一份解析结果。 */
export function miniProgramVitestDefine(
  options: ResolvedMiniProgramVitestPluginOptions,
): Record<string, string> {
  return {
    MP_VITEST_PORT: JSON.stringify(options.port),
    MP_VITEST_HOST: JSON.stringify(options.host),
    MP_VITEST_PROTOCOL: JSON.stringify(MP_VITEST_PROTOCOL_VERSION),
  };
}
