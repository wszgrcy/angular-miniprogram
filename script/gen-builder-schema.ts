import * as fs from 'fs';
import * as path from 'path';
import { PlatformType } from '../src/builder/platform/platform';

const nodeRequire = require as unknown as NodeRequire;

/**
 * 生成 `src/builder/vite/schema.json`（application builder 的选项 schema）。
 *
 * ## 为什么是生成物
 *
 * 本构建器是 `@angular/build:application` 的小程序对应物，选项名和语义都应当
 * 跟它对齐。以前 schema 是手抄的（而且抄的是 webpack 时代 `build-angular:browser`
 * 那一版），结果两头都漂：上游删掉的化石字段留在这儿变成了「配了没反应」，
 * 上游新增的字段我们又一个没接。
 *
 * 现在改成**白名单生成**：基底直接读 devDependencies 里
 * `@angular/build/src/builders/application/schema.json`（版本由 package.json
 * 钉住，升版本即同步），只挑 `INHERIT` / `OVERRIDE` 里点过名的字段，
 * 再拼上本包独有的 `LOCAL`。
 *
 * 上游新增字段不会自动进来 —— 想支持就得往表里加一行，加的时候顺手把语义
 * 落到 `createMiniProgramViteConfig` 里。这样 schema 里出现的每一个字段，
 * 都必然在 builder 里有读取点。
 *
 * ## 丢弃清单（配了会直接校验失败，而不是静默无效）
 *
 * 小程序没有 HTML / HTTP / SW / SSR / Web Worker 这些概念，下列上游字段整体不要：
 *
 * - 入口与 HTML：`browser`（本包叫 `main`）、`index`、`appShell`、`baseHref`
 * - 服务端渲染：`server`、`ssr`、`prerender`、`outputMode`
 * - HTTP 部署：`deployUrl`、`security`、`crossOrigin`、`subresourceIntegrity`
 * - Service Worker：`serviceWorker`
 * - Web Worker：`webWorkerTsConfig`
 * - 与打包器绑定、Vite 侧无对应物：`loader`、`extractLicenses`、`clearScreen`
 * - webpack 化石：`vendorChunk`、`commonChunk`、`buildOptimizer`、`extractCss`、
 *   `showCircularDependencies`、`namedChunks`（rollup 的 chunk 本来就带名字）、
 *   `resourcesOutputPath`、`poll`（本包 watch 走 fs.watch，无轮询）
 * - 未实现：`scripts`（全局脚本入口）、`allowedCommonJsDependencies`
 *   （Vite 没有对应的告警可关）、`verbose`（logLevel 固定 info，见 index.ts 注释）
 * - i18n 构建期内联：`localize`、`i18nMissingTranslation`、`i18nDuplicateTranslation`
 *   （本包走 `polyfills` 里声明 `@angular/localize` 那条运行时路径）
 * - `aot`：恒 AOT，没有 jit 路径
 *
 * 用法：`npm run gen:schema` 重新生成，`npm run check:schema` 只校验不写盘
 * （CI 用，防止有人手改 schema.json 或升了 @angular/build 却没同步）。
 *
 * `library` builder 走同一套：基底是 `@angular/build` 的 ng-packagr schema
 * （project / tsConfig / watch / poll 四个，本包无独有项），产物是
 * `src/builder/library/schema.json`。
 */

const UPSTREAM_PACKAGE = '@angular/build';
const APPLICATION_SCHEMA_SUBPATH = 'src/builders/application/schema.json';
const LIBRARY_SCHEMA_SUBPATH = 'src/builders/ng-packagr/schema.json';
const APPLICATION_OUTPUT = path.resolve(
  __dirname,
  '../src/builder/vite/schema.json',
);
const LIBRARY_OUTPUT = path.resolve(
  __dirname,
  '../src/builder/library/schema.json',
);

/**
 * `platform` 的合法值直接取自平台注册表，不在 schema 里手抄一遍（手拄了就会漏）。
 * `library` 是构建器内部给 library 产物用的伪平台，不是用户能配的目标。
 */
const PLATFORM_ENUM = Object.values(PlatformType).filter(
  (value) => value !== PlatformType.library,
);

/** 上游定义原样继承的字段（描述、类型、默认值全部跟上游） */
const INHERIT = [
  'assets',
  'styles',
  'stylePreprocessorOptions',
  'inlineStyleLanguage',
  'fileReplacements',
  'sourceMap',
  'watch',
  'outputHashing',
  'deleteOutputPath',
  'preserveSymlinks',
  'define',
  'conditions',
  'externalDependencies',
  'budgets',
  'statsJson',
] as const;

