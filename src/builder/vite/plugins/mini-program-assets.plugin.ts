import type { BuilderContext } from '@angular-devkit/architect';
import type { AssetPattern } from '@angular-devkit/build-angular';
import type { Path } from '@angular-devkit/core';
import * as fs from 'fs';
import * as path from 'path';
import { Injector } from 'static-injector';
import ts from 'typescript';
import type { Plugin } from 'vite';
import { CustomStyleSheetProcessor } from '../../library/stylesheet-processor';
import { BuildPlatform } from '../../platform/platform';
import { LibraryTemplateScopeService } from '../../shared/library-template-scope.service';
import { MiniProgramApplicationAnalysisService } from '../../shared/mini-program-application-analysis.service';
import {
  COMPILER_HOST,
  OLD_BUILDER,
  PAGE_PATTERN_TOKEN,
  TS_CONFIG_TOKEN,
  TS_SYSTEM,
} from '../../shared/token';
import type { PagePattern } from '../../shared/type';
import { toPosixPath } from '../../util/asset-path';
import { MpAppConfig, generateAppJson, validateAppConfig } from '../app-config';
import { collectAssets } from '../copy-assets';

/**
 * 一个纯 node fs 的 ts.System。
 *
 * webpack 侧用的是 @ngtools/webpack 的 createWebpackSystem（走 compiler.inputFileSystem），
 * Vite 侧没有那层，直接拿 node fs 拼一个够用的实现。
 */
export function createNodeTsSystem(
  getCurrentDirectory: () => string,
): ts.System {
  return {
    ...ts.sys,
    getCurrentDirectory,
    // 明确走 node fs，避免被 ts.sys 的缓存策略影响
    fileExists: (p) => fs.existsSync(p),
    readFile: (p) => {
      try {
        return fs.readFileSync(p, 'utf8');
      } catch {
        return undefined;
      }
    },
    directoryExists: (p) => {
      try {
        return fs.statSync(p).isDirectory();
      } catch {
        return false;
      }
    },
    getDirectories: (p) => {
      try {
        return fs
          .readdirSync(p)
          .filter((f) => fs.statSync(path.join(p, f)).isDirectory());
      } catch {
        return [];
      }
    },
  };
}

/**
 * 顶替 webpack.Compiler。
 *
 * MiniProgramApplicationAnalysisService 实际只读两处：
 *   - compiler.watchMode
 *   - compiler.inputFileSystem?.purge?.()
 * 所以这里给一个最小实现就够，不用真的造一个 webpack。
 */
export function createStubWebpackCompiler(watchMode: boolean): {
  watchMode: boolean;
  inputFileSystem: { purge: (p: string) => void };
} {
  return {
    watchMode,
    inputFileSystem: {
      purge: () => {
        /* node fs 没有 webpack 的内存缓存要清，空实现即可 */
      },
    },
  };
}

export interface MiniProgramAssetsPluginOptions {
  tsConfig: string;
  workspaceRoot: string;
  buildPlatform: BuildPlatform;
  entryPatterns: PagePattern[];
  context: BuilderContext;
  watch?: boolean;
  /** 与 library-template 插件共享同一个实例，否则 scope 注册信息对不上 */
  templateScope?: LibraryTemplateScopeService;
  /** builder 配置里的 assets，app.json / project.config.json 从这里来 */
  assets?: AssetPattern[];
  /**
   * 结构化 app 配置源文件（相对 workspaceRoot）。
   * 配置后由构建器编译生成 app.json，与 assets 里的静态 app.json 互斥。
   */
  appJson?: string;
  /** builder 配置里的全局样式，产出 app.wxss */
  styles?: (string | { input: string })[];
  /**
   * app.js 从哪个 chunk 出发做可达性分析。
   *
   * 应用构建是 `main.js`；karma 链路的应用入口叫 `test.js`，
   * 不把它说清楚的话 app.js 会认为「没有引导入口」，
   * 退化成「除 entry 类 chunk 外全 require」，
   * 引导 chunk 反而进不了 app.js，小程序启动时什公都不会发生。
   */
  bootstrapChunk?: string;
  absoluteProjectRoot?: Path;
  absoluteProjectSourceRoot?: Path;
}

