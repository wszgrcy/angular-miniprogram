/**
 * `application` builder 的选项形状（valibot）。一份形状三个用途，彼此不可能分叉：
 *
 *   1. `script/gen-builder-schema.ts` 转成 `schema.json` —— angular.json 的补全与校验；
 *   2. `parseApplicationOptions` 在 builder 入口跑一遍 —— 补默认值、把形状问题当场报出来；
 *   3. 选项的 TS 类型（`MpApplicationOptions` / `ParsedApplicationOptions`）。
 *
 * 对象一律 `looseObject`。上游那些 `additionalProperties: false` 会误伤：
 * `stylePreprocessorOptions.sass` 只列了三个 sass 选项，其余合法 sass 选项会被判非法，
 * 而我们本来是整个透传给 sass 的。而且构建器手上那份是 devkit 校验并补过默认值的成品，
 * 键比这里声明的多是常态，运行时再收紧一次只会误报。
 *
 * 唯一保留的严格项是根对象的 `additionalProperties: false`（见 `applicationOptionsSchema`
 * 末尾的 metadata）：angular.json 里把选项名写错必须当场失败，而不是配了没反应。
 *
 * 写法约定：说明统一 `v.pipe(形状, v.description(...))`，转换器才会把它变成 JSON Schema 的
 * description；默认值统一 `v.optional(形状, 默认值)`，它同时是 parse 的补值来源和
 * JSON Schema 的 `default`，所以 builder 内部不必再 `?? 默认值` 一遍。
 */

import * as v from 'valibot';
import { PlatformType } from '../platform/platform';
import { formatIssues } from '../util/valibot-issue';

/** `platform` 的合法值直接取自平台注册表，不在这里手抄一遍。 */
const PLATFORMS = Object.values(PlatformType).filter(
  (value) => value !== PlatformType.library,
);

/** 上游 `#/definitions/fileReplacement` 的 pattern，原样沿用。 */
const SOURCE_FILE_PATTERN = /\.(([cm]?[jt])sx?|json)$/;
/** 上游 styles 的 pattern：只认这四种样式语言。 */
const STYLE_FILE_PATTERN = /\.(?:css|scss|sass|less)$/;

/** 资源条目：对象写法或纯字符串（等价于 `{glob, input}` 的简写）。 */
export const assetPatternSchema = v.union([
  v.looseObject({
    followSymlinks: v.optional(
      v.pipe(
        v.boolean(),
        v.description(
          'Allow glob patterns to follow symlink directories. This allows subdirectories of the symlink to be searched.',
        ),
      ),
      false,
    ),
    glob: v.pipe(v.string(), v.description('The pattern to match.')),
    input: v.pipe(
      v.string(),
      v.description(
        "The input directory path in which to apply 'glob'. Defaults to the project root.",
      ),
    ),
    ignore: v.optional(
      v.pipe(
        v.array(v.string()),
        v.description('An array of globs to ignore.'),
      ),
    ),
    output: v.optional(
      v.pipe(v.string(), v.description('Absolute path within the output.')),
      '',
    ),
  }),
  v.string(),
]);

/** 分包入口：写法与 `pages` 一样，`output` 就是分包 root。 */
export const subpackagePatternSchema = v.looseObject({
  glob: v.pipe(v.string(), v.description('匹配入口文件的 glob')),
  input: v.pipe(v.string(), v.description('源目录')),
  output: v.pipe(v.string(), v.description('分包 root（同时是产物目录）')),
  ignore: v.optional(
    v.pipe(v.array(v.string()), v.description('An array of globs to ignore.')),
  ),
  independent: v.optional(
    v.pipe(v.boolean(), v.description('独立分包：不依赖主包即可运行')),
  ),
});