/** 继承上游、但本包改了定义或默认值的字段。reason 说明为什么要改。 */
const OVERRIDE: Record<string, { def: unknown; reason: string }> = {
  tsConfig: {
    def: {
      type: 'string',
      description:
        'The full path for the TypeScript configuration file, relative to the current workspace.',
    },
    reason: '本包 tsconfig 必填（入口范围靠它的 fileNames 判定），上游是可选。',
  },
  outputPath: {
    def: {
      type: 'string',
      description:
        'The full path for the new output directory, relative to the current workspace.',
    },
    reason:
      '上游的 {base,browser,server,media} 对象形态是给 web 产物分目录用的，' +
      '小程序产物目录由平台固定，只收字符串。',
  },
  polyfills: {
    def: {
      description: 'Polyfills to be included in the build.',
      oneOf: [
        {
          type: 'array',
          description: 'Polyfills to be included in the build.',
          items: { type: 'string' },
        },
        {
          type: 'string',
          description: 'The polyfills to be included in the build.',
        },
      ],
    },
    reason:
      '比上游放宽（上游只收数组）：串 / 数组两种写法照旧都收，减少心智。' +
      '上游自己也在 options.ts 里把串归一成数组，所以放宽不会和上游分叉。' +
      'localize 的判定见 vite/index.ts resolveLocalizeInit。',
  },
  optimization: {
    def: {
      description:
        'Enables optimization of the build output: minification of scripts and ' +
        'styles, tree-shaking and dead-code elimination. `styles.inlineCritical` ' +
        'and `fonts` are web-only and have no effect here.',
      default: false,
      oneOf: [
        {
          type: 'object',
          properties: {
            scripts: {
              type: 'boolean',
              description: 'Enables optimization of the scripts output.',
              default: true,
            },
            styles: {
              description: 'Enables optimization of the styles output.',
              default: true,
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    minify: {
                      type: 'boolean',
                      description:
                        'Minify CSS definitions by removing extraneous whitespace and comments.',
                      default: true,
                    },
                  },
                  additionalProperties: false,
                },
                { type: 'boolean' },
              ],
            },
          },
          additionalProperties: false,
        },
        { type: 'boolean' },
      ],
    },
    reason:
      '上游默认 true（web 产物默认压缩）。本包默认 false：小程序的 dev 流程是' +
      '微信开发者工具盯着产物目录，默认出未压缩代码才可读；需要压缩请显式打开' +
      '或走 production configuration。同时只保留 scripts / styles.minify ' +
      '两个真有对应物的子项。',
  },
};

/** 本包独有字段（上游没有）。 */
const LOCAL: Record<string, unknown> = {
  platform: {
    type: 'string',
    // 枚举值直接取自 PlatformType，不在这里手抄一遗
    enum: PLATFORM_ENUM,
    description: '小程序平台',
    default: 'wx',
  },
  pages: {
    type: 'array',
    description: '页面配置',
    default: [],
    items: { $ref: '#/definitions/assetPattern' },
  },
  customTabbar: {
    type: 'array',
    description:
      '自定义 tabBar 入口的源文件位置。产物目录由平台决定（微信系 custom-tab-bar，' +
      '支付宝 customize-tab-bar），output 字段会被覆盖；' +
      '不配则默认取 <sourceRoot>/custom-tab-bar 下的 *.entry.ts',
    items: { $ref: '#/definitions/assetPattern' },
  },
  main: {
    type: 'string',
    description:
      'The full path for the main entry point to the app, relative to the current workspace.',
  },
  appJson: {
    type: 'string',
    description:
      '结构化 app 配置源文件（相对 workspaceRoot）。配置后由构建器编译生成 ' +
      'app.json（含页面/tabBar/分包校验），与 assets 中的静态 app.json 互斥。',
  },
  nativeComponentsDir: {
    type: 'string',
    description:
      '原生小程序自定义组件目录（相对 workspaceRoot，如 wxcomponents）。' +
      '配置后整个目录拷进产物，模板命中原生标签自动注入 usingComponents。',
  },
  dedupe: {
    type: 'array',
    items: { type: 'string' },
    default: [],
    description:
      'Forced single-instance packages, passed straight to Vite `resolve.dedupe`. ' +
      'Empty by default: nothing is injected into your module resolution. Only ' +
      'needed when the library is consumed via `file:` / `npm link`, where the ' +
      'linked copy own node_modules holds a second @angular/core.',
  },
  format: {
    type: 'string',
    enum: ['cjs', 'es'],
    default: 'cjs',
    description:
      '产物模块格式。小程序 JS 运行时是 CommonJS，默认 cjs；' +
      '只有在宿主侧确认支持 ESM 时才改成 es。',
  },
};

function readUpstream(subpath: string): {
  schema: Record<string, any>;
  version: string;
} {
  // 只能先解析 package.json 再手工拼：@angular/build 的 exports 只开了
  // `.` / `./private` / `./package.json`，直接 require 那个子路径会被 exports 挡掉。
  let pkgDir: string;
  try {
    pkgDir = path.dirname(
      nodeRequire.resolve(`${UPSTREAM_PACKAGE}/package.json`),
    );
  } catch {
    throw new Error(
      `读不到 ${UPSTREAM_PACKAGE}/package.json，请确认它已安装（devDependencies）`,
    );
  }
  const version = JSON.parse(
    fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf-8'),
  ).version;
  return {
    schema: JSON.parse(fs.readFileSync(path.join(pkgDir, subpath), 'utf-8')),
    version,
  };
}