/**
 * 把 wxml / json / wxss 产出到 Vite 的 bundle。
 *
 * 对应 webpack 的 ExportMiniProgramAssetsPlugin，产出内容完全一致：
 *   1. metaMap.outputContent  -> wxml
 *   2. metaMap.style          -> wxss（样式源文件编译后按组件拼接）
 *   3. metaMap.config         -> json（合并已存在的配置文件）
 *   4. library 组件 config    -> json
 *   5. library 模板          -> 直接落盘（已在读 sidecar 时渲染完）
 *   6. metaMap.selfTemplate   -> self template
 */
/**
 * 样式编译器。一轮构建里复用同一个实例，避免每个文件重建 sass 环境。
 */
function createStyleProcessor(
  options: MiniProgramAssetsPluginOptions,
): CustomStyleSheetProcessor {
  return new CustomStyleSheetProcessor(
    options.workspaceRoot,
    options.workspaceRoot,
    undefined,
    undefined,
    undefined,
    false,
    !!options.watch,
  );
}

/**
 * 逐个编译样式源文件，返回 path -> css 文本。
 * 单个文件编译失败只记警告并落空串，不中断整轮构建。
 */
async function compileStyleSources(
  options: MiniProgramAssetsPluginOptions,
  styleProcessor: CustomStyleSheetProcessor,
  styleSourcePaths: Set<string>,
): Promise<Map<string, string>> {
  const compiled = new Map<string, string>();
  for (const stylePath of styleSourcePaths) {
    try {
      const result = await styleProcessor.bundleFile(stylePath);
      compiled.set(path.normalize(stylePath), result.contents ?? '');
    } catch (error) {
      options.context.logger.warn(
        `样式编译失败 ${stylePath}: ${String(
          (error as Error)?.message ?? error,
        )}`,
      );
      compiled.set(path.normalize(stylePath), '');
    }
  }
  return compiled;
}

