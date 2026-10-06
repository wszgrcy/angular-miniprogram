import type { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { createBuilder } from '@angular-devkit/architect';
import type { AssetPattern } from '@angular-devkit/build-angular';
import { getSystemPath } from '@angular-devkit/core';
import * as path from 'path';
import { Observable } from 'rxjs';
import type { InlineConfig } from 'vite';
import {
  clearLibraryMetaMisses,
  formatLibraryMetaSummary,
} from '../../library/library-meta-diagnostics';
import { createMiniProgramTestStack } from '../../shared/mini-program-test-stack';
import { globSpecFiles } from '../../shared/spec-discovery';
import type { MpSubPackagePattern } from '../../shared/type';
import { resolveNative, toPosixPath } from '../../util/path';
import {
  POLYFILL_ENTRY_ID,
  buildPlatformDefine,
  buildViteAlias,
  getBuildPlatform,
  normalizePolyfills,
  polyfillEntryPlugin,
} from '../../vite';
import { applyMpViteConfig } from '../../vite/config-hook';
import {
  generateEntryPatterns,
  resolveProjectRoots,
  toRollupInput,
} from '../../vite/entry-patterns';
import type { MpConfigValidateLevel } from '../../vite/mp-config';
import {
  groupSubPackages,
  prepareMpConfigs,
  reportMpConfigDiagnostics,
} from '../../vite/mp-config';
import { platformConditionDefine } from '../../vite/platform-flags';
import { specModulesPlugin } from '../../vite/plugins/spec-modules.plugin';
import {
  miniProgramVitestDefine,
  resolveMiniProgramVitestPluginOptions,
} from '../node/options';
import {
  miniProgramBuiltinDefine,
  miniProgramVitestGlobalDefine,
} from './globals-define';

export interface VitestViteBuilderOptions {
  /** 测试引导入口（test.ts），里面调 startupMiniProgramTest() */
  main: string;
  tsConfig: string;
  outputPath?: string;
  pages?: AssetPattern[];
  /** 分包入口，语义与 application builder 的同名字段一致 */
  subpackages?: MpSubPackagePattern[];
  /** 自定义 tabBar 入口，语义与 application builder 的同名字段一致 */
  customTabbar?: AssetPattern[];
  platform: import('../../platform/platform').PlatformType;
  assets?: AssetPattern[];
  styles?: (string | { input: string })[];
  sourceMap?: boolean;
  watch?: boolean;
  include?: string[];
  exclude?: string[];
  /** 回连宿主的端口，必须和 vitest.config 里 miniProgramVitest({port}) 一致 */
  port?: number;
  clientHost?: string;
  dedupe?: string[];
  /**
   * 语义与 application builder 的同名选项一致：声明 `@angular/localize`（或 `/init`）才会注入它。
   * 不注入的话 `$localize` 就是 core 的恒等实现，ICU 分支不会被解析。
   */
  polyfills?: string | string[];
  /**
   * 与 application builder 同名同义：测试产物也是一个完整小程序工程，
   * 两条链路读同一份配置必须得到同一个 app.json。
   */
  appJson?: string;
  projectConfig?: string;
  appJsonValidate?: MpConfigValidateLevel;
  deriveCondition?: boolean;
  /**
   * 与 application builder 同名同义：自定义 vite 配置的钩子文件（相对 workspaceRoot）。
   * 要加插件 / 加 alias 两条链路应当是同一个入口。
   */
  viteConfig?: string;
}

/**
 * 测试产物目录。绝不落到裸 `dist`：那里是应用/library 产物目录，
 * `emptyOutDir: true` 会把它清掉，表现为「跑一次测试应用就编不出来了」。
 */
function resolveOutputPath(
  options: VitestViteBuilderOptions,
  context: BuilderContext,
): string {
  const fallback = path.join(
    'dist',
    'vitest',
    context.target?.project || 'project',
  );
  return path.resolve(context.workspaceRoot, options.outputPath || fallback);
}

export async function createVitestViteConfig(options: {
  vitestOptions: VitestViteBuilderOptions;
  context: BuilderContext;
}): Promise<InlineConfig> {
  const { vitestOptions, context } = options;
  const buildPlatform = getBuildPlatform(vitestOptions.platform);
  const resolvedPlugin = resolveMiniProgramVitestPluginOptions({
    port: vitestOptions.port,
    host: vitestOptions.clientHost,
  });

  const entryPatterns = await generateEntryPatterns({
    pages: vitestOptions.pages || [],
    subpackages: vitestOptions.subpackages,
    customTabbar: vitestOptions.customTabbar,
    workspaceRoot: context.workspaceRoot,
    context,
    buildPlatform,
    tsConfig: vitestOptions.tsConfig,
  });

  const { absoluteProjectRoot, absoluteProjectSourceRoot } =
    await resolveProjectRoots({
      workspaceRoot: context.workspaceRoot,
      context,
    });

  // `ng test` 会塞一个空数组进来，`?? 默认值` 不生效，结果是「0 个 spec、全绿」。空数组一律当没传。
  const specInclude = vitestOptions.include?.length
    ? vitestOptions.include
    : ['**/*.spec.ts', '**/*.test.ts'];
  const specFiles = await globSpecFiles({
    cwd: getSystemPath(absoluteProjectSourceRoot),
    include: specInclude,
    exclude: vitestOptions.exclude ?? [],
  });
  context.logger.info(
    `vitest: 在 ${getSystemPath(absoluteProjectSourceRoot)} 发现 ${
      specFiles.length
    } 个 spec：${specFiles.map((f) => f.rel).join(', ') || '(无)'}`,
  );

  const angularPluginModule: unknown = await import(
    '@analogjs/vite-plugin-angular'
  );
  const angular = (
    typeof angularPluginModule === 'function'
      ? angularPluginModule
      : (angularPluginModule as { default: unknown }).default
  ) as (opts: unknown) => import('vite').Plugin[];

  // 配置文件：与 application 链路同一套解析，测试产物也是一个完整小程序工程，两条链路不能各算一份
  const mpConfigs = await prepareMpConfigs({
    workspaceRoot: context.workspaceRoot,
    platform: buildPlatform,
    platformType: vitestOptions.platform,
    assetPatterns: vitestOptions.assets,
    absoluteProjectRoot,
    absoluteProjectSourceRoot,
    appJson: vitestOptions.appJson,
    projectConfig: vitestOptions.projectConfig,
    appJsonValidate: vitestOptions.appJsonValidate,
    deriveCondition: vitestOptions.deriveCondition,
    derivedSubPackages: groupSubPackages(
      entryPatterns.subPackageList.map((p) => ({
        path: toPosixPath(p.outputFiles.path),
        root: p.output,
        independent: p.independent,
      })),
    ),
    builtPagePaths: [
      ...entryPatterns.pageList,
      ...entryPatterns.subPackageList,
    ].map((p) => toPosixPath(p.outputFiles.path)),
    builtTabbarPaths: entryPatterns.tabbarList.map((p) =>
      toPosixPath(p.outputFiles.path),
    ),
  });
  reportMpConfigDiagnostics(mpConfigs, context.logger);

  const stack = createMiniProgramTestStack({
    platform: vitestOptions.platform,
    buildPlatform,
    workspaceRoot: context.workspaceRoot,
    context,
    // devkit 在 Windows 下给的是 /C:/... 这种 posix 化绝对路径，先归一。
    // 类型库不在这里动手：`types` 由工程自己的 tsconfig 声明，构建器不替用户找类型。
    tsConfig: resolveNative(context.workspaceRoot, vitestOptions.tsConfig),
    pages: vitestOptions.pages || [],
    assets: vitestOptions.assets,
    copiedAssets: mpConfigs.assets,
    mpConfigs,
    styles: vitestOptions.styles,
    watch: !!vitestOptions.watch,
    bootstrapChunk: 'test.js',
    absoluteProjectRoot,
    absoluteProjectSourceRoot,
    entryPatterns,
  });

  const config: InlineConfig = {
    root: context.workspaceRoot,
    configFile: false,
    mode: 'development',
    logLevel: 'warn',
    define: {
      ...buildPlatformDefine(buildPlatform, false),
      ...platformConditionDefine(vitestOptions.platform),
      ...miniProgramVitestDefine(resolvedPlugin),
      // spec 里的裸 describe / it / expect 要能指到 registerApiGlobally 挂的那张表
      ...miniProgramVitestGlobalDefine(buildPlatform),
      // tinybench 顶层就 `class extends EventTarget`，runner 的 failTask 又直接 `instanceof AggregateError`，
      // 小程序这三样都没有。
      ...miniProgramBuiltinDefine(buildPlatform),
    },
    resolve: {
      alias: [
        // spec 里有 `src/spec-component/...` 这种从项目根算起的写法，靠 tsconfig baseUrl 解析；
        // Rolldown 不读 baseUrl，补一条 alias。必须排在 tsconfig paths 之前。
        {
          find: /^src\//,
          replacement: path.resolve(context.workspaceRoot, 'src') + '/',
        },
        ...buildViteAlias(
          buildPlatform,
          vitestOptions.tsConfig,
          context.workspaceRoot,
        ),
      ],
      dedupe: vitestOptions.dedupe ?? [],
    },
    plugins: [
      ...stack.preAnalogPlugins,
      // polyfill 入口走虚拟模块：我们那份固定装，`polyfills` 声明的条目
      // 逐条拼在后面（与 application 链路同一套）。
      polyfillEntryPlugin(
        path.resolve(__dirname, '../../platform/template/polyfill-entry.js'),
        normalizePolyfills(vitestOptions.polyfills),
        context.workspaceRoot,
      ),
      // analog 必须排在 wxs-strip 之后：它建 Angular program 时要读
      // fileReplacements，而 wxs-strip 会就地往里 push。
      ...angular(stack.angularOptions),
      ...stack.postAnalogPlugins,
      // spec 必须事先全部编进包（小程序不能按 URL 动态 import），
      // 这里把清单以懒 require 表的形式塞进 test.js。
      specModulesPlugin(specFiles),
    ],
    build: {
      outDir: resolveOutputPath(vitestOptions, context),
      emptyOutDir: true,
      sourcemap: !!vitestOptions.sourceMap,
      minify: false,
      assetsInlineLimit: 0,
      rollupOptions: {
        input: {
          // 全局 polyfill 入口，必须排最前，保证 AbortController 等
          // 在任何业务 chunk 之前装好（与 application 链路一致）。
          polyfills: POLYFILL_ENTRY_ID,
          ...toRollupInput([
            ...entryPatterns.pageList,
            ...entryPatterns.componentList,
            ...entryPatterns.tabbarList,
          ]),
          // 测试引导入口
          test: path.resolve(context.workspaceRoot, vitestOptions.main),
          // spec 用 specs/<相对路径> 做 entry key，和页面 entry 分命名空间
          ...specFiles.reduce<Record<string, string>>((pre, f) => {
            pre[`specs/${f.rel}`] = f.abs;
            return pre;
          }, {}),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name]-[hash].js',
          assetFileNames: '[name].[ext]',
          // 小程序运行时只认 CommonJS。出 ESM 的话开发者工具直接加载不了。
          format: 'cjs',
          exports: 'auto',
        },
      },
    },
  };

  return applyMpViteConfig(config, {
    viteConfig: vitestOptions.viteConfig,
    target: 'vitest',
    platform: vitestOptions.platform,
    isProduction: false,
    workspaceRoot: context.workspaceRoot,
    tsConfig: vitestOptions.tsConfig,
    logger: context.logger,
  });
}

