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
   * 分包入口：写法与 `pages` 一样，`output` 就是分包 root。
   *
   * 配了就不用在 app 配置里写 `subpackages`：root 取 `output`，分包页由扫出来的
   * 入口算，`independent: true` 标独立分包。自己在 app 配置里写了同一个 root
   * 就以自己那份为准，构建器只补漏写的子字段。
   *
   * 约定 root 同时是源码目录与产物目录（`src/packageA` → `packageA`），
   * 分包专属 chunk 靠它归位。
   */
  subpackages?: MpSubPackagePattern[];
  /**
   * 自定义 tabBar 入口的**源文件位置**。
   *
   * 产物目录由平台定（`BuildPlatform.customTabbar.dir`：微信系 `custom-tab-bar`，
   * 支付宝 `customize-tab-bar`），这里配了 `output` 也会被覆盖；
   * 平台不支持自定义 tabBar 时扫到入口直接报错。
   *
   * 不配则默认取 `<sourceRoot>/custom-tab-bar` 下的 `*.entry.ts`。
   */
  customTabbar?: AssetPattern[];
  platform: PlatformType;
  assets?: AssetPattern[];
  styles?: (string | { input: string })[];
  sourceMap?: SourceMapOption;
  /**
   * 与 angular.json `build.options.polyfills` 同名同义：每条都会被 import 进
   * polyfills 入口，包名和本地文件都收，语义跟 `@angular/build` 的 browser
   * 路径一致（见 `polyfillEntryContents`）。
   *
   * 与 schema 一样允许单个串（`"polyfills": "src/polyfills.ts"` 这种写法很常见）。
   */
  polyfills?: string | string[];
  optimization?: OptimizationOption;
  /** 监听模式：对应小程序的开发方式（微信开发者工具盯着 dist 目录） */
  watch?: boolean;
  /**
   * 强制单例的包，直接透传给 Vite 的 `resolve.dedupe`。
   *
   * 默认空。只有 `file:` / `npm link` 接入本库时才需要：link 的
   * 那份副本自带 node_modules，里面还有一份 @angular/core，不去重
   * 就会被打成两份，运行时表现为 `No provider for xxx`。
   */
  dedupe?: string[];
  /**
   * 结构化 app 配置源文件（相对 workspaceRoot，如 src/app.config.json）。
   *
   * 与 assets 里的静态 app.json **不是二选一**：静态那份是底稿，这个文件只写
   * 要补的字段，已经写过的 key 一律不动，`pages` 是追加。环境不同就换这个文件
   * （configurations 里改 `appJson`），平台不同用文件里的 `_platform` 段。
   */
  appJson?: string;
  /**
   * 结构化 project 配置源文件（相对 workspaceRoot）。
   *
   * 与 `appJson` 各管一个输出文件，字段不互通：两个文件的字段名有重叠风险，
   * 混在一份里写错了不报错只是「改了没效果」。
   */
  projectConfig?: string;
  /**
   * app 配置校验严格度，默认 `error`。
   *
   * 只作用于 `appJson` 通道；只有静态 app.json 的工程固定 `warn`（那是从别的
   * 项目搬过来的，合规与否我们控制不了）。`off` 用于先绕过校验把工程跑起来。
   */
  appJsonValidate?: MpConfigValidateLevel;
  /**
   * 自动生成 project 配置的调试启动项（`condition`）。默认关，只是方便一下。
   *
   * 开了之后开发者工具的「编译模式」会列出全部页面；需要精确控制启动参数
   * 还是自己在 `projectConfig` 里写。
   */
  deriveCondition?: boolean;
  /**
   * 原生小程序自定义组件目录（相对 workspaceRoot，如 wxcomponents）。
   * 配置后整个目录拷进产物，模板里命中原生标签自动注入 usingComponents。
   */
  nativeComponentsDir?: string;
  /**
   * 文件替换，CLI 标准形状：[{ replace: 'src/environments/environment.ts',
   * with: 'src/environments/environment.prod.ts' }]
   */
  fileReplacements?: {
    replace: string;
    with: string;
  }[];
  /** scss / sass 的 includePaths 与 sass 编译器选项 */
  stylePreprocessorOptions?: {
    includePaths?: string[];
    sass?: Record<string, unknown>;
  };
  /**
   * `@Component.styles` 内联样式的语言，默认 'css'。
   *
   * schema 早就声明了这个字段，但之前没人读：内联样式一律被当 css，
   * 写 scss 嵌套的组件静默产出一份空 wxss。
   */
  inlineStyleLanguage?: string;
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
   * 自定义 vite 配置的钩子文件（相对 workspaceRoot）。
   *
   * 文件默认导出 `(config, ctx) => config`：`config` 是构建器组装完的最终
   * vite 配置，随便改，返回新对象或就地改都行。构建器不校验钩子的改动 ——
   * 默认配置是对的，钩子改坏了由钩子负责。
   *
   * `.ts` / `.mts` / `.cts` 由 jiti 加载，`.js` / `.mjs` / `.cjs` 走原生 import。
   */
  viteConfig?: string;
  /** 产物体积预算，判定逻辑复用 @angular/build，见 budgets.plugin */
  budgets?: BudgetEntry[];
  /** 产出 stats.json（各文件体积清单） */
  statsJson?: boolean;
  /**
   * `tag-name-<原标签>` 标记的输出策略，默认 `mapped`。
   *
   * 这个标记是给「模板写 `div`、wxml 里已经是 `view`」补的选中把手。
   * 没改写过标签的元素带着它纯属多一个 class token，所以上下文里
   * 只有 `mapped` 才输出。详见 `tagNameClassOf()`。
   */
  tagNameClass?: TagNameClassMode;
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
    /**
     * `Node` 同理，而且更彻底：小程序里根本没有 `Node`，也不需要有个
     * 全局叫这个名字，所以**编译期直接把它换掉**，运行时压根不存在 `Node`
     * 这个标识符（实测微信小程序全局上没有 Node）。
     *
     * Angular 里两类用法都要它：
     *  - `walkIcuTree` / `applyCreateOpCodes` 读 `Node.TEXT_NODE` /
     *    `Node.COMMENT_NODE`，**不在 ngDevMode 守卫里**，生产也要；
     *  - `assertDomNode` 的 `node instanceof Node`，仅 ngDevMode。
     *
     * `instanceof` 要有真的构造器，所以只能指向运行期挂在能力表上的
     * `AgentNode`（由 `agent-node.ts` 挂，和 AbortController 一样是
     * 「define 重定向 + 表里得有值」两步，缺一步就 undefined）。
     */
    Node: `${p}.AgentNode`,
    /**
     * `$localize` 同理：Angular 编译产物里的 i18n 常量是裸 `$localize` 调用
     * （`i18n_0 = $localize(...)`），小程序里没有这个全局，第一次读 consts
     * 就 `ReferenceError`。重定向到能力表后，没装 `@angular/localize/init`
     * 也只是 `undefined`（不会抛），装了则由它自己往上挂。
     *
     * 本项目自己的 ICU 求值也读这个名字，见
     * `src/library/platform/default/icu.ts`。
     */
    $localize: `${p}.$localize`,
  };
  if (!isProduction) {
    define['ngDevMode'] = `${g}.__global.ngDevMode`;
  }
  return define;
}

