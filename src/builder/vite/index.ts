import type { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { createBuilder } from '@angular-devkit/architect';
import type { AssetPattern } from '@angular-devkit/build-angular';
import { getSystemPath } from '@angular-devkit/core';
import * as path from 'path';
import { Observable } from 'rxjs';
import { Injector } from 'static-injector';
import type { AliasOptions, InlineConfig } from 'vite';
import { changeComponent } from '../component-template-inject/change-component';
import { LIBRARY_OUTPUT_ROOTDIR } from '../library';
import { BuildPlatform, PlatformType } from '../platform/platform';
import { getBuildPlatformInjectConfig } from '../platform/platform-inject-config';
import { LibraryTemplateScopeService } from '../shared/library-template-scope.service';
import {
  generateEntryPatterns,
  resolveProjectRoots,
  toRollupInput,
} from './entry-patterns';
import { miniProgramComponentTransformPlugin } from './plugins/component-transform.plugin';
import { libraryTemplatePlugin } from './plugins/library-template.plugin';
import { miniProgramAssetsPlugin } from './plugins/mini-program-assets.plugin';
import { tsConfigPathsToAliases } from './tsconfig-paths';
import {
  type SourceWatcher,
  type WatcherFactoryLike,
  collectWatchDirectories,
  watchSources,
} from './watch-sources';

export interface ViteMiniProgramBuildOptions {
  tsConfig: string;
  outputPath: string;
  pages: AssetPattern[];
  components: AssetPattern[];
  platform: PlatformType;
  assets?: AssetPattern[];
  styles?: (string | { input: string })[];
  sourceMap?: boolean;
  optimization?: boolean;
  base?: string;
  /** 监听模式：对应小程序的开发方式（微信开发者工具盯着 dist 目录） */
  watch?: boolean;
  /**
   * 结构化 app 配置源文件（相对 workspaceRoot，如 src/app.config.json）。
   * 配置后由构建器编译生成 app.json（含页面/tabBar/分包校验），
   * 与 assets 里的静态 app.json 互斥。不配则维持旧行为。
   */
  appJson?: string;
  /**
   * 文件替换，CLI 标准形状：[{ replace: 'src/environments/environment.ts',
   * with: 'src/environments/environment.prod.ts' }]
   */
  fileReplacements?: {
    replace: string;
    with: string;
  }[];
  /** scss / sass / less 的 includePaths 等预处理器选项 */
  stylePreprocessorOptions?: {
    includePaths?: string[];
  };
  /**
   * app 引导入口（src/main.ts），现在是
   * `bootstrapApplication({ providers: [...] })`。
   *
   * （早期是 `platformMiniProgram().bootstrapModule(MainModule)`，
   * 已随启动 provider 化改造换掉，见 `platform/application.ts`。
   * 入口这个字段本身的作用没变。）
   *
   * 之前漏了这个字段（在「schema 接受但 builder 不读」那批里），
   * 导致产物里没有 app 引导，app.js 只能把所有 chunk 全 require 一遍
   * 来凑，结果在 app 上下文里调了 Page()/Component()，微信直接报
   * "Please do not call Page constructor..." /
   * "Component constructors should be called while initialization"。
   */
  main?: string;
  /**
   * 产物模块格式。默认 'cjs'。
   *
   * 小程序的 JS 运行时是 CommonJS（require / module.exports），
   * 不原生支持 ESM 的 import / export。之前 Vite 默认吐 'es'，
   * 能跑起来是靠微信开发者工具「增强编译」在兜，属于隐式依赖：
   * 真机 / 关掉增强编译 / CI 里直接跑就可能挂。
   *
   * 这里显式出 cjs，不再依赖工具链兜底。
   */
  format?: 'cjs' | 'es';
}

/**
 * 由 BuildPlatform 推出来的 define，替代 webpack 的 DefinePlugin。
 * 映射关系与 webpack-configuration-change.service.ts 的 globalVariableChange 一致。
 */
export function buildPlatformDefine(
  buildPlatform: BuildPlatform,
  isProduction: boolean,
): Record<string, string> {
  const p = buildPlatform.globalVariablePrefix;
  const g = buildPlatform.globalObject;
  const define: Record<string, string> = {
    global: `${g}.__global`,
    window: `${p}`,
    globalThis: `${p}`,

    performance: `${p}.performance`,
    navigator: `${p}.navigator`,
    wx: g,
    miniProgramPlatform: `"${g}"`,
    queueMicrotask: `${p}.queueMicrotask`,
    // AbortController / AbortSignal 微信没有。源码里的裸引用全部重定向到
    // 全局能力表，表里的值由 polyfill-entry.js 手动导出。
    // 两侧必须配套，见 polyfill-entry.ts 顶部说明。
    AbortController: `${p}.AbortController`,
    AbortSignal: `${p}.AbortSignal`,
  };
  if (!isProduction) {
    define['ngDevMode'] = `${g}.__global.ngDevMode`;
  }
  return define;
}

/**
 * 平台包替换：`angular-miniprogram/platform/wx` -> 实际平台包。
 * 替代 webpack 的 NormalModuleReplacementPlugin。
 *
 * 必须用 RegExp 带边界：Vite 的字符串 alias 走的是「精确 或 startsWith」，
 * 写 `.../wx$` 会被当字面量处，根本匹不上。
 */
export function platformReplacementAlias(
  buildPlatform: BuildPlatform,
): { find: RegExp; replacement: string }[] {
  return [
    {
      find: new RegExp('^angular-miniprogram/platform/wx$'),
      replacement: `angular-miniprogram/platform/${buildPlatform.packageName}`,
    },
  ];
}

export function buildAlias(
  buildPlatform: BuildPlatform,
  extra: Record<string, string> = {},
): AliasOptions {
  return { ...extra };
}

/**
 * Vite 侧的完整 alias：tsconfig paths + 平台包替换。
 *
 * 平台替换必须排在 tsconfig paths 之前生效，否则 `angular-miniprogram/platform`
 * 这种前缀 alias 会把 `angular-miniprogram/platform/wx` 抢走。
 */
/** Vite alias 数组形式（可展开、顺序可控） */
export type ViteAliasEntry = {
  find: string | RegExp;
  replacement: string;
};

export function buildViteAlias(
  buildPlatform: BuildPlatform,
  tsConfigPath: string,
  workspaceRoot: string,
): ViteAliasEntry[] {
  const tsAliases = tsConfigPathsToAliases(
    path.resolve(workspaceRoot, tsConfigPath),
  );
  const list: ViteAliasEntry[] = [
    ...platformReplacementAlias(buildPlatform),
    ...tsAliases,
  ];
  return list;
}

/**
 * 组装 Vite 配置。
 *
 * 插件顺序很关键：
 *  1. @analogjs/vite-plugin-angular 负责 Angular AOT
 *  2. miniProgramComponentTransformPlugin（enforce: 'post'）拿到 AOT 产物注入 propertyChange
 */
export async function createMiniProgramViteConfig(options: {
  viteOptions: ViteMiniProgramBuildOptions;
  context: BuilderContext;
  buildPlatform: BuildPlatform;
  extraPlugins?: import('vite').Plugin[];
  root?: string;
}): Promise<InlineConfig> {
  const { viteOptions, context, buildPlatform } = options;
  const isProduction = !!viteOptions.optimization;

  const entryPatterns = await generateEntryPatterns({
    pages: viteOptions.pages || [],
    components: viteOptions.components || [],
    workspaceRoot: context.workspaceRoot,
    context,
    buildPlatform,
  });
  const allEntries = [
    ...entryPatterns.pageList,
    ...entryPatterns.componentList,
  ];
  const { absoluteProjectRoot, absoluteProjectSourceRoot } =
    await resolveProjectRoots({
      workspaceRoot: context.workspaceRoot,
      context,
    });
  // assets 插件和 library 插件必须共享同一个 scope service，
  // 前者读后者注册的 useComponents / templateList
  const templateScope = new LibraryTemplateScopeService();

  // 该包是 ESM，esModuleInterop 下命名空间的 default 就是工厂函数；
  // 但类型声明里模块本身就是函数类型，这里运行时兜两种形态、类型上收敛成函数。
  const angularPluginModule: unknown = await import(
    '@analogjs/vite-plugin-angular'
  );
  const angular = (
    typeof angularPluginModule === 'function'
      ? angularPluginModule
      : (angularPluginModule as { default: unknown }).default
  ) as (opts: unknown) => import('vite').Plugin[];

  const config: InlineConfig = {
    root: options.root ?? context.workspaceRoot,
    configFile: false,
    mode: isProduction ? 'production' : 'development',
    logLevel: 'warn',
    define: buildPlatformDefine(buildPlatform, isProduction),
    resolve: {
      alias: buildViteAlias(
        buildPlatform,
        viteOptions.tsConfig,
        context.workspaceRoot,
      ),
    },
    // scss / sass 的 includePaths。不接的话项目里 `@import 'variables'`
    // 这种写法会直接编译失败。
    css: viteOptions.stylePreprocessorOptions?.includePaths?.length
      ? {
          preprocessorOptions: {
            scss: {
              includePaths:
                viteOptions.stylePreprocessorOptions.includePaths.map((p) =>
                  path.resolve(context.workspaceRoot, p),
                ),
            },
            sass: {
              includePaths:
                viteOptions.stylePreprocessorOptions.includePaths.map((p) =>
                  path.resolve(context.workspaceRoot, p),
                ),
            },
          },
        }
      : {},
    plugins: [
      ...angular({
        tsconfig: viteOptions.tsConfig,
        workspaceRoot: context.workspaceRoot,
        fastCompile: false,
        experimental: { useAngularCompilationAPI: true },
        // fileReplacements 是 Angular 切环境的标准机制（environment.prod.ts），
        // 不接的话「生产构建」会静默用着 dev 配置——这是会直接上线出事的坑。
        // analog 插件本身支持 CLI 风格的 { replace, with }，透传即可。
        fileReplacements: viteOptions.fileReplacements ?? [],
      }),
      libraryTemplatePlugin({ buildPlatform, templateScope }),
      miniProgramComponentTransformPlugin(),
      miniProgramAssetsPlugin({
        tsConfig: viteOptions.tsConfig,
        workspaceRoot: context.workspaceRoot,
        buildPlatform,
        entryPatterns: allEntries,
        context,
        watch: !!viteOptions.watch,
        templateScope,
        assets: viteOptions.assets,
        appJson: viteOptions.appJson,
        styles: viteOptions.styles,
        absoluteProjectRoot,
        absoluteProjectSourceRoot,
      }),
      ...(options.extraPlugins || []),
    ],
    build: {
      outDir: viteOptions.outputPath,
      emptyOutDir: true,
      sourcemap: !!viteOptions.sourceMap,
      minify: isProduction,
      assetsInlineLimit: 0,
      rollupOptions: {
        input: {
          // 全局 polyfill 入口。必须排在 require 列表最前面，
          // 保证 AbortController 等在任何业务 chunk 之前装好。
          // 模板是纯文本内联、不过 bundler，所以 polyfill 只能走入口。
          polyfills: path.resolve(
            __dirname,
            '../platform/template/polyfill-entry.js',
          ),
          ...toRollupInput(allEntries),
          // app 引导入口。key 固定叫 main，产物 main.js，
          // 和 webpack 时代结构一致。
          ...(viteOptions.main
            ? {
                main: path.resolve(context.workspaceRoot, viteOptions.main),
              }
            : {}),
        },
        output: {
          // key 里带目录，Rollup 的 [name] 会把整段展开进来，
          // 于是能产出 `pages/index/index-entry.js` 这种和 webpack 时代
          // outputFiles.logic 对齐的路径
          entryFileNames: '[name].js',
          chunkFileNames: '[name]-[hash].js',
          assetFileNames: '[name].[ext]',
          // 小程序运行时是 CommonJS，默认出 cjs。
          // 注意扩展名仍然要 .js（不是 .cjs）——小程序只认 .js。
          format: viteOptions.format ?? 'cjs',
          // 多入口 + cjs 时，named / default 混用会让 Rollup 犹豫，
          // auto 让它按实际导出形态决定，避免额外包一层 default
          exports: 'auto',
        },
      },
    },
  };

  return config;
}

export function getBuildPlatform(platform: PlatformType): BuildPlatform {
  const injector = Injector.create({
    providers: [...getBuildPlatformInjectConfig(platform)],
  });
  const buildPlatform = injector.get(BuildPlatform);
  buildPlatform.fileExtname.config =
    buildPlatform.fileExtname.config || '.json';
  return buildPlatform;
}

export function runViteBuilder(
  options: ViteMiniProgramBuildOptions,
  context: BuilderContext,
): Observable<BuilderOutput> {
  return new Observable<BuilderOutput>((observer) => {
    let watcher: SourceWatcher | undefined;
    let closed = false;

    const baseOutputPath = path.resolve(
      context.workspaceRoot,
      options.outputPath,
    );
    const emitSuccess = () => {
      if (!closed) {
        observer.next({
          success: true,
          // 和 webpack browser builder 的输出契约对齐，spec 里靠这个定位产物
          baseOutputPath,
        } as BuilderOutput);
      }
    };

    void (async () => {
      try {
        const buildPlatform = getBuildPlatform(options.platform);
        const vite = await import('vite');

        const runOnce = async () => {
          // 每轮重新生成 config，入口 glob 重新展开，
          // 这样 watch 期间新增的入口文件能被拉进来
          const config = await createMiniProgramViteConfig({
            viteOptions: options,
            context,
            buildPlatform,
          });
          await vite.build(config);
        };

        await runOnce();

        if (!options.watch) {
          emitSuccess();
          observer.complete();
          return;
        }

        // watch：发现变动就重算入口 + 重跑一次 vite.build。
        // 不用 Vite 原生 watch，因为 Rolldown watch 不支持动态加 input。
        const entryPatterns = await generateEntryPatterns({
          pages: options.pages || [],
          components: options.components || [],
          workspaceRoot: context.workspaceRoot,
          context,
          buildPlatform,
        });
        const { absoluteProjectSourceRoot } = await resolveProjectRoots({
          workspaceRoot: context.workspaceRoot,
          context,
        });
        // 测试里走 harness 的 notify，真实环境退化成 fs.watch
        const factory = (
          context as unknown as {
            getWatcherFactory?: () => WatcherFactoryLike | undefined;
          }
        ).getWatcherFactory?.();

        let running = false;
        let queued = false;
        const rebuild = async () => {
          if (closed) {
            return;
          }
          if (running) {
            // 构建中又改了，排到下一轮
            queued = true;
            return;
          }
          running = true;
          try {
            await runOnce();
            emitSuccess();
          } catch (error) {
            context.logger.error(String((error as Error)?.message ?? error));
            if (!closed) {
              observer.next({ success: false } as BuilderOutput);
            }
          } finally {
            running = false;
            if (queued && !closed) {
              queued = false;
              void rebuild();
            }
          }
        };

        watcher = watchSources({
          directories: collectWatchDirectories({
            workspaceRoot: context.workspaceRoot,
            sourceRoot: getSystemPath(absoluteProjectSourceRoot),
            entrySrcPaths: [
              ...entryPatterns.pageList,
              ...entryPatterns.componentList,
            ].map((p) => p.src),
          }),
          factory,
          onChange: () => void rebuild(),
        });

        // 注意顺序：watcher 必须先注册好，再推第一次成功输出。
        // 否则消费方（包括测试）在收到第一轮结果后立刻改文件，
        // 那个改动会发生在 watcher 注册之前，直接丢掉。
        emitSuccess();
      } catch (error) {
        context.logger.error(String((error as Error)?.message ?? error));
        if (!closed) {
          observer.next({ success: false } as BuilderOutput);
          observer.complete();
        }
      }
    })();

    return () => {
      closed = true;
      watcher?.close();
    };
  });
}

export default createBuilder(
  runViteBuilder as unknown as (
    options: ViteMiniProgramBuildOptions,
    context: BuilderContext,
  ) => Observable<BuilderOutput>,
);

export { changeComponent, LIBRARY_OUTPUT_ROOTDIR };