/** 文件替换。两侧都必须是源码文件，路径写错由 `toAbsoluteFileReplacements` 兜底。 */
export const fileReplacementSchema = v.looseObject({
  replace: v.pipe(v.string(), v.regex(SOURCE_FILE_PATTERN)),
  with: v.pipe(v.string(), v.regex(SOURCE_FILE_PATTERN)),
});

const BUDGET_TYPES = [
  'all',
  'allScript',
  'any',
  'anyScript',
  'anyComponentStyle',
  'bundle',
  'initial',
] as const;

/**
 * 体积预算条目。`type` 在 @angular/build 那边是同名 string enum，这里用字面量：
 * 两边值一致但类型互不相认，只在交给它的实现时转一次（见 budgets.plugin）。
 */
export const budgetSchema = v.looseObject({
  type: v.pipe(v.picklist(BUDGET_TYPES), v.description('The type of budget.')),
  name: v.optional(
    v.pipe(v.string(), v.description('The name of the bundle.')),
  ),
  baseline: v.optional(
    v.pipe(v.string(), v.description('The baseline size for comparison.')),
  ),
  maximumWarning: v.optional(
    v.pipe(
      v.string(),
      v.description(
        'The maximum threshold for warning relative to the baseline.',
      ),
    ),
  ),
  maximumError: v.optional(
    v.pipe(
      v.string(),
      v.description(
        'The maximum threshold for error relative to the baseline.',
      ),
    ),
  ),
  minimumWarning: v.optional(
    v.pipe(
      v.string(),
      v.description(
        'The minimum threshold for warning relative to the baseline.',
      ),
    ),
  ),
  minimumError: v.optional(
    v.pipe(
      v.string(),
      v.description(
        'The minimum threshold for error relative to the baseline.',
      ),
    ),
  ),
  warning: v.optional(
    v.pipe(
      v.string(),
      v.description(
        'The threshold for warning relative to the baseline (min & max).',
      ),
    ),
  ),
  error: v.optional(
    v.pipe(
      v.string(),
      v.description(
        'The threshold for error relative to the baseline (min & max).',
      ),
    ),
  ),
});

/** 全局样式条目：对象写法可指定 bundleName / inject。 */
export const styleEntrySchema = v.union([
  v.looseObject({
    input: v.pipe(
      v.string(),
      v.regex(STYLE_FILE_PATTERN),
      v.description('The file to include.'),
    ),
    bundleName: v.optional(
      v.pipe(
        v.string(),
        v.regex(/^[\w\-.]*$/),
        v.description('The bundle name for this extra entry point.'),
      ),
    ),
    inject: v.optional(
      v.pipe(
        v.boolean(),
        v.description('If the bundle will be referenced in the HTML file.'),
      ),
      true,
    ),
  }),
  v.pipe(
    v.string(),
    v.regex(STYLE_FILE_PATTERN),
    v.description('The file to include.'),
  ),
]);

/** scss / sass 选项：已知项有文档，其余整份透传给 sass，所以不收紧。 */
const stylePreprocessorOptionsSchema = v.looseObject({
  includePaths: v.optional(
    v.pipe(
      v.array(v.string()),
      v.description(
        'Paths to include. Paths will be resolved to workspace root.',
      ),
    ),
    [],
  ),
  sass: v.optional(
    v.pipe(
      v.looseObject({
        fatalDeprecations: v.optional(
          v.pipe(
            v.array(v.string()),
            v.description(
              'A set of deprecations to treat as fatal. If a deprecation warning of any provided type is encountered during compilation, the compiler will error instead. If a Version is provided, then all deprecations that were active in that compiler version will be treated as fatal.',
            ),
          ),
        ),
        silenceDeprecations: v.optional(
          v.pipe(
            v.array(v.string()),
            v.description(
              ' A set of active deprecations to ignore. If a deprecation warning of any provided type is encountered during compilation, the compiler will ignore it instead.',
            ),
          ),
        ),
        futureDeprecations: v.optional(
          v.pipe(
            v.array(v.string()),
            v.description(
              'A set of future deprecations to opt into early. Future deprecations passed here will be treated as active by the compiler, emitting warnings as necessary.',
            ),
          ),
        ),
      }),
      v.description('Options to pass to the sass preprocessor.'),
    ),
  ),
});

