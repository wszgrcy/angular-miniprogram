import type { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { createBuilder } from '@angular-devkit/architect';
import type { AssetPattern } from '@angular-devkit/build-angular';
import { getSystemPath } from '@angular-devkit/core';
import * as path from 'path';
import { Observable } from 'rxjs';
import { Injector } from 'static-injector';
import type { InlineConfig } from 'vite';
import { changeComponent } from '../component-template-inject/change-component';
import { LIBRARY_OUTPUT_ROOTDIR } from '../library';
import {
  clearLibraryMetaMisses,
  formatLibraryMetaSummary,
} from '../library/library-meta-diagnostics';
import type { TagNameClassMode } from '../mini-program-compiler/tag-mapping';
import type { WxsAnalysisRef } from '../mini-program-compiler/type';
import { BuildPlatform, PlatformType } from '../platform/platform';
import { getBuildPlatformInjectConfig } from '../platform/platform-inject-config';
import { LibraryTemplateScopeService } from '../shared/library-template-scope.service';
import type { MpSubPackagePattern } from '../shared/type';
import type { BudgetEntry } from '../util/angular-build-compat';
import { toPosixPath } from '../util/path';
import { type MpAppConfig, getSubPackages } from './app-config';
import { applyMpViteConfig } from './config-hook';
import {
  generateEntryPatterns,
  resolveProjectRoots,
  toRollupInput,
} from './entry-patterns';
import type { MpConfigValidateLevel } from './mp-config';
import {
  groupSubPackages,
  prepareMpConfigs,
  reportMpConfigDiagnostics,
} from './mp-config';
import {
  type OptimizationOption,
  type OutputHashing,
  type SourceMapOption,
  isExternalSpecifier,
  mergeDefine,
  resolveCssPreprocessorOptions,
  resolveOptimization,
  resolveOutputNames,
  resolveSourcemap,
  toAbsoluteFileReplacements,
} from './options';
import { platformConditionDefine } from './platform-flags';
import { budgetsPlugin } from './plugins/budgets.plugin';
import { miniProgramComponentTransformPlugin } from './plugins/component-transform.plugin';
import { entryBootstrapPlugin } from './plugins/entry-bootstrap.plugin';
import { libraryTemplatePlugin } from './plugins/library-template.plugin';
import { miniProgramAssetsPlugin } from './plugins/mini-program-assets.plugin';
import { nativeComponentsPlugin } from './plugins/native-components.plugin';
import { platformFileResolvePlugin } from './plugins/platform-file-resolve.plugin';
import { subpackageChunkPlugin } from './plugins/subpackage-chunk.plugin';
import { wxsStripPlugin } from './plugins/wxs-strip.plugin';
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
  /**
   * 分包入口，写法与 `pages` 一样，`output` 就是分包 root。
   * 配了就不用在 app 配置里写 `subpackages`；app 配置里写了同一个 root 以其为准。
   */
  subpackages?: MpSubPackagePattern[];
  /**
   * 自定义 tabBar 入口的源文件位置，产物目录由平台定，不配默认取
   * `<sourceRoot>/custom-tab-bar` 下的 `*.entry.ts`。
   */
  customTabbar?: AssetPattern[];
  platform: PlatformType;
  assets?: AssetPattern[];
  styles?: (string | { input: string })[];
  sourceMap?: SourceMapOption;
  /** 与 angular.json `build.options.polyfills` 同名同义，每条都会被 import 进 polyfills 入口，包名和本地文件都收。 */
  polyfills?: string | string[];
  optimization?: OptimizationOption;
  /** 监听模式：微信开发者工具盯着 dist 目录 */
  watch?: boolean;
  /**
   * 强制单例的包，透传给 Vite 的 `resolve.dedupe`。默认空，
   * 只有 `file:` / `npm link` 接入本库时才需要，否则 @angular/core 会被打成两份。
   */
  dedupe?: string[];
  /**
   * 结构化 app 配置源文件（相对 workspaceRoot，如 src/app.config.json）。
   * 与 assets 里的静态 app.json 不是二选一：静态那份是底稿，这个文件只写要补的字段。
   */
  appJson?: string;
  /** 结构化 project 配置源文件（相对 workspaceRoot），与 `appJson` 各管一个输出文件，字段不互通。 */
  projectConfig?: string;
  /** app 配置校验严格度，默认 `error`，只作用于 `appJson` 通道。 */
  appJsonValidate?: MpConfigValidateLevel;
  /** 自动生成 project 配置的调试启动项（`condition`），默认关。 */
  deriveCondition?: boolean;
  /**
   * 原生小程序自定义组件目录（相对 workspaceRoot，如 wxcomponents）。
   * 配置后整个目录拷进产物，模板里命中原生标签自动注入 usingComponents。
   */
  nativeComponentsDir?: string;
  /** 文件替换，CLI 标准形状：[{ replace, with }] */
  fileReplacements?: {
    replace: string;
    with: string;
  }[];
  /** scss / sass 的 includePaths 与 sass 编译器选项 */
  stylePreprocessorOptions?: {
    includePaths?: string[];
    sass?: Record<string, unknown>;
  };
  /** `@Component.styles` 内联样式的语言，默认 'css'。 */
  inlineStyleLanguage?: string;
  /** app 引导入口（src/main.ts），内容是 `bootstrapApplication({ providers: [...] })`。 */
  main?: string;
  /** 产物模块格式，默认 'cjs'。小程序运行时是 CommonJS，不原生支持 ESM。 */
  format?: 'cjs' | 'es';
  /** 产物文件名的 hash 策略，见 `resolveOutputNames` */
  outputHashing?: OutputHashing;
  /** 构建前是否清空 outputPath，对应 vite 的 `build.emptyOutDir` */
  deleteOutputPath?: boolean;
  /** 模块解析是否还原软链接，透传 vite `resolve.preserveSymlinks` */
  preserveSymlinks?: boolean;
  /** 用户侧 define，与平台 define 合并（平台优先），见 `mergeDefine` */
  define?: Record<string, string>;
  /** 条件导出解析条件，透传 vite `resolve.conditions` */
  conditions?: string[];
  /** 不打包、运行时依赖外部提供的包名 */
  externalDependencies?: string[];
  /**
   * 自定义 vite 配置的钩子文件（相对 workspaceRoot）。文件默认导出
   * `(config, ctx) => config`，`config` 是构建器组装完的最终 vite 配置。
   * `.ts` / `.mts` / `.cts` 由 jiti 加载，`.js` / `.mjs` / `.cjs` 走原生 import。
   */
  viteConfig?: string;
  /** 产物体积预算，判定逻辑复用 @angular/build，见 budgets.plugin */
  budgets?: BudgetEntry[];
  /** 产出 stats.json（各文件体积清单） */
  statsJson?: boolean;
  /**
   * `tag-name-<原标签>` 标记的输出策略，默认 `mapped`。
   * 这个标记是给「模板写 `div`、wxml 里已经是 `view`」补的选中把手。
   */
  tagNameClass?: TagNameClassMode;
}

