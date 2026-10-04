import type { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { createBuilder } from '@angular-devkit/architect';
import type { AssetPattern } from '@angular-devkit/build-angular';
import { getSystemPath } from '@angular-devkit/core';
import * as fs from 'fs';
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
import type { WxsAnalysisRef } from '../mini-program-compiler/type';
import { BuildPlatform, PlatformType } from '../platform/platform';
import { getBuildPlatformInjectConfig } from '../platform/platform-inject-config';
import { LibraryTemplateScopeService } from '../shared/library-template-scope.service';
import { getSubPackages } from './app-config';
import {
  generateEntryPatterns,
  resolveProjectRoots,
  toRollupInput,
} from './entry-patterns';
import { platformConditionDefine } from './platform-flags';
import { miniProgramComponentTransformPlugin } from './plugins/component-transform.plugin';
import { entryBootstrapPlugin } from './plugins/entry-bootstrap.plugin';
import { libraryTemplatePlugin } from './plugins/library-template.plugin';
import { miniProgramAssetsPlugin } from './plugins/mini-program-assets.plugin';
import { nativeComponentsPlugin } from './plugins/native-components.plugin';
import { platformFileResolvePlugin } from './plugins/platform-file-resolve.plugin';
import {
  readAppConfig,
  subpackageChunkPlugin,
} from './plugins/subpackage-chunk.plugin';
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
  sourceMap?: boolean;
  /**
   * 与 angular.json `build.options.polyfills` 同名同义。
   *
   * 目前只用来判定要不要装 `@angular/localize/init`，判定规则与
   * `@angular/build` 一致，见 `resolveLocalizeInit`。
   *
   * 与 schema 一样允许单个串（`"src/polyfills.ts"` 这种写法很常见）。
   */
  polyfills?: string | string[];
  optimization?: boolean;
  base?: string;
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
   * 配置后由构建器编译生成 app.json（含页面/tabBar/分包校验），
   * 与 assets 里的静态 app.json 互斥。不配则维持旧行为。
   */
  appJson?: string;
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
 * 我们自己的 `polyfill-entry.js` 是固定要装的，`@angular/localize/init` 却
 * 不是——没做 i18n 的项目不该为它付体积，也不该被要求装那个包。所以入口
 * 不能是一个写死的文件路径，得按配置现场拼出来。
 */
export const POLYFILL_ENTRY_ID = 'angular-miniprogram:polyfills';

/**
 * angular.json 的 `polyfills` 里有没有声明 `@angular/localize`，有则给出
 * 该注入的模块。
 *
 * ## 为什么两种写法都归一成 `@angular/localize/init`
 *
 * **不是偷懒，两者不等价**（实测，见 `localize-polyfill.spec.ts`）：
 *
 *  - `@angular/localize` 主入口只导出 `ɵ` 前缀的内部 API
 *    （`ɵ$localize` / `loadTranslations` / `parseTranslation` …），
 *    **一个字都不碰 globalThis**。
 *  - `@angular/localize/init` 整个模块就一句 `globalThis.$localize = $localize`。
 *
 * 而编译产物里的 i18n 常量走的是**裸 `$localize`**（`buildPlatformDefine`
 * 把它换成 `<平台>.$localize`），那个全局只有 `/init` 会挂。所以「声明里写的
 * 是什么就 import 什么」会构建成功、运行时全炸——照抄声明在这里是 bug。
 *
 * 声明 `@angular/localize` 表达的是「这个 app 要用 i18n」这个**意图**，
 * `/init` 是兑现它的**手段**。上游两条路径也都是这么归一的：
 *  - `@angular/build` `application-code-bundle.js:119`
 *  - `build-angular` `configs/common.js:81`
 *
 * ## 归一化会不会架空 app 自己的 `loadTranslations`
 *
 * 不会。`loadTranslations` 是业务侧**显式 import** 的 API，我们从不替换它；
 * 注入 `/init` 只是往 polyfills 里**多加**一个模块，没有 alias 掉主入口
 * （CLI 在 AOT 内联翻译那条路才会 `alias['@angular/localize/init'] = false`，
 * 我们不走内联）。
 *
 * 更关键的是两个入口共用同一个 `_localize-chunk.mjs`：`/init` 挂上全局的
 * 那个 `$localize` 对象，`loadTranslations` 写 `translate` / `TRANSLATIONS`
 * 就在同一个对象上，注册表只有一份。实测产物里 `$localize` 只在
 * `polyfills.js` 定义一次，业务 chunk 一律读 `wx.__window.$localize`。
 * 行为侧的钉测见 `library/platform/localize-runtime.spec.ts`。
 *
 * ## 为什么返回裸标识符而不是解析后的路径
 *
 * 交给 Vite 按它自己的 exports map / conditions / alias 解析，和应用里
 * 其余依赖走同一条路。自己 `require.resolve` 反而绕开这套，monorepo 提升、
 * `file:` 链接、条件导出这些情况就会和 Vite 的解析结果分叉。
 */
export function resolveLocalizeInit(
  polyfills: string | string[] | undefined,
): string | undefined {
  const declared = new Set(
    polyfills === undefined ? [] : ([] as string[]).concat(polyfills),
  );
  return declared.has('@angular/localize') ||
    declared.has('@angular/localize/init')
    ? '@angular/localize/init'
    : undefined;
}

export function polyfillEntryPlugin(
  selfEntry: string,
  localizeInit: string | undefined,
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
      const lines = [
        // 必须把命名空间接住再引用一次：polyfill-entry 是 CJS 产物，只往
        // globalThis 上挂东西、不导出任何有用值，裸 `import "x"` 会被
        // rolldown 判成无副作用整块摇掉。构建绿、产物里没有 AbortController，
        // 跑到才炸 `wx.__window.AbortController is not a constructor`。
        // `export default ns` 同样留不住（实测），落到全局能力表上才稳。
        `import * as __mpPolyfills from ${JSON.stringify(selfEntry)};`,
        `globalThis.__mpPolyfills = __mpPolyfills;`,
      ];
      if (localizeInit) {
        lines.push(`import ${JSON.stringify(localizeInit)};`);
      }
      return lines.join('\n');
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
  const isProduction = !!viteOptions.optimization;
  const localizeInit = resolveLocalizeInit(viteOptions.polyfills);

  const entryPatterns = await generateEntryPatterns({
    pages: viteOptions.pages || [],
    customTabbar: viteOptions.customTabbar,
    workspaceRoot: context.workspaceRoot,
    context,
    buildPlatform,
    tsConfig: viteOptions.tsConfig,
  });
  const allEntries = [
    ...entryPatterns.pageList,
    ...entryPatterns.componentList,
    ...entryPatterns.tabbarList,
  ];
  context.logger.info(
    `[小程序构建] 平台 ${viteOptions.platform}，` +
      `页面 ${entryPatterns.pageList.length} 个、` +
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

  // 分包：从 appJson 解析分包配置，有分包时才挂分包插件
  let subpackagePlugin: import('vite').Plugin[] = [];
  if (viteOptions.appJson) {
    const appConfigPath = path.resolve(
      context.workspaceRoot,
      viteOptions.appJson,
    );
    if (fs.existsSync(appConfigPath)) {
      const appConfig = readAppConfig(appConfigPath);
      if (getSubPackages(appConfig).length) {
        subpackagePlugin = [
          subpackageChunkPlugin({
            appConfig,
            sourceRoot: getSystemPath(absoluteProjectSourceRoot),
          }),
        ];
      }
    }
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
    ...(viteOptions.fileReplacements ?? []),
  ];

  const config: InlineConfig = {
    root: options.root ?? context.workspaceRoot,
    configFile: false,
    mode: isProduction ? 'production' : 'development',
    // 'warn' 会把 vite 自己的「building / transformed / 产物清单」全吞掉，
    // 用户只看到命令一闪而过，分不清是成功还是静默失败。
    logLevel: 'info',
    define: {
      ...buildPlatformDefine(buildPlatform, isProduction),
      // 条件编译：__MP_WX__ 等布尔常量，死分支由 bundler DCE 移除
      ...platformConditionDefine(viteOptions.platform),
    },
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
        assets: viteOptions.assets,
        appJson: viteOptions.appJson,
        styles: viteOptions.styles,
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
        // fileReplacements 是 Angular 切环境的标准机制（environment.prod.ts），
        // 不接的话「生产构建」会静默用着 dev 配置——这是会直接上线出事的坑。
        // 传我们自己的数组实例，wxs 剥离的替换项由上面的插件就地 push。
        fileReplacements: sharedFileReplacements,
      }),
      polyfillEntryPlugin(
        path.resolve(__dirname, '../platform/template/polyfill-entry.js'),
        localizeInit,
      ),
      libraryTemplatePlugin({ buildPlatform, templateScope }),
      miniProgramComponentTransformPlugin(),
      ...subpackagePlugin,
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
      emptyOutDir: true,
      sourcemap: !!viteOptions.sourceMap,
      minify: isProduction,
      assetsInlineLimit: 0,
      rollupOptions: {
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
              ...entryPatterns.componentList,
              ...entryPatterns.tabbarList,
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