/** `sourceMap`：布尔或逐项开关，取并集翻成 vite 的单一开关（见 resolveSourcemap）。 */
const sourceMapSchema = v.optional(
  v.union([
    v.looseObject({
      scripts: v.optional(
        v.pipe(
          v.boolean(),
          v.description('Output source maps for all scripts.'),
        ),
        true,
      ),
      styles: v.optional(
        v.pipe(
          v.boolean(),
          v.description('Output source maps for all styles.'),
        ),
        true,
      ),
      hidden: v.optional(
        v.pipe(
          v.boolean(),
          v.description('Output source maps used for error reporting tools.'),
        ),
        false,
      ),
      vendor: v.optional(
        v.pipe(
          v.boolean(),
          v.description('Resolve vendor packages source maps.'),
        ),
        false,
      ),
      sourcesContent: v.optional(
        v.pipe(
          v.boolean(),
          v.description(
            'Output original source content for files within the source map.',
          ),
        ),
        true,
      ),
    }),
    v.boolean(),
  ]),
  false,
);

/**
 * `optimization`：默认 false（上游默认 true）。小程序的 dev 流程是微信开发者工具盯着
 * 产物目录，默认出未压缩代码才可读；要压缩显式打开或走 production configuration。
 * 只保留 scripts / styles.minify 两个真有对应物的子项。
 */
const optimizationSchema = v.optional(
  v.pipe(
    v.union([
      v.looseObject({
        scripts: v.optional(
          v.pipe(
            v.boolean(),
            v.description('Enables optimization of the scripts output.'),
          ),
          true,
        ),
        styles: v.optional(
          v.union([
            v.looseObject({
              minify: v.optional(
                v.pipe(
                  v.boolean(),
                  v.description(
                    'Minify CSS definitions by removing extraneous whitespace and comments.',
                  ),
                ),
                true,
              ),
            }),
            v.boolean(),
          ]),
          true,
        ),
      }),
      v.boolean(),
    ]),
    v.description(
      'Enables optimization of the build output: minification of scripts and styles, tree-shaking and dead-code elimination.',
    ),
  ),
  false,
);

/** 交给 `v.lazy` 的共享子形状，转换时落成 `#/definitions/<name>`，与上游同形。 */
export const applicationSchemaDefinitions = {
  assetPattern: assetPatternSchema,
  fileReplacement: fileReplacementSchema,
  budget: budgetSchema,
};

/**
 * CLI 侧的必填项。`outputPath` / `tsConfig` 在形状里就是必填；`main` 只在 CLI 侧必填：
 * 漏了会静默少一个引导入口，所以 angular.json 里必须写。但产物主体是 `pages`，
 * builder 内部允许不带（devkit 会把没配的键连 `undefined` 一起塞过来），所以形状里
 * 它是可选的，只在生成的 schema 里补进 required。
 */
const REQUIRED_IN_CLI = ['outputPath', 'main', 'tsConfig'] as const;

/**
 * 两条 builder 链路（application / vitest）同名同义的字段。形状和说明都只写一份：
 * 测试产物也是一个完整小程序工程，两条链路读同一个选项必须得到同一个结果。
 * 各自独有的字段（application 的 budgets / optimization…，vitest 的 port / include…）
 * 留在各自的 schema 里。
 */
