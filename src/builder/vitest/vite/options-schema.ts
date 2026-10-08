/**
 * `vitest` builder 的选项形状（valibot）。
 *
 * 与 application 同一套路：一份形状负责生成 `schema.json`、入口解析（补默认值）与
 * TS 类型。测试产物也是一个完整小程序工程，所以 `platform` / `pages` / `appJson`
 * 这些同名选项直接复用 `sharedMpOptionFields`，两条链路不可能读出一份配置的两个版本。
 *
 * `port` / `clientHost` / `outputPath` 这里**不填默认值**：它们的缺省值分别由
 * `resolveMiniProgramVitestPluginOptions` 和「按项目名推导目录」的逻辑决定，
 * 在 schema 里再写一份就是两个真相源。
 */

import * as v from 'valibot';
import { formatIssues } from '../../util/valibot-issue';
import { sharedMpOptionFields } from '../../vite/options-schema';

export const vitestOptionsSchema = v.pipe(
  v.looseObject({
    main: v.pipe(
      v.string(),
      v.description(
        '测试引导入口（test.ts），里面调 startupMiniProgramTest()。',
      ),
    ),
    tsConfig: v.pipe(
      v.string(),
      v.description('The name of the TypeScript configuration file.'),
    ),
    outputPath: v.optional(
      v.pipe(
        v.string(),
        v.description(
          '测试产物输出目录（相对 workspaceRoot）。不填默认 dist/vitest/<project>；' +
            '不要指向 dist 根，emptyOutDir 会把应用产物一并删掉。',
        ),
      ),
    ),
    include: v.optional(
      v.pipe(
        v.array(v.string()),
        v.description(
          'spec 文件 glob，相对项目 sourceRoot。空数组按没传处理' +
            '（否则表现为 0 个 spec 全绿）。',
        ),
      ),
    ),
    exclude: v.optional(
      v.pipe(v.array(v.string()), v.description('spec 文件排除 glob。')),
      [],
    ),
    port: v.optional(
      v.pipe(
        v.number(),
        v.description(
          '回连宿主的 WebSocket 端口，默认 17900。必须和 vitest.config 里 ' +
            'miniProgramVitest({ port }) 完全一致，否则产物连 A、宿主在 B，永远连不上。',
        ),
      ),
    ),
    clientHost: v.optional(
      v.pipe(
        v.string(),
        v.description(
          '小程序内回连宿主的地址，默认 127.0.0.1（微信模拟器解不了 localhost）。' +
            '真机调试改成开发机局域网 IP。',
        ),
      ),
    ),
    sourceMap: v.optional(
      v.pipe(v.boolean(), v.description('Output source maps.')),
      true,
    ),
    ...sharedMpOptionFields,
    // 测试构建里这个字段同时是运行时 i18n 的开关，语义比 application 那边重，
    // 说明单独写一份（形状仍是 sharedMpOptionFields 里那个）
    polyfills: v.optional(
      v.pipe(
        v.union([v.array(v.string()), v.string()]),
        v.description(
          '声明 `@angular/localize`（或 `@angular/localize/init`）会让测试构建注入 ' +
            '`@angular/localize/init`，这是运行时 i18n 唯一的开关：不注入时 `$localize` ' +
            '是 core 的恒等实现，ICU 分支不解析，i18n spec 会直接看到 ' +
            '`{VAR_SELECT, select, ...}` 原文。',
        ),
      ),
    ),
  }),
  // 与 application 同理：angular.json 里写错选项名要当场失败，运行时那份保持宽松。
  v.metadata({ additionalProperties: false }),
);

/** angular.json 里写出来的形状（默认值还没补）。 */
export type MpVitestBuilderOptions = v.InferInput<typeof vitestOptionsSchema>;
/** `parseVitestBuilderOptions` 之后的形状：默认值已补齐。 */
export type ParsedVitestBuilderOptions = v.InferOutput<
  typeof vitestOptionsSchema
>;

/** 解析 vitest builder 的选项：补默认值，形状不对就把问题一次列全再抛。 */
export function parseVitestBuilderOptions(
  options: unknown,
): ParsedVitestBuilderOptions {
  const result = v.safeParse(vitestOptionsSchema, options);
  if (result.success) {
    return result.output;
  }
  throw new Error(
    `vitest 构建选项不合法：\n${formatIssues(result.issues, 'options').join('\n')}`,
  );
}