/** 由 BuildPlatform 推出来的 define，把全局对象 / 平台变量编译期重定向。 */
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
    // 微信没有 AbortController / AbortSignal，裸引用重定向到全局能力表，
    // 表里的值由 polyfill-entry.js 导出，两侧必须配套
    AbortController: `${p}.AbortController`,
    AbortSignal: `${p}.AbortSignal`,
    /**
     * 小程序里没有 `Node`，编译期直接换掉。Angular 的 `walkIcuTree` 等要读
     * `Node.TEXT_NODE`，`assertDomNode` 又要 `instanceof Node`，所以只能指向
     * 运行期挂在能力表上的 `AgentNode`。
     */
    Node: `${p}.AgentNode`,
    /** Angular 产物里的 i18n 常量是裸 `$localize` 调用，小程序里没有这个全局，重定向到能力表。 */
    $localize: `${p}.$localize`,
  };
  if (!isProduction) {
    define['ngDevMode'] = `${g}.__global.ngDevMode`;
  }
  return define;
}

/**
 * polyfills 入口的虚拟模块 id。我们自己的 `polyfill-entry.js` 固定要装，
 * 用户 `polyfills` 里声明的条目跟在后面。
 */
export const POLYFILL_ENTRY_ID = 'angular-miniprogram:polyfills';