export const sharedMpOptionFields = {
  platform: v.optional(
    v.pipe(v.picklist(PLATFORMS), v.description('小程序平台')),
    PlatformType.wx,
  ),
  pages: v.optional(
    v.pipe(
      v.array(v.lazy(() => assetPatternSchema)),
      v.description('页面配置'),
    ),
    [],
  ),
  subpackages: v.optional(
    v.pipe(
      v.array(subpackagePatternSchema),
      v.description(
        '分包入口：写法与 pages 一样，output 就是分包 root（约定 root 同时是源码目录' +
          '与产物目录）。配了就不用在 app 配置里写 subpackages：root 取 output，' +
          '分包页由扫出来的入口算；自己写了同一个 root 就以自己那份为准',
      ),
    ),
  ),
  customTabbar: v.optional(
    v.pipe(
      v.array(v.lazy(() => assetPatternSchema)),
      v.description(
        '自定义 tabBar 入口的源文件位置。产物目录由平台决定（微信系 custom-tab-bar，' +
          '支付宝 customize-tab-bar），output 字段会被覆盖；' +
          '不配则默认取 <sourceRoot>/custom-tab-bar 下的 *.entry.ts',
      ),
    ),
  ),
  // -------------------------------------------------- app / project 配置产物
  appJson: v.optional(
    v.pipe(
      v.string(),
      v.description(
        '结构化 app 配置源文件（相对 workspaceRoot）。与 assets 里的静态 app.json ' +
          '不是二选一：静态那份是底稿，本文件只写要补的字段，已写过的 key 不动，' +
          'pages 追加。环境不同就换这个文件，平台不同用文件里的 _platform 段。',
      ),
    ),
  ),
  projectConfig: v.optional(
    v.pipe(
      v.string(),
      v.description(
        '结构化 project 配置源文件（相对 workspaceRoot），只影响 project 配置文件。' +
          '与 appJson 各管一个输出文件，字段不互通；没写的字段由内置默认值打底。',
      ),
    ),
  ),
  appJsonValidate: v.optional(
    v.pipe(
      v.picklist(['error', 'warn', 'off']),
      v.description(
        'app 配置校验严格度。只作用于 appJson 通道；只有静态 app.json 的工程固定 warn' +
          '（那是从别的项目搬过来的，合规与否不由我们负责）。off 用于先绕过校验把工程跑起来。',
      ),
    ),
    'error',
  ),
  deriveCondition: v.optional(
    v.pipe(
      v.boolean(),
      v.description(
        '自动生成 project 配置的调试启动项（condition），开发者工具的「编译模式」' +
          '会列出全部页面。只是方便一下，需要精确控制启动参数仍在 projectConfig 里写。',
      ),
    ),
    false,
  ),
  viteConfig: v.optional(
    v.pipe(
      v.string(),
      v.description(
        '自定义 vite 配置的钩子文件（相对 workspaceRoot）。文件默认导出一个 ' +
          '(config, ctx) => config 的函数：config 是构建器组装完的最终 vite 配置，' +
          '随便改，返回新对象或就地改都行；构建器不校验钩子的改动。' +
          '.ts / .mts / .cts 由 jiti 加载，.js / .mjs / .cjs 走原生 import。',
      ),
    ),
  ),
  watch: v.optional(
    v.pipe(v.boolean(), v.description('Run build when files change.')),
    false,
  ),
  // ---------------------------------------------------------- 资源与样式
  assets: v.optional(
    v.pipe(
      v.array(v.lazy(() => assetPatternSchema)),
      v.description(
        'Define the assets to be copied to the output directory. These assets are copied as-is without any further processing or hashing.',
      ),
    ),
    [],
  ),
  styles: v.optional(
    v.pipe(
      v.array(styleEntrySchema),
      v.description('Global styles to be included in the build.'),
    ),
    [],
  ),
  polyfills: v.optional(
    v.pipe(
      v.union([v.array(v.string()), v.string()]),
      v.description(
        'Polyfills to be included in the build. ' +
          '每条都会被 import 进 polyfills 入口，包名和本地文件都收。',
      ),
    ),
  ),
  dedupe: v.optional(
    v.pipe(
      v.array(v.string()),
      v.description(
        'Forced single-instance packages, passed straight to Vite `resolve.dedupe`. ' +
          'Empty by default: nothing is injected into your module resolution. Only ' +
          'needed when the library is consumed via `file:` / `npm link`, where the ' +
          'linked copy own node_modules holds a second @angular/core.',
      ),
    ),
    [],
  ),
};