/**
 * polyfills 入口的虚拟模块 id。
 *
 * 我们自己的 `polyfill-entry.js` 是固定要装的（小程序模板是纯文本内联、不过
 * bundler，全局能力表只能走入口），用户 `polyfills` 里声明的条目跟在后面。
 */
export const POLYFILL_ENTRY_ID = 'angular-miniprogram:polyfills';

/**
 * 条目是不是本地文件：以 `.` 开头、或带 js/ts 扩展名。
 *
 * 上游 `isLocalFile`（`tools/esbuild/application-code-bundle.ts`）还有一条
 * 「`zone.js` 及其子路径一律按包算」，那是给它自己 import zone 用的，本包
 * 照抄不过来。
 */
export function isLocalPolyfill(entry: string): boolean {
  return entry.startsWith('.') || /\.[cm]?[jt]sx?$/.test(entry);
}

/**
 * angular.json 的 `polyfills` → 条目数组。就是上游 `application/options.ts:478`
 * 那条归一（串也收），除此之外不做任何过滤：声明什么就 import 什么。
 */
export function normalizePolyfills(
  polyfills: string | string[] | undefined,
): string[] {
  return ([] as string[]).concat(polyfills ?? []);
}

/**
 * 单条 `polyfills` 声明 → 能交给解析器的模块标识。
 *
 * 包名原样交给 Vite（exports map / conditions / alias 与应用里其余依赖同一套，
 * 自己 require.resolve 在 monorepo 提升、`file:` 链接下会分叉）；本地文件拼成
 * 绝对路径（上游用 esbuild 的 `build.resolve('./x')` 试探，rolldown 在配置期
 * 没等价 API，判定口径与 `isLocalPolyfill` 一致）。
 *
 * 不做 `@angular/localize` → `/init` 的归一：那是上游 SSR 路径的事
 * （`createServerPolyfillBundleOptions`），小程序不是 SSR，按 browser 语义
 * 声明什么就 import 什么，`/init` 必须写全（`ng add @angular/localize`
 * 写的就是全路径；裸写法的后果见 `localize-polyfill.spec.ts`）。
 */