/**
 * vitest 链路的构建 builder —— **只编译，不跑测试**。
 *
 * 和 application builder 的关键差别：本 builder 不起服务，
 * 而 vitest 的 WS 服务必须开在 **vitest 进程**里（pool 在那儿），
 * 所以这里只负责把测试小程序编到磁盘，运行由 `vitest run` 驱动：
 *
 *   1. ng build --configuration test   → 产出测试小程序
 *   2. 微信开发者工具打开产物目录
 *   3. npx vitest run                  → 起 WS、等小程序连上、驱动并收集结果
 */
export function runVitestViteBuilder(
  options: VitestViteBuilderOptions,
  context: BuilderContext,
): Observable<BuilderOutput> {
  return new Observable<BuilderOutput>((observer) => {
    void (async () => {
      try {
        const vite = await import('vite');
        const config = await createVitestViteConfig({
          vitestOptions: options,
          context,
        });
        clearLibraryMetaMisses();
        await vite.build(config);
        const metaSummary = formatLibraryMetaSummary();
        if (metaSummary) {
          context.logger.warn(`[library-meta] ${metaSummary}`);
        }
        context.logger.info(
          'vitest: 测试小程序已编译。用开发者工具打开该目录后执行 `vitest run`。',
        );
        observer.next({ success: true });
        observer.complete();
      } catch (error) {
        context.logger.error(String((error as Error)?.message ?? error));
        observer.next({ success: false });
        observer.complete();
      }
    })();
  });
}

export default createBuilder(
  runVitestViteBuilder as unknown as (
    options: VitestViteBuilderOptions,
    context: BuilderContext,
  ) => Observable<BuilderOutput>,
);
