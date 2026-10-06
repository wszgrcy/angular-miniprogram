import { toJsonSchema } from '@valibot/to-json-schema';
import type { ConversionConfig } from '@valibot/to-json-schema';
import * as fs from 'fs';
import * as path from 'path';
import { libraryOptionsSchema } from '../src/builder/library/options-schema';
import {
  applicationOptionsSchema,
  applicationSchemaDefinitions,
  assetPatternSchema,
} from '../src/builder/vite/options-schema';
import { vitestOptionsSchema } from '../src/builder/vitest/vite/options-schema';

const nodeRequire = require as unknown as NodeRequire;

/**
 * 生成三个 builder 的选项 schema：`src/builder/vite/schema.json`（application）、
 * `src/builder/library/schema.json`、`src/builder/vitest/vite/schema.json`。
 *
 * ## 形状只写一份
 *
 * 选项形状写在 valibot 里（`src/builder/vite/options-schema.ts`、
 * `src/builder/library/options-schema.ts`、`src/builder/vitest/vite/options-schema.ts`），
 * 这里只负责转换：`@valibot/to-json-schema` 转成 JSON Schema，再补 title /
 * description / 来源版本。同一份形状还负责 builder 入口的选项解析（默认值在那儿补）
 * 和选项的 TS 类型，三者不可能各说各话。两条链路同名同义的字段走
 * `sharedMpOptionFields`，不在两个文件里各写一遍。
 *
 * ## 和上游的关系
 *
 * application 构建器是 `@angular/build:application` 的小程序对应物，选项名和语义都跟它
 * 对齐；library 对应 `@angular/build:ng-packagr`。上游在这里不再是形状来源，而是
 * **对账对象**（版本由 package.json 钉住）：
 *
 *  - `UPSTREAM_FIELDS` 点过名的字段上游删了 → 当场报错，提醒同步；
 *  - 上游新增字段既没进 `UPSTREAM_FIELDS` 也没进 `DISCARDED` → 报出来，逼一次表态；
 *  - `DISCARDED` 是丢弃清单：这些字段本包不接，配了会直接校验失败，而不是静默无效。
 *
 * 上游新增字段不会自动进来 —— 想支持就往 options-schema 加字段并登记进
 * `UPSTREAM_FIELDS`，加的时候顺手把语义落到 `createMiniProgramViteConfig` 里。
 * 这样 schema 里出现的每一个字段，都必然在 builder 里有读取点。
 * `vitest` builder 是本包独有的，没有上游可对账，生成物也不带来源版本戳。
 *
 * 用法：`npm run gen:schema` 重新生成，`npm run check:schema` 只校验不写盘
 * （CI 用，防止有人手改 schema.json 或升了 @angular/build 却没同步）。
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
const VITEST_OUTPUT = path.resolve(
  __dirname,
  '../src/builder/vitest/vite/schema.json',
);

/** 名字与语义取自上游的字段。上游删掉任何一个都会在这里报错，而不是静默少字段。 */
const APPLICATION_UPSTREAM_FIELDS = [
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
  'tsConfig',
  'outputPath',
  'polyfills',
  'optimization',
] as const;

const LIBRARY_UPSTREAM_FIELDS = [
  'project',
  'tsConfig',
  'watch',
  'poll',
] as const;

/**
 * 上游有、本包不要的字段 → 为什么不要。空话别写：这一栏是给「升上游版本时纠结要不要接」的人看的。
 */