/** 条目是不是本地文件：以 `.` 开头、或带 js/ts 扩展名。 */
export function isLocalPolyfill(entry: string): boolean {
  return entry.startsWith('.') || /\.[cm]?[jt]sx?$/.test(entry);
}

/** angular.json 的 `polyfills` → 条目数组，不做任何过滤。 */
export function normalizePolyfills(
  polyfills: string | string[] | undefined,
): string[] {
  return ([] as string[]).concat(polyfills ?? []);
}

/**
 * 单条 `polyfills` 声明 → 能交给解析器的模块标识。
 * 包名原样交给 Vite，本地文件拼成绝对路径。
 */
export function toPolyfillSpecifier(
  entry: string,
  workspaceRoot: string,
): string {
  return isLocalPolyfill(entry) ? path.resolve(workspaceRoot, entry) : entry;
}

/** 把 angular.json 的 `polyfills` 翻成 polyfills 入口的模块内容。 */
export function polyfillEntryContents(
  selfEntry: string,
  polyfills: readonly string[],
  workspaceRoot: string,
): string {
  const lines = [
    // polyfill-entry 只往 globalThis 上挂东西、不导出有用值，裸 `import "x"`
    // 会被 rolldown 判成无副作用整块摇掉，所以接住命名空间再引用一次
    `import * as __mpPolyfills from ${JSON.stringify(selfEntry)};`,
    `globalThis.__mpPolyfills = __mpPolyfills;`,
  ];
  for (const entry of polyfills) {
    lines.push(
      `import ${JSON.stringify(toPolyfillSpecifier(entry, workspaceRoot))};`,
    );
  }
  return lines.join('\n');
}

export function polyfillEntryPlugin(
  selfEntry: string,
  polyfills: readonly string[],
  workspaceRoot: string,
): import('vite').Plugin {
  return {
    name: 'angular-miniprogram:polyfill-entry',
    enforce: 'pre',
    resolveId(id) {
      return id === POLYFILL_ENTRY_ID ? POLYFILL_ENTRY_ID : null;
    },
    load(id) {
      if (id !== POLYFILL_ENTRY_ID) {
        return null;
      }
      return polyfillEntryContents(selfEntry, polyfills, workspaceRoot);
    },
  };
}

/**
 * 平台包替换：`angular-miniprogram/platform/wx` -> 实际平台包。
 * 必须用 RegExp 带边界：Vite 的字符串 alias 走的是「精确 或 startsWith」。
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

/**
 * Vite 侧的完整 alias：平台包替换 + tsconfig paths。
 * 平台替换必须排在前面，否则 `angular-miniprogram/platform` 这种前缀 alias 会把它抢走。
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
 * 组装 Vite 配置。插件顺序很关键：analog 插件负责 Angular AOT，
 * componentTransform 插件（enforce: 'post'）拿 AOT 产物注入 propertyChange。
 */
