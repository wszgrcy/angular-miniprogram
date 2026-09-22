import type { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { createBuilder } from '@angular-devkit/architect';
import type { AssetPattern } from '@angular-devkit/build-angular';
import * as path from 'path';
import { Observable } from 'rxjs';
import { Injector } from 'static-injector';
import type { AliasOptions, InlineConfig } from 'vite';
import { LibraryTemplateScopeService } from '../application/library-template-scope.service';
import { changeComponent } from '../component-template-inject/change-component';
import { LIBRARY_OUTPUT_ROOTDIR } from '../library';
import { BuildPlatform, PlatformType } from '../platform/platform';
import { getBuildPlatformInjectConfig } from '../platform/platform-inject-config';
import {
  generateEntryPatterns,
  resolveProjectRoots,
  toRollupInput,
} from './entry-patterns';
import { miniProgramComponentTransformPlugin } from './plugins/component-transform.plugin';
import { libraryTemplatePlugin } from './plugins/library-template.plugin';
import { miniProgramAssetsPlugin } from './plugins/mini-program-assets.plugin';
import { tsConfigPathsToAliases } from './tsconfig-paths';

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
}

/**
 * 由 BuildPlatform 推出来的 define，替代 webpack 的 DefinePlugin。
 * 映射关系与 webpack-configuration-change.service.ts 的 globalVariableChange 一致。
 */
export function buildPlatformDefine(
  buildPlatform: BuildPlatform,
  isProduction: boolean
): Record<string, string> {
  const p = buildPlatform.globalVariablePrefix;
  const g = buildPlatform.globalObject;
  const define: Record<string, string> = {
    global: `${g}.__global`,
    window: `${p}`,
    globalThis: `${p}`,
    setTimeout: `${p}.setTimeout`,
    clearTimeout: `${p}.clearTimeout`,
    setInterval: `${p}.setInterval`,
    clearInterval: `${p}.clearInterval`,
    Promise: `${p}.Promise`,
    Reflect: `${p}.Reflect`,
    requestAnimationFrame: `${p}.requestAnimationFrame`,
    cancelAnimationFrame: `${p}.cancelAnimationFrame`,
    performance: `${p}.performance`,
    navigator: `${p}.navigator`,
    wx: g,
    miniProgramPlatform: `"${g}"`,
    queueMicrotask: `${p}.queueMicrotask`,
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
  buildPlatform: BuildPlatform
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
  extra: Record<string, string> = {}
): AliasOptions {
  return { ...extra };
}

/**
 * Vite 侧的完整 alias：tsconfig paths + 平台包替换。
 *
 * 平台替换必须排在 tsconfig paths 之前生效，否则 `angular-miniprogram/platform`
 * 这种前缀 alias 会把 `angular-miniprogram/platform/wx` 抢走。
 */
export function buildViteAlias(
  buildPlatform: BuildPlatform,
  tsConfigPath: string,
  workspaceRoot: string
): AliasOptions {
  const tsAliases = tsConfigPathsToAliases(
    path.resolve(workspaceRoot, tsConfigPath)
  );
  const list: { find: string | RegExp; replacement: string }[] = [
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
        context.workspaceRoot
      ),
    },
    plugins: [
      ...angular({
        tsconfig: viteOptions.tsConfig,
        workspaceRoot: context.workspaceRoot,
        fastCompile: false,
        experimental: { useAngularCompilationAPI: true },
      }),
      libraryTemplatePlugin({ buildPlatform, templateScope }),
      miniProgramComponentTransformPlugin(),
      miniProgramAssetsPlugin({
        tsConfig: viteOptions.tsConfig,
        workspaceRoot: context.workspaceRoot,
        buildPlatform,
        entryPatterns: allEntries,
        context,
        watch: false,
        templateScope,
        assets: viteOptions.assets,
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
        input: toRollupInput(allEntries),
        output: {
          // key 里带目录，Rollup 的 [name] 会把整段展开进来，
          // 于是能产出 `pages/index/index-entry.js` 这种和 webpack 时代
          // outputFiles.logic 对齐的路径
          entryFileNames: '[name].js',
          chunkFileNames: '[name]-[hash].js',
          assetFileNames: '[name].[ext]',
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
  context: BuilderContext
): Observable<BuilderOutput> {
  return new Observable<BuilderOutput>((observer) => {
    void (async () => {
      try {
        const buildPlatform = getBuildPlatform(options.platform);
        const config = await createMiniProgramViteConfig({
          viteOptions: options,
          context,
          buildPlatform,
        });
        const vite = await import('vite');
        await vite.build(config);
        observer.next({
          success: true,
          // 和 webpack browser builder 的输出契约对齐，spec 里靠这个定位产物
          baseOutputPath: path.resolve(
            context.workspaceRoot,
            options.outputPath
          ),
        } as BuilderOutput);
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
  runViteBuilder as unknown as (
    options: ViteMiniProgramBuildOptions,
    context: BuilderContext
  ) => Observable<BuilderOutput>
);

export { changeComponent, LIBRARY_OUTPUT_ROOTDIR };