export const applicationOptionsSchema = v.pipe(
  v.looseObject({
    // ---------------------------------------------------------------- 必填
    outputPath: v.pipe(
      v.string(),
      v.description(
        'The full path for the new output directory, relative to the current workspace.',
      ),
    ),
    main: v.optional(
      v.pipe(
        v.string(),
        v.description(
          'The full path for the main entry point to the app, relative to the current workspace. ' +
            '内容是 `bootstrapApplication({ providers: [...] })`。',
        ),
      ),
    ),
    // 上游可选，本包必填：入口范围靠它的 fileNames 判定，没有它连要编哪些文件都不知道
    tsConfig: v.pipe(
      v.string(),
      v.description(
        'The full path for the TypeScript configuration file, relative to the current workspace.',
      ),
    ),
    // ------------------------------------------------------------ 小程序入口
    // 与 vitest 链路共用的字段（platform / pages / assets / polyfills …）
    ...sharedMpOptionFields,
    // ------------------------------------------------------------- 产物形态
    nativeComponentsDir: v.optional(
      v.pipe(
        v.string(),
        v.description(
          '原生小程序自定义组件目录（相对 workspaceRoot，如 wxcomponents）。' +
            '配置后整个目录拷进产物，模板命中原生标签自动注入 usingComponents。',
        ),
      ),
    ),
    // ------------------------------------------------------------- 产物形态
    format: v.optional(
      v.pipe(
        v.picklist(['cjs', 'es']),
        v.description(
          '产物模块格式。小程序 JS 运行时是 CommonJS，默认 cjs；' +
            '只有在宿主侧确认支持 ESM 时才改成 es。',
        ),
      ),
      'cjs',
    ),
    optimization: optimizationSchema,
    sourceMap: sourceMapSchema,
    outputHashing: v.optional(
      v.pipe(
        v.picklist(['none', 'all', 'media', 'bundles']),
        v.description(
          'Define the output filename cache-busting hashing mode.\n\n' +
            '- `none`: No hashing.\n- `all`: Hash for all output bundles. \n' +
            '- `media`: Hash for all output media (e.g., images, fonts, etc. that are referenced in CSS files).\n' +
            '- `bundles`: Hash for output of lazy and main bundles.',
        ),
      ),
      'none',
    ),
    deleteOutputPath: v.optional(
      v.pipe(
        v.boolean(),
        v.description('Delete the output path before building.'),
      ),
      true,
    ),
    statsJson: v.optional(
      v.pipe(
        v.boolean(),
        v.description(
          "Generates a 'stats.json' file which can be analyzed with https://esbuild.github.io/analyze/.",
        ),
      ),
      false,
    ),
    budgets: v.optional(
      v.pipe(
        v.array(v.lazy(() => budgetSchema)),
        v.description(
          'Budget thresholds to ensure parts of your application stay within boundaries which you set.',
        ),
      ),
      [],
    ),
    tagNameClass: v.optional(
      v.pipe(
        v.picklist(['mapped', 'all', 'off']),
        v.description(
          '给元素补 `tag-name-<原标签>` 标记的策略。模板写 `div` 而 wxml 里已经是 ' +
            '`view`，`div` 选择器落空，这个 class 就是补回来的把手。' +
            'mapped（默认）只在映射改写了标签时输出；all 每个元素都输出；' +
            'off 一律不输出（标记会进 class，也就等于每个元素多一个 token）。',
        ),
      ),
      'mapped',
    ),
    // ---------------------------------------------------------- 样式与文件替换
    stylePreprocessorOptions: v.optional(
      v.pipe(
        stylePreprocessorOptionsSchema,
        v.description('Options to pass to style preprocessors.'),
      ),
    ),
    inlineStyleLanguage: v.optional(
      v.pipe(
        v.picklist(['css', 'less', 'sass', 'scss']),
        v.description(
          "The stylesheet language to use for the application's inline component styles.",
        ),
      ),
      'css',
    ),
    fileReplacements: v.optional(
      v.pipe(
        v.array(v.lazy(() => fileReplacementSchema)),
        v.description(
          'Replace compilation source files with other compilation source files in the build.',
        ),
      ),
      [],
    ),
    // ------------------------------------------------------------ 模块解析
    // 比上游放宽（上游只收数组）：串 / 数组两种写法照旧都收。上游在 options.ts 里
    // 也把串归一成数组，所以放宽不会和上游分叉。localize 的判定见 vite/index.ts。
    // ------------------------------------------------------------ 模块解析
    define: v.optional(
      v.pipe(
        v.record(v.string(), v.string()),
        v.description(
          'Defines global identifiers that will be replaced with a specified constant value when found in any JavaScript or TypeScript code including libraries. The value will be used directly. String values must be put in quotes. Identifiers within Angular metadata such as Component Decorators will not be replaced.',
        ),
      ),
    ),
    conditions: v.optional(
      v.pipe(
        v.array(v.string()),
        v.description(
          "Custom package resolution conditions used to resolve conditional exports/imports. Defaults to ['module', 'development'/'production']. The following special conditions are always present if the requirements are satisfied: 'default', 'import', 'require', 'browser', 'node'.",
        ),
      ),
    ),
    externalDependencies: v.optional(
      v.pipe(
        v.array(v.string()),
        v.description(
          'Exclude the listed external dependencies from being bundled into the bundle. Instead, the created bundle relies on these dependencies to be available during runtime. Note: `@foo/bar` marks all paths within the `@foo/bar` package as external, including sub-paths like `@foo/bar/baz`.',
        ),
      ),
      [],
    ),
    preserveSymlinks: v.optional(
      v.pipe(
        v.boolean(),
        v.description(
          'Do not use the real path when resolving modules. If unset then will default to `true` if NodeJS option --preserve-symlinks is set.',
        ),
      ),
    ),
  }),
  // 根对象是唯一保留严格性的地方：angular.json 里写错选项名要当场失败。
  // 运行时那份（parseApplicationOptions）仍然宽松，devkit 会把它 schema 里的
  // 键连默认值一起塞过来，多出来的键不算错。
  v.metadata({
    additionalProperties: false,
    required: [...REQUIRED_IN_CLI],
  }),
);