export function toPolyfillSpecifier(
  entry: string,
  workspaceRoot: string,
): string {
  return isLocalPolyfill(entry) ? path.resolve(workspaceRoot, entry) : entry;
}

/**
 * 把 angular.json 的 `polyfills` 翻成 polyfills 入口的模块内容。
 *
 * 结构对齐 `@angular/build` 的 `getEsBuildCommonPolyfillsOptions`：那边也是
 * 造一个虚拟模块，内容就是每条 polyfill 一个 `import`（上游
 * `application-code-bundle.ts:750`）。上游改了照着同步即可。
 *
 * 与上游只有一处结构差异：我们那份 `polyfill-entry.js` 固定在最前，所以上游
 * 「polyfills 为空就不产出 polyfills bundle」那条早退在这里不成立。
 */
export function polyfillEntryContents(
  selfEntry: string,
  polyfills: readonly string[],
  workspaceRoot: string,
): string {
  const lines = [
    // 必须把命名空间接住再引用一次：polyfill-entry 是 CJS 产物，只往
    // globalThis 上挂东西、不导出任何有用值，裸 `import "x"` 会被
    // rolldown 判成无副作用整块摇掉。构建绿、产物里没有 AbortController，
    // 跑到才炸 `wx.__window.AbortController is not a constructor`。
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

  // 配置文件：静态那份 + 结构化那份 + 构建器补的，在这里算一次，之后所有消费方
  // 读同一份结果。分包插件以前自己现读 appJson 文件，静态 app.json 里写的分包
  // 它完全看不见，于是「写了分包但没拆」只能靠猜。
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
   * 与 analog 共享的 fileReplacements 数组实例。
   *
   * analog 存的是引用（`options?.fileReplacements ?? []`）、读得晚
   * （`initialize()` 时才转成 host 的 record），所以我们只要**持有自己
   * 这个数组**，在 `enforce: 'pre'` 的 buildStart 里 push，analog 到点
   * 自然看得到 —— 不用 patch 它一行代码。
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
       * 必须排在 wxsStrip 之前：分析层产出的模板 AST 是剥离的唯一真相源，
       * 剥离要在 analog 建 program 前就位，所以分析只能跟着往前挪。
       * 它自己只读磁盘（自建 program + tsconfig），不依赖模块图，往前挪安全。
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
        // `@Component.styles` 内联样式的语言。不传的话 analog 一律当 css，
        // 写 scss 嵌套的组件会静默产出一份缺样式的 wxss。
        inlineStylesExtension: viteOptions.inlineStyleLanguage,
        // fileReplacements 是 Angular 切环境的标准机制（environment.prod.ts），
        // 不接的话「生产构建」会静默用着 dev 配置——这是会直接上线出事的坑。
        // 传我们自己的数组实例，wxs 剥离的替换项由上面的插件就地 push。
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
          // 全局 polyfill 入口。必须排在 require 列表最前面，
          // 保证 AbortController 等在任何业务 chunk 之前装好。
          // 模板是纯文本内联、不过 bundler，所以 polyfill 只能走入口。
          // 入口本身是个虚拟模块：我们那份固定装，`@angular/localize/init`
          // 只在 angular.json 声明了才拼进来。
          polyfills: POLYFILL_ENTRY_ID,
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
          chunkFileNames: outputNames.chunkFileNames,
          assetFileNames: outputNames.assetFileNames,
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
 * `String(error.message)` 只剩第一行——恰好把定位需要的那几行丢了。
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
 * 结构化配置选项指向的文件，watch 要显式盯上。
 *
 * 静态那份（assets 里的 app.json）通常在 sourceRoot 下，目录监听已经盖到；
 * 这几个选项可以指到 sourceRoot 外面，不显式加进来就是「改了没反应」。
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
          // 和 webpack browser builder 的输出契约对齐，spec 里靠这个定位产物
          baseOutputPath,
        } as BuilderOutput);
      }
    };

    void (async () => {
      try {
        const buildPlatform = getBuildPlatform(options.platform);
        // 选项得在 init() 之后补一次：BuildPlatform 构造时就把 transform
        // 装配进了 WxContainer 全局配置，重跑一次 init 才能把选项带进去。
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
          // 把「哪些指令没拿到库元数据」显式报出来。
          // 旧行为是静默返回空 listeners，wxml 丢事件绑定且零报错。
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

        // watch：发现变动就重算入口 + 重跑一次 vite.build。
        // 不用 Vite 原生 watch，因为 Rolldown watch 不支持动态加 input。
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

        // 注意顺序：watcher 必须先注册好，再推第一次成功输出。
        // 否则消费方（包括测试）在收到第一轮结果后立刻改文件，
        // 那个改动会发生在 watcher 注册之前，直接丢掉。
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