const APPLICATION_DISCARDED: Record<string, string> = {
  // 入口与 HTML：小程序没有 HTML 入口
  browser: '入口在本包叫 main',
  index: '没有 HTML 入口',
  appShell: '没有 HTML',
  baseHref: '没有 HTML',
  // 服务端渲染
  server: '没有服务端产物',
  ssr: '没有服务端渲染',
  prerender: '没有预渲染',
  outputMode: '产物目录由平台固定，没有 browser/server 之分',
  // HTTP 部署
  deployUrl: '没有 HTTP 部署路径',
  security: '没有 HTTP 响应头',
  crossOrigin: '没有 HTTP',
  subresourceIntegrity: '没有 HTTP',
  // Service Worker
  serviceWorker: '没有 Service Worker',
  ngswConfigPath: '没有 Service Worker',
  // Web Worker
  webWorkerTsConfig: '没有 Web Worker',
  // 与打包器绑定，Vite / rollup 侧无对应物
  loader: 'esbuild 的 loader 由 tsconfig 决定，不接受手配',
  extractLicenses: '没有单独的许可证抽取',
  clearScreen: '日志由 builderContext 出，不清屏',
  // webpack 化石
  vendorChunk: 'rollup 没有 vendor chunk 这个概念',
  commonChunk: 'rollup 自动做公共 chunk',
  buildOptimizer: '没有对应的优化阶段',
  extractCss: '样式本来就不在 JS 里',
  showCircularDependencies: 'rollup 自己会报循环依赖',
  namedChunks: 'rollup 的 chunk 本来就带名字',
  resourcesOutputPath: '媒体产物路径由平台固定',
  poll: '本包 watch 走 fs.watch，无轮询',
  progress: '没有进度条可关',
  // 未实现
  scripts: '全局脚本入口未实现',
  allowedCommonJsDependencies: 'Vite 没有对应的告警可关',
  verbose: 'logLevel 固定 info，见 vite/index.ts',
  // i18n 构建期内联：本包走 polyfills 里声明 @angular/localize 那条运行时路径
  localize: 'i18n 走运行时 @angular/localize',
  i18nFile: '同上',
  i18nFormat: '同上',
  i18nLocale: '同上',
  i18nMissingTranslation: '同上',
  i18nDuplicateTranslation: '同上',
  // 恒 AOT，没有 jit 路径
  aot: '恒 AOT',
};

const LIBRARY_DISCARDED: Record<string, string> = {};

function readUpstream(subpath: string): {
  properties: Record<string, any>;
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
  const schema = JSON.parse(
    fs.readFileSync(path.join(pkgDir, subpath), 'utf-8'),
  );
  return { properties: schema.properties ?? {}, version };
}

/**
 * 与上游对账：删了的字段必须同步，新增的字段必须表态（接进 UPSTREAM_FIELDS
 * 或写进 DISCARDED），两边都不做就报出来。
 */
function assertUpstream(
  label: string,
  upstreamProperties: Record<string, any>,
  version: string,
  fields: readonly string[],
  discarded: Record<string, string>,
): void {
  const missing = fields.filter((key) => !(key in upstreamProperties));
  if (missing.length) {
    throw new Error(
      `${UPSTREAM_PACKAGE}@${version} 里找不到这些字段：${missing.join(', ')}。` +
        `上游删字段了，请同步 options-schema 与 UPSTREAM_FIELDS。`,
    );
  }
  const undeclared = Object.keys(upstreamProperties).filter(
    (key) => !fields.includes(key) && !(key in discarded),
  );
  if (undeclared.length) {
    console.warn(
      `[${label}] ${UPSTREAM_PACKAGE}@${version} 有 ${undeclared.length} 个字段` +
        `本包既没接也没登记：${undeclared.join(', ')}。` +
        `接就加进 UPSTREAM_FIELDS，不接就写进 DISCARDED。`,
    );
  }
}

/**
 * 转换器出的是 draft-2020 风格的 `$defs`，本包的 schema 一直是 draft-07 的
 * `definitions`（`build-cli-schema.ts` 内联进 workspace schema 时按这个前缀改写 $ref）。
 * 顺手去掉空 `required: []`，那是 valibot 对全可选项对象的写法，JSON Schema 里是噪音。
 */
function toDraft7(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(toDraft7);
  }
  if (!node || typeof node !== 'object') {
    return node;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === '$defs') {
      result['definitions'] = toDraft7(value);
      continue;
    }
    if (key === 'required' && Array.isArray(value) && !value.length) {
      continue;
    }
    if (key === '$ref' && typeof value === 'string') {
      result[key] = value.replace('#/$defs/', '#/definitions/');
      continue;
    }
    result[key] = toDraft7(value);
  }
  return result;
}

function convert(
  schema: Parameters<typeof toJsonSchema>[0],
  definitions?: ConversionConfig['definitions'],
): Record<string, unknown> {
  return toDraft7(
    toJsonSchema(schema, {
      target: 'draft-07',
      errorMode: 'throw',
      definitions,
    }),
  ) as Record<string, unknown>;
}

