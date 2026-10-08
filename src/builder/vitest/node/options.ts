import * as v from 'valibot';
import {
  DEFAULT_MP_VITEST_PORT,
  MP_VITEST_PROTOCOL_VERSION,
} from '../protocol';

/**
 * `miniProgramVitest()` 的选项形状。这里没有 JSON Schema 消费者，valibot 负责的是
 * 「默认值只写一处」和「vitest.config 里配错类型当场报错」，而不是补全。
 */
const pluginOptionsSchema = v.looseObject({
  // 必须和编译期 define 进产物的 MP_VITEST_PORT 同一个来源，
  // 否则小程序去连 A、宿主在 B，表现为永远连不上
  port: v.optional(v.number(), DEFAULT_MP_VITEST_PORT),
  // 开发者工具在同机，不需要对外
  host: v.optional(v.string(), '127.0.0.1'),
  // 开发者工具冷启动慢，等得久一点
  connectTimeout: v.optional(v.number(), 120_000),
  // 缺省由 builder 生成
  include: v.optional(v.array(v.string())),
  exclude: v.optional(v.array(v.string())),
});

export type MiniProgramVitestPluginOptions = v.InferInput<
  typeof pluginOptionsSchema
>;
/** 补齐默认值之后的形状。 */
export type ResolvedMiniProgramVitestPluginOptions = v.InferOutput<
  typeof pluginOptionsSchema
>;

export function resolveMiniProgramVitestPluginOptions(
  options: MiniProgramVitestPluginOptions = {},
): ResolvedMiniProgramVitestPluginOptions {
  return v.parse(pluginOptionsSchema, options);
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
