/**
 * `library` builder 的选项形状（ng-packagr 链路）。
 *
 * 与 application 同一套路：形状写在这里，`script/gen-builder-schema.ts` 转成
 * `schema.json`。四个字段全是上游原样，本包没有独有项；builder 那边读的就是
 * devkit 补过默认值的 options，所以不再单独过一次 parse。
 */

import * as v from 'valibot';

export const libraryOptionsSchema = v.pipe(
  v.looseObject({
    project: v.pipe(
      v.string(),
      v.description(
        'The file path for the ng-packagr configuration file, relative to the current workspace.',
      ),
    ),
    tsConfig: v.optional(
      v.pipe(
        v.string(),
        v.description(
          'The full path for the TypeScript configuration file, relative to the current workspace.',
        ),
      ),
    ),
    watch: v.optional(
      v.pipe(v.boolean(), v.description('Run build when files change.')),
      false,
    ),
    poll: v.optional(
      v.pipe(
        v.number(),
        v.description(
          'Enable and define the file watching poll time period in milliseconds.',
        ),
      ),
    ),
  }),
  v.metadata({ additionalProperties: false }),
);

export type MpLibraryOptions = v.InferInput<typeof libraryOptionsSchema>;