/** metadata 里手写的 required 必须真有其字段，否则 CLI 侧会要求一个不存在的选项。 */
function assertRequiredResolvable(schema: Record<string, unknown>): void {
  const properties = (schema.properties ?? {}) as Record<string, unknown>;
  const required = (schema.required ?? []) as string[];
  const missing = required.filter((key) => !(key in properties));
  if (missing.length) {
    throw new Error(`required 里有未声明的字段：${missing.join(', ')}`);
  }
}

interface Target {
  /** builders.json 里的名字，只用于日志与报错 */
  name: string;
  output: string;
  title: string;
  /** 生成物 description 的第一句 */
  summary: string;
  schema: Parameters<typeof toJsonSchema>[0];
  definitions?: ConversionConfig['definitions'];
  /** 上游对账；本包独有的 builder（vitest）没有上游 */
  upstream?: {
    subpath: string;
    fields: readonly string[];
    discarded: Record<string, string>;
  };
}

const TARGETS: Target[] = [
  {
    name: 'application',
    output: APPLICATION_OUTPUT,
    title: 'Mini-program Vite build schema',
    summary: '小程序构建 builder（Vite / esbuild 版，替代 webpack 链路）。',
    schema: applicationOptionsSchema,
    definitions: applicationSchemaDefinitions,
    upstream: {
      subpath: APPLICATION_SCHEMA_SUBPATH,
      fields: APPLICATION_UPSTREAM_FIELDS,
      discarded: APPLICATION_DISCARDED,
    },
  },
  {
    name: 'library',
    output: LIBRARY_OUTPUT,
    title: 'Mini-program library (ng-packagr) schema',
    summary: '小程序 library builder（ng-packagr 链路）。',
    schema: libraryOptionsSchema,
    upstream: {
      subpath: LIBRARY_SCHEMA_SUBPATH,
      fields: LIBRARY_UPSTREAM_FIELDS,
      discarded: LIBRARY_DISCARDED,
    },
  },
  {
    name: 'vitest',
    output: VITEST_OUTPUT,
    title: 'MiniProgram Vitest Target',
    summary: '把 spec 编进小程序产物，由 vitest 通过 WebSocket 驱动执行。',
    schema: vitestOptionsSchema,
    // 只登记真被引用到的子形状，否则 $defs 里会多出没人引用的定义
    definitions: { assetPattern: assetPatternSchema },
  },
];

function render(target: Target): {
  text: string;
  source: string;
  fields: number;
} {
  const upstream = target.upstream
    ? readUpstream(target.upstream.subpath)
    : undefined;
  if (target.upstream && upstream) {
    assertUpstream(
      target.name,
      upstream.properties,
      upstream.version,
      target.upstream.fields,
      target.upstream.discarded,
    );
  }
  const source = upstream
    ? `${UPSTREAM_PACKAGE}@${upstream.version}`
    : 'src/builder/vitest/vite/options-schema.ts';
  const schema: Record<string, unknown> = {
    $schema: 'http://json-schema.org/draft-07/schema',
    title: target.title,
    description: `${target.summary}本文件由 script/gen-builder-schema.ts 从 ${source} 生成，勿手改。`,
    ...convert(target.schema, target.definitions),
    ...(upstream ? { 'x-generated-from': source } : {}),
  };
  assertRequiredResolvable(schema);
  return {
    text: `${JSON.stringify(schema, null, 2)}\n`,
    source,
    fields: Object.keys((schema.properties ?? {}) as object).length,
  };
}

function main(): void {
  const check = process.argv.includes('--check');
  for (const target of TARGETS) {
    const { text, source, fields } = render(target);
    const name = path.relative(path.resolve(__dirname, '..'), target.output);
    if (check) {
      const current = fs.existsSync(target.output)
        ? fs.readFileSync(target.output, 'utf-8')
        : '';
      if (current !== text) {
        console.error(
          `${name} 与 ${source} 不同步，` +
            `请跑 npm run gen:schema 并把结果一起提交`,
        );
        process.exit(1);
      }
      console.log(`${name} 与 ${source} 一致`);
      continue;
    }
    fs.writeFileSync(target.output, text);
    console.log(`已生成 ${name}（对账 ${source}，${fields} 个字段）`);
  }
}

if (require.main === module) {
  main();
}