export function miniProgramAssetsPlugin(
  options: MiniProgramAssetsPluginOptions,
): Plugin {
  const libraryTemplateScopeService =
    options.templateScope ?? new LibraryTemplateScopeService();
  type MetaMap = Awaited<
    ReturnType<
      MiniProgramApplicationAnalysisService['exportComponentBuildMetaMap']
    >
  >;
  let analysisPromise: Promise<MetaMap> | null = null;
  let styleProcessor: CustomStyleSheetProcessor | undefined;

  const runAnalysis = async (
    entryPatterns: PagePattern[] = options.entryPatterns,
  ) => {
    const system = createNodeTsSystem(() => options.workspaceRoot);
    const stubCompiler = createStubWebpackCompiler(!!options.watch);

    const injector = Injector.create({
      providers: [
        { provide: MiniProgramApplicationAnalysisService },
        { provide: COMPILER_HOST, useValue: stubCompiler },
        { provide: OLD_BUILDER, useValue: undefined },
        { provide: TS_SYSTEM, useValue: system },
        {
          provide: TS_CONFIG_TOKEN,
          useValue: path.resolve(options.workspaceRoot, options.tsConfig),
        },
        { provide: PAGE_PATTERN_TOKEN, useValue: entryPatterns },
        { provide: BuildPlatform, useValue: options.buildPlatform },
      ],
    });

    const service = injector.get(MiniProgramApplicationAnalysisService);
    await service.analyzeAsync();
    const metaMap = await service.exportComponentBuildMetaMap();
    service.cleanDependencyFileCache();
    return metaMap;
  };

  /**
   * 编译样式源文件，返回 path -> css 文本。
   * processor 需要跳轮复用，所以由闭包持有，具体编译在模块级函数里。
   */
  const compileStyles = async (styleSourcePaths: Set<string>) => {
    if (!styleSourcePaths.size) {
      return new Map<string, string>();
    }
    styleProcessor ??= createStyleProcessor(options);
    return compileStyleSources(options, styleProcessor, styleSourcePaths);
  };

  return {
    name: 'mini-program:assets',
    enforce: 'post',
    buildStart() {
      // watch 模式下每轮 buildStart 都要作废上一轮的分析结果，
      // 否则改模板不会重新产出 wxml
      if (options.watch) {
        analysisPromise = null;
      }
      analysisPromise ??= runAnalysis();
    },
    async generateBundle(_opts, bundle) {
      if (options.watch) {
        analysisPromise = runAnalysis();
      }
      analysisPromise ??= runAnalysis();
      const resolved = await analysisPromise;

      // 收集所有要编译的样式源文件
      const styleSources = new Set<string>();
      resolved.style.forEach((sourceList) => {
        for (const s of sourceList) {
          styleSources.add(path.normalize(s));
        }
      });
      const compiledStyles = await compileStyles(styleSources);

      const emit = (fileName: string, source: string) => {
        // 不能用 path.normalize：Windows 上它会把 `/` 转成 `\`，
        // 产物路径就带上反斜杠，进而污染 app.js 的 require 字面量
        // （`\c` 之类无效转义被吃掉，路径直接废掉）。
        // 产物路径一律 posix 正斜杠，并剥掉前导 `/`
        // （rollup 的 emitFile fileName 不接受绝对路径）。
        const normalized = toPosixPath(fileName);
        if (!normalized || normalized.startsWith('..')) {
          this.warn(`跳过无法归一化的产物路径: ${fileName}`);
          return;
        }
        this.emitFile({
          type: 'asset',
          fileName: normalized,
          source,
        });
      };

      // 1. wxml
      resolved.outputContent.forEach((content, outPath) => {
        emit(outPath, content);
      });

      // 2. wxss：按组件把编译后的样式拼起来
      resolved.style.forEach((sourceList, outPath) => {
        const css = sourceList
          .map((s) => compiledStyles.get(path.normalize(s)) ?? '')
          .join('\n');
        emit(outPath, css);
      });

      // 3. json：合并组件目录里已存在的配置文件
      resolved.config.forEach((value, outPath) => {
        let config: Record<string, unknown> = {};
        if (value.existConfig && fs.existsSync(value.existConfig)) {
          config = JSON.parse(fs.readFileSync(value.existConfig, 'utf8'));
        }
        config.component ??= value.component;
        config.usingComponents = {
          ...(config.usingComponents as Record<string, string> | undefined),
          ...value.usingComponents.reduce(
            (pre, cur) => {
              pre[cur.selector] = cur.path;
              return pre;
            },
            {} as Record<string, string>,
          ),
        };
        emit(outPath, JSON.stringify(config));
      });

      // 4. otherMetaCollectionGroup -> 把模板 / usingComponents 回注到 scope
      //    这一步必须在 exportLibraryTemplate() 之前，否则 templateList 是空的，
      //    library-template/*.wxml 会产出一个空文件。
      for (const [key, element] of Object.entries(
        resolved.otherMetaCollectionGroup,
      )) {
        libraryTemplateScopeService.setScopeExtraUseComponents(key, {
          useComponents: {
            ...[...element.localPath, ...element.libraryPath].reduce(
              (pre, cur) => {
                pre[cur.selector] = cur.path;
                return pre;
              },
              {} as Record<string, string>,
            ),
          },
          templateList: element.templateList.map((item) => item.content),
        });
      }

      // 5. library 组件 config
      for (const item of libraryTemplateScopeService.exportLibraryComponentConfig()) {
        emit(item.filePath, JSON.stringify(item.content));
      }

      // 6. library 模板
      // 注意：这里**不再渲染**。库模板已在 library-template.plugin 从 sidecar
      // 取出时渲染成目标平台文本；这里拼进来的还有 app 自己的 wxml（带真实
      // `{{hasLoad}}` 插值），再过一遍模板渲染会把它们吃掉。
      const templateGroup = libraryTemplateScopeService.exportLibraryTemplate();
      for (const [key, element] of Object.entries(templateGroup)) {
        emit(key, element);
      }

      // 7. self template
      for (const [key, content] of Object.entries(resolved.selfTemplate)) {
        emit(key, content);
      }

      // 8. builder 配置里的 assets（project.config.json 等）
      if (
        options.assets?.length &&
        options.absoluteProjectRoot &&
        options.absoluteProjectSourceRoot
      ) {
        const copied = await collectAssets(options.assets, {
          workspaceRoot: options.workspaceRoot,
          absoluteProjectRoot: options.absoluteProjectRoot,
          absoluteProjectSourceRoot: options.absoluteProjectSourceRoot,
        });
        const appJsonName = `app${options.buildPlatform.fileExtname.config}`;
        const hasStaticAppJson = copied.some(
          (item) => toPosixPath(item.outputRelPath) === appJsonName,
        );
        if (options.appJson && hasStaticAppJson) {
          this.error(
            `appJson 配置与 assets 中的 ${appJsonName} 冲突：` +
              `app 配置只能有一个来源，请删除 assets 里的 ${appJsonName} 或改用 appJson`,
          );
        }
        for (const item of copied) {
          emit(item.outputRelPath, fs.readFileSync(item.sourcePath, 'utf8'));
        }
      }

      // 8.5 app.json 编译生成（#1）：结构化配置 + 编译期校验。
      // 之前 app.json 是静态拷贝，页面不存在 / tabBar 野路径等错误
      // 全部延后到开发者工具才能发现，这里前置拦截。
      if (options.appJson) {
        const appJsonName = `app${options.buildPlatform.fileExtname.config}`;
        const appJsonPath = path.resolve(
          options.workspaceRoot,
          options.appJson,
        );
        if (!fs.existsSync(appJsonPath)) {
          this.error(`appJson 配置文件不存在: ${options.appJson}`);
        }
        let appConfig: MpAppConfig;
        try {
          appConfig = JSON.parse(
            fs.readFileSync(appJsonPath, 'utf8'),
          ) as MpAppConfig;
        } catch (e) {
          this.error(
            `appJson 配置 JSON 解析失败 ${options.appJson}: ${String(
              (e as Error)?.message ?? e,
            )}`,
          );
        }
        const builtPagePaths = options.entryPatterns
          .filter((p) => p.type === 'page')
          .map((p) => toPosixPath(p.outputFiles.path));
        const errors = validateAppConfig(appConfig, builtPagePaths);
        if (errors.length) {
          this.error(
            `app 配置校验失败（${options.appJson}）:\n  - ` +
              errors.join('\n  - '),
          );
        }
        emit(appJsonName, generateAppJson(appConfig));
      }

      // 9. app.js：小程序没有模块系统，靠 app.js 里一串 require 把启动
      //    需要的 chunk 拉起来。对应 webpack 的 BootstrapAssetsPlugin：
      //      'app.js': importTemplate + json.scripts.map(i => `require('./${i.src}')`)
      // require 顺序必须依赖在前、入口在后（拼接后都是全局作用域）。
      /** Vite 的 bundle 类型和 rollup 的不完全一致，这里只用到这两个字段 */
      interface JsChunk {
        type: 'chunk';
        fileName: string;
        imports: string[];
      }
      const jsChunks = Object.values(bundle).filter(
        (item) => item.type === 'chunk' && item.fileName.endsWith('.js'),
      ) as unknown as JsChunk[];
      const byFileName = new Map(jsChunks.map((c) => [c.fileName, c]));
      // app.js 的引导 chunk（应用 = main.js，karma = test.js）
      const bootstrapChunk = options.bootstrapChunk ?? 'main.js';
      const emittedOrder: string[] = [];
      const visiting = new Set<string>();
      const visited = new Set<string>();
      const visit = (fileName: string, stack: Set<string>) => {
        if (visited.has(fileName) || stack.has(fileName)) {
          return;
        }
        stack.add(fileName);
        const chunk = byFileName.get(fileName);
        if (chunk) {
          for (const dep of chunk.imports) {
            if (byFileName.has(dep)) {
              visit(dep, stack);
            }
          }
        }
        stack.delete(fileName);
        visited.add(fileName);
        emittedOrder.push(fileName);
      };
      for (const chunk of jsChunks) {
        visit(chunk.fileName, visiting);
      }
      // f 必须过 toPosixPath：Windows 下 chunk fileName 带反斜杠，
      // 直接塞进 `require('...')` 字面量后 `\c` 这类无效转义会被吃掉，
      // 路径变成 ./componentscxs.js，运行时找不到模块。
      /**
       * app.js 只应该 require「app 引导（main.js）可达的 chunk」。
       *
       * 不能把 emittedOrder（全部 chunk）都塞进来：page / component /
       * library entry 各自会在文件顶层调 Page() / Component()，
       * 那些必须由小程序运行时在**正确上下文**里加载
       * （导航到页面时 = page 上下文；注册组件时 = 组件初始化阶段）。
       * 从 app.js 里 require 它们，等于在 app 上下文调 Page()，微信会报
       *   "Please do not call Page constructor in files that not
       *    listed in pages section of app.json"
       * 和非初始化阶段调 Component()：
       *   "Component constructors should be called while initialization"
       *
       * webpack 侧本来就是这个语义：app.js 用的是 json.scripts，
       * 只含 app 主入口依赖的那几个 chunk（main/runtime/vendor/...），
       * 不含 page/component entry。
       */
      const isEntryChunk = (fileName: string) => {
        const posix = toPosixPath(fileName);
        // page / component / library 的 entry 产物都落在这几个目录下，
        // 且不是引导入口
        if (posix === bootstrapChunk) {
          return false;
        }
        return (
          posix.startsWith('pages/') ||
          posix.startsWith('components/') ||
          posix.startsWith('library/')
        );
      };
      // 从 main.js 出发收集可达 chunk（含自身）
      const reachable = new Set<string>();
      const collect = (fileName: string) => {
        const posix = toPosixPath(fileName);
        if (reachable.has(posix)) {
          return;
        }
        reachable.add(posix);
        const chunk = byFileName.get(fileName);
        for (const dep of chunk?.imports ?? []) {
          collect(dep);
        }
      };
      if (byFileName.has(bootstrapChunk)) {
        collect(bootstrapChunk);
      }
      // 保持拓扑顺序（依赖在前）
      const required = emittedOrder.filter((f) =>
        reachable.has(toPosixPath(f)),
      );
      if (!byFileName.has(bootstrapChunk)) {
        // 没有 main 引导入口时退化成「排除 entry 类 chunk」，
        // 至少不会再把 Page()/Component() 拉进 app 上下文
        required.push(...emittedOrder.filter((f) => !isEntryChunk(f)));
      }
      /**
       * polyfill 必须在最前面。
       *
       * 它是独立入口，从 main.js 不可达，上面的可达性分析不会把它
       * 纳入；而它又必须在任何使用 AbortController 的代码之前执行，
       * 所以在此显式前置（而不是丢给可达性分析）。
       *
       * 顺序：importTemplate（建 obj）→ polyfills（往 obj 装）→ 其余。
       */
      const POLYFILL_CHUNK = 'polyfills.js';
      if (byFileName.has(POLYFILL_CHUNK)) {
        required.unshift(POLYFILL_CHUNK);
      } else if (options.watch) {
        options.context.logger.warn(
          `[mini-program-assets] 未找到 ${POLYFILL_CHUNK}，` +
            'AbortController polyfill 将不会被加载',
        );
      }
      const requireList = required
        .map((f) => `require('./${toPosixPath(f)}')`)
        .join(';');
      emit(
        'app.js',
        `${options.buildPlatform.importTemplate};\n${requireList};`,
      );

      // 10. 全局样式（app 级）。对应 builder 配置里的 styles
      //     （webpack 侧走 MiniCssExtractPlugin，这里直接过一遍样式管线）。
      if (options.styles?.length) {
        const globalStyleSources = options.styles
          .map((s) => (typeof s === 'string' ? s : s.input))
          .filter((s) => fs.existsSync(path.resolve(options.workspaceRoot, s)))
          .map((s) => path.resolve(options.workspaceRoot, s));
        const compiledGlobal = await compileStyles(
          new Set(globalStyleSources.map((s) => path.normalize(s))),
        );
        const globalCss = globalStyleSources
          .map((s) => compiledStyles.get(path.normalize(s)) ?? '')
          .join('\n');
        // 文件名跟着平台走：wx 是 app.wxss，bdzn 是 app.css，
        // zfb 是 app.acss……写死 wxss 会让其他平台拿不到全局样式。
        emit('app' + options.buildPlatform.fileExtname.style, globalCss);
      }

      void bundle;
    },
    async closeBundle() {
      styleProcessor?.destroy?.();
    },
  };
}