/** angular.json 里写出来的形状（默认值还没补）。 */
export type MpApplicationOptions = v.InferInput<
  typeof applicationOptionsSchema
>;
/** `parseApplicationOptions` 之后的形状：默认值已补齐。 */
export type ParsedApplicationOptions = v.InferOutput<
  typeof applicationOptionsSchema
>;
export type MpAssetPattern = v.InferOutput<typeof assetPatternSchema>;
export type MpSubPackageEntry = v.InferOutput<typeof subpackagePatternSchema>;
export type MpStyleEntry = v.InferOutput<typeof styleEntrySchema>;
export type MpBudgetEntry = v.InferOutput<typeof budgetSchema>;

/**
 * 解析 builder 选项：补默认值，形状不对就把所有问题一次列全再抛。
 *
 * CLI 侧 ajv 已经按同一份 schema 校验过一遍（schema.json 就是这份转出来的），
 * 这里要的是补过默认值的返回值 —— builder 内部拿到的字段不用再判空。
 */
export function parseApplicationOptions(
  options: unknown,
): ParsedApplicationOptions {
  const result = v.safeParse(applicationOptionsSchema, options);
  if (result.success) {
    return result.output;
  }
  throw new Error(
    `构建选项不合法：\n${formatIssues(result.issues, 'options').join('\n')}`,
  );
}