export async function createMiniProgramViteConfig(options: {
  viteOptions: ViteMiniProgramBuildOptions;
  context: BuilderContext;
  buildPlatform: BuildPlatform;
  extraPlugins?: import('vite').Plugin[];
  root?: string;
}): Promise<InlineConfig> {
  const { viteOptions, context, buildPlatform } = options;
  const optimization = resolveOptimization(viteOptions.optimization);
  const isProduction = optimization.isProduction;
  const outputNames = resolveOutputNames(viteOptions.outputHashing);
  const polyfills = normalizePolyfills(viteOptions.polyfills);

  const entryPatterns = await generateEntryPatterns({
    pages: viteOptions.pages || [],
    subpackages: viteOptions.subpackages,
    customTabbar: viteOptions.customTabbar,
    workspaceRoot: context.workspaceRoot,
    context,
    buildPlatform,
    tsConfig: viteOptions.tsConfig,
  });
  const allEntries = [
    ...entryPatterns.pageList,
    ...entryPatterns.subPackageList,
    ...entryPatterns.componentList,
    ...entryPatterns.tabbarList,
  ];
  context.logger.info(
    `[小程序构建] 平台 ${viteOptions.platform}，` +
      `页面 ${entryPatterns.pageList.length} 个` +
      (entryPatterns.subPackageList.length
        ? `（另分包内 ${entryPatterns.subPackageList.length} 个）`
        : '') +
      `、` +
      `组件 ${entryPatterns.componentList.length} 个、` +
      `自定义 tabBar ${entryPatterns.tabbarList.length} 个，` +
      `输出 ${viteOptions.outputPath}` +
      `（${isProduction ? 'production' : 'development'}）`,
  );
  const { absoluteProjectRoot, absoluteProjectSourceRoot } =
    await resolveProjectRoots({
      workspaceRoot: context.workspaceRoot,
      context,
    });
  // assets 插件和 library 插件必须共享同一个 scope service，
  // 前者读后者注册的 useComponents / templateList
  const templateScope = new LibraryTemplateScopeService();

  // 配置文件：静态那份 + 结构化那份 + 构建器补的，在这里算一次，之后所有消费方读同一份结果
  const builtPagePaths = [
    ...entryPatterns.pageList,
    ...entryPatterns.subPackageList,
  ].map((p) => toPosixPath(p.outputFiles.path));
  const builtTabbarPaths = entryPatterns.tabbarList.map((p) =>
    toPosixPath(p.outputFiles.path),
  );
  // 分包声明不用手写：pattern 的 output 就是 root，pages 从扫出来的入口算。
  // 用户自己在 app 配置里写了同一个 root 就以他那份为准。
  const derivedSubPackages = groupSubPackages(
    entryPatterns.subPackageList.map((p) => ({
      path: toPosixPath(p.outputFiles.path),
      root: p.output,
      independent: p.independent,
    })),
  );
  const mpConfigs = await prepareMpConfigs({
    workspaceRoot: context.workspaceRoot,
    platform: buildPlatform,
    platformType: viteOptions.platform,
    assetPatterns: viteOptions.assets,
    absoluteProjectRoot,
    absoluteProjectSourceRoot,
    appJson: viteOptions.appJson,
    projectConfig: viteOptions.projectConfig,
    appJsonValidate: viteOptions.appJsonValidate,
    deriveCondition: viteOptions.deriveCondition,
    derivedSubPackages,
    builtPagePaths,
    builtTabbarPaths,
  });
  reportMpConfigDiagnostics(mpConfigs, context.logger);

  // 分包：有分包才挂分包插件
  let subpackagePlugin: import('vite').Plugin[] = [];
  const appConfig = mpConfigs.app.config as MpAppConfig;
  if (getSubPackages(appConfig).length) {
    subpackagePlugin = [
      subpackageChunkPlugin({
        appConfig,
        sourceRoot: getSystemPath(absoluteProjectSourceRoot),
        chunkFileNames: outputNames.chunkFileNames,
      }),
    ];
  }

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

  /**
   * 与 analog 共享的 fileReplacements 数组实例。analog 存的是引用、读得晚，
   * 我们只需在 `enforce: 'pre'` 的 buildStart 里往这个数组 push。
   */
  /** 分析层结果共享引用：assets 插件填，wxs-strip 插件读 */
  const wxsAnalysisRef: {
    current: WxsAnalysisRef;
  } = { current: null };
  const sharedFileReplacements: Array<{ replace: string; with: string }> = [
    ...toAbsoluteFileReplacements(
      viteOptions.fileReplacements,
      context.workspaceRoot,
    ),
  ];

  const config: InlineConfig = {
    root: options.root ?? context.workspaceRoot,
    configFile: false,
    mode: isProduction ? 'production' : 'development',
    // 'warn' 会把 vite 自己的「building / transformed / 产物清单」全吞掉，
    // 用户只看到命令一闪而过，分不清是成功还是静默失败。
    logLevel: 'info',
    define: mergeDefine(
      viteOptions.define,
      // 平台 define 在后：global / window / wx / ngDevMode 这些是运行时
      // 能不能跑的关键，用户配同名 key 也不能把它们换掉
      buildPlatformDefine(buildPlatform, isProduction),
      // 条件编译：__MP_WX__ 等布尔常量，死分支由 bundler DCE 移除
      platformConditionDefine(viteOptions.platform),
    ),
    resolve: {
      alias: buildViteAlias(
        buildPlatform,
        viteOptions.tsConfig,
        context.workspaceRoot,
      ),
      // 单例包由消费者在 angular.json 里显式声明（`dedupe` 选项）。
      // 默认空——不往模块解析里注入任何东西。link 接入时才需要，
      // 详见下面两处 angular.json 里的写法。
      dedupe: viteOptions.dedupe ?? [],
      // npm link / file: 接入时关掉，否则同一个包会被当成两份不同文件
      preserveSymlinks: viteOptions.preserveSymlinks,
      // vite 的默认 condition 是追加而非覆盖，空数组等于不干预
      conditions: viteOptions.conditions,
    },
    // scss / sass 的 includePaths 与 sass 编译器选项。不接 includePaths
    // 的话项目里 `@import 'variables'` 这种写法会直接编译失败。
    css: {
      preprocessorOptions: resolveCssPreprocessorOptions(
        viteOptions.stylePreprocessorOptions,
        context.workspaceRoot,
      ),
    },
    plugins: [
      // 入口注册（bootstrapPage / componentRegistry / bootstrapCustomTabbar）
      // 由构建器注入，所以必须 enforce: 'pre' 抢在 vite 解析器前面认领虚拟 id
      entryBootstrapPlugin({ entries: allEntries }),
      // 文件级条件编译（foo.wx.ts 优先），必须 enforce: 'pre' 抢在
      // 其他 resolver 前，故放数组首位
      platformFileResolvePlugin({ platform: viteOptions.platform }),
      /**
       * 必须排在 wxsStrip 之前：分析层产出的模板 AST 是剥离的唯一真相源。
       * 它自己只读磁盘，不依赖模块图。
       */
      miniProgramAssetsPlugin({
        tsConfig: viteOptions.tsConfig,
        workspaceRoot: context.workspaceRoot,
        buildPlatform,
        entryPatterns: allEntries,
        context,
        watch: !!viteOptions.watch,
        templateScope,
        assets: mpConfigs.assets,
        mpConfigs,
        styles: viteOptions.styles,
        inlineStyleLanguage: viteOptions.inlineStyleLanguage,
        absoluteProjectRoot,
        absoluteProjectSourceRoot,
        analysisRef: wxsAnalysisRef,
      }),
      // 必须排在 analog 之前：wxs 组件的替换项要在 Angular 建 program 前就位
      wxsStripPlugin({
        workspaceRoot: context.workspaceRoot,
        cacheDir: path.resolve(context.workspaceRoot, '.ng-cache'),
        fileReplacements: sharedFileReplacements,
        analysisRef: wxsAnalysisRef,
        watch: !!viteOptions.watch,
      }),
      ...angular({
        tsconfig: viteOptions.tsConfig,
        workspaceRoot: context.workspaceRoot,
        fastCompile: false,
        experimental: { useAngularCompilationAPI: true },
        // `@Component.styles` 内联样式的语言，不传的话 analog 一律当 css
        inlineStylesExtension: viteOptions.inlineStyleLanguage,
        // fileReplacements 是 Angular 切环境的标准机制（environment.prod.ts），
        // 传我们自己的数组实例，wxs 剥离的替换项由上面的插件就地 push
        fileReplacements: sharedFileReplacements,
      }),
      polyfillEntryPlugin(
        path.resolve(__dirname, '../platform/template/polyfill-entry.js'),
        polyfills,
        context.workspaceRoot,
      ),
      libraryTemplatePlugin({ buildPlatform, templateScope }),
      miniProgramComponentTransformPlugin(),
      ...subpackagePlugin,
      // budgets / statsJson 都要遍历最终 bundle，合成一个插件；
      // 两个都没配就完全不挂，连 @angular/build 都不用加载
      ...(viteOptions.budgets?.length || viteOptions.statsJson
        ? [
            budgetsPlugin({
              budgets: viteOptions.budgets,
              statsJson: viteOptions.statsJson,
              logger: context.logger,
            }),
          ]
        : []),
      ...(viteOptions.nativeComponentsDir
        ? [
            nativeComponentsPlugin({
              nativeComponentsDir: viteOptions.nativeComponentsDir,
              workspaceRoot: context.workspaceRoot,
              fileExtname: buildPlatform.fileExtname,
            }),
          ]
        : []),
      ...(options.extraPlugins || []),
    ],
    build: {
      outDir: viteOptions.outputPath,
      emptyOutDir: viteOptions.deleteOutputPath !== false,
      sourcemap: resolveSourcemap(viteOptions.sourceMap),
      minify: optimization.minifyScripts,
      cssMinify: optimization.minifyStyles,
      assetsInlineLimit: 0,
      rollupOptions: {
        // `externalDependencies` 语义跟 @angular/build 一致：`@foo/bar`
        // 连子路径一起算外部，产物里保留 require('...')
        external: viteOptions.externalDependencies?.length
          ? (id: string) =>
              isExternalSpecifier(id, viteOptions.externalDependencies ?? [])
          : undefined,
        input: {
          // 全局 polyfill 入口，必须排在 require 列表最前面，
          // 保证 AbortController 等在任何业务 chunk 之前装好
          // 入口是个虚拟模块：我们那份固定装，`@angular/localize/init` 只在声明了才拼进来
          polyfills: POLYFILL_ENTRY_ID,
          ...toRollupInput(allEntries),
          // app 引导入口，key 固定叫 main，产物 main.js
          ...(viteOptions.main
            ? {
                main: path.resolve(context.workspaceRoot, viteOptions.main),
              }
            : {}),
        },
        output: {
          // key 里带目录，Rollup 的 [name] 会把整段展开进来，
          // 于是能产出 `pages/index/index-entry.js` 这种路径
          entryFileNames: '[name].js',
          chunkFileNames: outputNames.chunkFileNames,
          assetFileNames: outputNames.assetFileNames,
          // 小程序运行时是 CommonJS，默认出 cjs；扩展名仍然要 .js，小程序只认 .js
          format: viteOptions.format ?? 'cjs',
          // 多入口 + cjs 时，named / default 混用会让 Rollup 犹豫，
          // auto 让它按实际导出形态决定，避免额外包一层 default
          exports: 'auto',
        },
      },
    },
  };

  // 钩子排在最后：它看到的必须是自己真正会交给 vite 的那份配置，
  // 而不是某个中间态。
  return applyMpViteConfig(config, {
    viteConfig: viteOptions.viteConfig,
    target: 'application',
    platform: viteOptions.platform,
    isProduction,
    workspaceRoot: context.workspaceRoot,
    tsConfig: viteOptions.tsConfig,
    logger: context.logger,
  });
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

/**
 * vite / rollup 的 PluginError 把插件名、出错文件、代码帧都挂在 error 对象上，
 * `String(error.message)` 只剩第一行。
 */
function formatBuildError(error: unknown): string {
  const e = error as {
    message?: string;
    plugin?: string;
    id?: string;
    loc?: { file?: string; line?: number; column?: number };
    frame?: string;
  };
  const parts = [e?.message ?? String(error)];
  if (e?.plugin) {
    parts.push(`插件：${e.plugin}`);
  }
  const file = e?.loc?.file || e?.id;
  if (file) {
    const line = e?.loc?.line;
    const column = e?.loc?.column;
    parts.push(
      `文件：${file}${line ? `:${line}${column ? `:${column}` : ''}` : ''}`,
    );
  }
  if (e?.frame) {
    parts.push(e.frame);
  }
  return parts.join('\n');
}

/**
 * 结构化配置选项指向的文件，watch 要显式盯上。这些选项可以指到 sourceRoot 外面，
 * 不显式加进来就是「改了没反应」。
 */
export function mpConfigWatchFiles(
  options: ViteMiniProgramBuildOptions,
  workspaceRoot: string,
): string[] {
  return [options.appJson, options.projectConfig, options.viteConfig]
    .filter((p): p is string => !!p)
    .map((p) => path.resolve(workspaceRoot, p));
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
          // 输出契约，spec 里靠这个定位产物
          baseOutputPath,
        } as BuilderOutput);
      }
    };

    void (async () => {
      try {
        const buildPlatform = getBuildPlatform(options.platform);
        // BuildPlatform 构造时就把 transform 装配进了 WxContainer 全局配置，
        // 重跑一次 init 才能把选项带进去
        buildPlatform.templateTransform.tagNameClass =
          options.tagNameClass ?? 'mapped';
        buildPlatform.templateTransform.init();
        const vite = await import('vite');

        const runOnce = async () => {
          // 每轮开头清空上一轮的库元数据缺失记录，否则汇总会跨轮累加
          clearLibraryMetaMisses();
          const startedAt = Date.now();
          const elapsed = () =>
            `${((Date.now() - startedAt) / 1000).toFixed(2)}s`;
          // 每轮重新生成 config，入口 glob 重新展开，
          // 这样 watch 期间新增的入口文件能被拉进来
          const config = await createMiniProgramViteConfig({
            viteOptions: options,
            context,
            buildPlatform,
          });
          context.logger.info('[小程序构建] vite build 开始…');
          await vite.build(config);
          context.logger.info(`[小程序构建] 完成，耗时 ${elapsed()}`);
          // 把没拿到库元数据的指令显式报出来，避免静默丢事件绑定
          const metaSummary = formatLibraryMetaSummary();
          if (metaSummary) {
            context.logger.warn(`[library-meta] ${metaSummary}`);
          }
        };

        await runOnce();

        if (!options.watch) {
          emitSuccess();
          observer.complete();
          return;
        }

        // 不用 Vite 原生 watch，因为 Rolldown watch 不支持动态加 input
        const entryPatterns = await generateEntryPatterns({
          pages: options.pages || [],
          subpackages: options.subpackages,
          customTabbar: options.customTabbar,
          workspaceRoot: context.workspaceRoot,
          context,
          buildPlatform,
          tsConfig: options.tsConfig,
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
            context.logger.error(formatBuildError(error));
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
              ...entryPatterns.subPackageList,
              ...entryPatterns.componentList,
              ...entryPatterns.tabbarList,
            ].map((p) => p.src),
          }),
          files: mpConfigWatchFiles(options, context.workspaceRoot),
          factory,
          onChange: () => void rebuild(),
        });

        // 顺序：watcher 先注册好，再推第一次成功输出，
        // 否则消费方收到第一轮结果后立刻改文件会丢在注册之前
        emitSuccess();
      } catch (error) {
        context.logger.error(formatBuildError(error));
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