/**
 * 上游字段 → 生成物字段：没被点名的一个不进，删掉的 / 未继承的都算丢弃。
 * 两个 builder 共用这套检查，上游删字段时当场报错而不是静默少字段。
 */
function pickUpstream(
  upstreamProperties: Record<string, any>,
  version: string,
  inherit: readonly string[],
  override: Record<string, { def: unknown; reason: string }>,
  local: Record<string, unknown> = {},
): Record<string, unknown> {
  const missing = [...inherit, ...Object.keys(override)].filter(
    (key) => !(key in upstreamProperties),
  );
  if (missing.length) {
    throw new Error(
      `${UPSTREAM_PACKAGE}@${version} 里找不到这些字段：${missing.join(', ')}。` +
        `上游删字段了，请同步本脚本的 INHERIT / OVERRIDE 表。`,
    );
  }
  const overlap = Object.keys(override).filter((key) =>
    inherit.includes(key),
  );
  if (overlap.length) {
    throw new Error(`字段同时出现在 INHERIT 和 OVERRIDE：${overlap.join(', ')}`);
  }

  const properties: Record<string, unknown> = {};
  for (const key of inherit) {
    const { 'x-user-analytics': _analytics, ...rest } = upstreamProperties[key];
    properties[key] = rest;
  }
  for (const [key, { def }] of Object.entries(override)) {
    properties[key] = def;
  }
  return Object.assign(properties, local);
}

/** `library` builder 直接全量继承 ng-packagr 的四个字段，本包无独有项。 */
const LIBRARY_INHERIT = ['project', 'tsConfig', 'watch', 'poll'] as const;

interface Generated {
  schema: Record<string, unknown>;
  version: string;
}

function buildApplicationSchema(): Generated {
  const { schema: upstream, version } = readUpstream(APPLICATION_SCHEMA_SUBPATH);
  return {
    version,
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema',
      title: 'Mini-program Vite build schema',
      description:
        '小程序构建 builder（Vite / esbuild 版，替代 webpack 链路）。' +
        `本文件由 script/gen-builder-schema.ts 从 ${UPSTREAM_PACKAGE}@${version} 生成，勿手改。`,
      type: 'object',
      properties: pickUpstream(
        upstream.properties ?? {},
        version,
        INHERIT,
        OVERRIDE,
        LOCAL,
      ),
      additionalProperties: false,
      required: ['outputPath', 'main', 'tsConfig'],
      definitions: upstream.definitions,
    },
  };
}

function buildLibrarySchema(): Generated {
  const { schema: upstream, version } = readUpstream(LIBRARY_SCHEMA_SUBPATH);
  return {
    version,
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema',
      title: 'Mini-program library (ng-packagr) schema',
      description:
        '小程序 library builder（ng-packagr 链路）。' +
        `本文件由 script/gen-builder-schema.ts 从 ${UPSTREAM_PACKAGE}@${version} 生成，勿手改。`,
      type: 'object',
      properties: pickUpstream(
        upstream.properties ?? {},
        version,
        LIBRARY_INHERIT,
        {},
      ),
      additionalProperties: false,
      required: ['project'],
    },
  };
}

/** 生成物里带上来源版本，排查「schema 和依赖版本对不上」时不用猜。 */
function withSourceVersion(
  schema: Record<string, unknown>,
  version: string,
): Record<string, unknown> {
  return { ...schema, 'x-generated-from': `${UPSTREAM_PACKAGE}@${version}` };
}

const TARGETS: { output: string; build: () => Generated }[] = [
  { output: APPLICATION_OUTPUT, build: buildApplicationSchema },
  { output: LIBRARY_OUTPUT, build: buildLibrarySchema },
];

function main(): void {
  const check = process.argv.includes('--check');
  for (const target of TARGETS) {
    const { schema, version } = target.build();
    const output = `${JSON.stringify(withSourceVersion(schema, version), null, 2)}\n`;
    const name = path.relative(path.resolve(__dirname, '..'), target.output);
    if (check) {
      const current = fs.existsSync(target.output)
        ? fs.readFileSync(target.output, 'utf-8')
        : '';
      if (current !== output) {
        console.error(
          `${name} 与 ${UPSTREAM_PACKAGE}@${version} 不同步，` +
            `请跑 npm run gen:schema 并把结果一起提交`,
        );
        process.exit(1);
      }
      console.log(`${name} 与 ${UPSTREAM_PACKAGE}@${version} 一致`);
      continue;
    }
    fs.writeFileSync(target.output, output);
    console.log(
      `已生成 ${name}（基底 ${UPSTREAM_PACKAGE}@${version}，` +
        `${Object.keys(schema.properties as object).length} 个字段）`,
    );
  }
}

if (require.main === module) {
  main();
}

export { buildApplicationSchema as buildSchema, buildLibrarySchema };
