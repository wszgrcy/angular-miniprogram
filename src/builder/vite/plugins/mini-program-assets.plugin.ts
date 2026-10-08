import type { BuilderContext } from '@angular-devkit/architect';
import type { Path } from '@angular-devkit/core';
import * as fs from 'fs';
import { CssUrl } from 'ng-packagr/src/lib/styles/stylesheet-processor';
import * as path from 'path';
import { Injector } from 'static-injector';
import ts from 'typescript';
import type { Plugin } from 'vite';
import {
  CustomStyleSheetProcessor,
  StyleCompileEntry,
  compileStyles,
  inlineStyleEntries,
} from '../../library/stylesheet-processor';
import type {
  InlineStyleSource,
  WxsAnalysisRef,
} from '../../mini-program-compiler/type';
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
import { transformMiniProgramStyle } from '../../util/mini-program-style';
import { isPathIn, toNativePath, toPosixPath } from '../../util/path';
import type { CopiedAsset } from '../copy-assets';
import { mergeConfig } from '../merge-config';
import type { MpConfigBundle } from '../mp-config';
import { checkReferencedFiles } from '../mp-config';

/** 一个纯 node fs 的 ts.System。 */
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
 * 读一份已有的 json 配置（用户自己写的那份）。读不到当空对象，不是对象直接报错。
 */
function readJsonObject(file: string | undefined): Record<string, unknown> {
  if (!file || !fs.existsSync(file)) {
    return {};
  }
  const text = fs.readFileSync(file, 'utf8');
  const parsed = JSON.parse(text) as unknown;
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${file} 必须是一个 JSON 对象`);
  }
  return parsed as Record<string, unknown>;
}

/**
 * 顶替 webpack.Compiler，只提 `watchMode` 和 `inputFileSystem?.purge?.()` 两处需要的最小实现。
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
  /** builder 配置里的 assets 展开结果（app.json / project.config.json 从这里来） */
  assets?: CopiedAsset[];
  /**
   * 解析好的配置文件（静态那份 + 结构化那份 + 构建器补的，已合并完）。
   * 不传则配置文件只能原样拷贝。
   */
  mpConfigs?: MpConfigBundle;
  /** builder 配置里的全局样式，产出 app.wxss */
  styles?: (string | { input: string })[];
  /**
   * `@Component.styles` 内联样式的语言，默认 'css'。不指定就只能当 css 编译。
   */
  inlineStyleLanguage?: string;
  /**
   * app.js 从哪个 chunk 出发做可达性分析。不指定时 app.js 会认为没有引导入口。
   */
  bootstrapChunk?: string;
  absoluteProjectRoot?: Path;
  absoluteProjectSourceRoot?: Path;
  /**
   * 分析结果共享引用。本插件 buildStart 里就填，wxs-strip 插件靠它拿「哪些组件声明了 wxs」。
   */
  analysisRef?: {
    current: WxsAnalysisRef;
  };
}

/**
 * 把 wxml / json / wxss 产出到 Vite 的 bundle：
 *   1. metaMap.outputContent  -> wxml
 *   2. metaMap.style          -> wxss
 *   3. metaMap.config         -> json（合并已存在的配置文件）
 *   4. library 组件 config    -> json
 *   5. library 模板          -> 直接落盘
 *   6. metaMap.selfTemplate   -> self template
 */
/**
 * 样式编译器，一轮构建里复用同一个实例。`cssUrl: inline` 是小程序的硬限制：
 * wxss 拿不到本地文件，`url()` 里的相对路径必须内联成 dataurl。
 */
function createStyleProcessor(
  options: MiniProgramAssetsPluginOptions,
): CustomStyleSheetProcessor {
  return new CustomStyleSheetProcessor(
    options.workspaceRoot,
    options.workspaceRoot,
    CssUrl.inline,
    undefined,
    undefined,
    false,
    !!options.watch,
  );
}

/** 样式告警的定位包装：把「哪个产物」拼到每条告警前面。 */
function createStyleWarnOf(
  options: MiniProgramAssetsPluginOptions,
): (outPath: string) => (message: string) => void {
  return (outPath) => (message) =>
    options.context.logger.warn(`[样式 ${toPosixPath(outPath)}] ${message}`);
}

/**
 * wxs 落盘 + watch 登记。wxs 不是 ES module，模块图看不见，不显式 addWatchFile
 * 的话 watch 下改 .wxs 不会触发重建。语法已在分析阶段把关，这里原样落盘。
 */
export function emitWxs(
  resolved: {
    wxsSources?: Map<string, string>;
    wxsSourceFiles?: string[];
  },
  emit: (fileName: string, source: string) => void,
  addWatchFile: (srcPath: string) => void,
) {
  resolved.wxsSources?.forEach((source, outPath) => {
    emit(outPath, source);
  });
  resolved.wxsSourceFiles?.forEach((srcPath) => {
    addWatchFile(srcPath);
  });
}

/**
 * 样式源文件路径 → 编译条目。
 *
 * key 统一 normalize：`styleMap` 和 `emitStyles` 两边得用同一个形状对得上。
 */
function fileStyleEntries(
  styleProcessor: CustomStyleSheetProcessor,
  paths: Iterable<string>,
): StyleCompileEntry[] {
  return [...paths].map((p) => {
    // key 同时当 bundleFile 的入参，要的是可用路径，不是身份令牌
    const key = toNativePath(p);
    return { key, bundle: () => styleProcessor.bundleFile(key) };
  });
}

/** 一轮分析里需要被样式管线碰到的那部分。 */
type StyleSlice = {
  style: Map<string, string[]>;
  inlineStyle: Map<string, InlineStyleSource[]>;
};

/**
 * 编译本轮所有组件样式：样式源文件 + 内联样式，两份分开返回（key 不同域）。
 */
async function compileResolvedStyles(
  options: MiniProgramAssetsPluginOptions,
  ensureStyleProcessor: () => CustomStyleSheetProcessor,
  resolved: StyleSlice,
) {
  const files: string[] = [];
  resolved.style.forEach((sourceList) => files.push(...sourceList));
  const inline: InlineStyleSource[] = [];
  resolved.inlineStyle.forEach((sourceList) => inline.push(...sourceList));
  // 一个样式都没有就别拉样式编译器，建一次 StylesheetProcessor 要跑 browserslist + postcss 探测
  if (!files.length && !inline.length) {
    return {
      files: new Map<string, string>(),
      inline: new Map<string, string>(),
    };
  }
  const styleProcessor = ensureStyleProcessor();
  const warn = (label: string) => (error: unknown, key: string) =>
    options.context.logger.warn(
      `${label} ${key}: ${String((error as Error)?.message ?? error)}`,
    );
  return {
    files: await compileStyles(
      styleProcessor,
      fileStyleEntries(styleProcessor, files),
      warn('样式编译失败'),
    ),
    inline: await compileStyles(
      styleProcessor,
      inlineStyleEntries(styleProcessor, inline, options.inlineStyleLanguage),
      warn('内联样式编译失败'),
    ),
  };
}

/**
 * wxss 落盘。一个产物可能同时来自样式文件和内联样式，先汇到同一份列表再写。
 * 拼接完必须过 `transformMiniProgramStyle`，避免 `@charset` / `@import` 跑到文件中部。
 */
function emitStyles(
  resolved: StyleSlice,
  compiled: { files: Map<string, string>; inline: Map<string, string> },
  emit: (fileName: string, source: string) => void,
  warnOf: (outPath: string) => (message: string) => void,
) {
  const parts = new Map<string, string[]>();
  const append = (outPath: string, css: string) => {
    const list = parts.get(outPath);
    if (list) {
      list.push(css);
    } else {
      parts.set(outPath, [css]);
    }
  };
  resolved.style.forEach((sourceList, outPath) => {
    for (const s of sourceList) {
      append(outPath, compiled.files.get(toNativePath(s)) ?? '');
    }
  });
  resolved.inlineStyle.forEach((sourceList, outPath) => {
    for (const s of sourceList) {
      append(outPath, compiled.inline.get(s.key) ?? '');
    }
  });
  parts.forEach((list, outPath) =>
    emit(
      outPath,
      transformMiniProgramStyle(list.join('\n'), { warn: warnOf(outPath) }),
    ),
  );
}

/**
 * 是不是 page / component / tabbar / library 的入口 chunk。这类 chunk 必须由小程序运行时
 * 在正确上下文里加载，不能从 app.js 里 require。入参是产物路径，不是源路径。
 */
function isEntryChunk(
  fileName: string,
  bootstrapChunk: string,
  tabbarDir: string | undefined,
): boolean {
  const posix = toPosixPath(fileName);
  if (posix === bootstrapChunk) {
    return false;
  }
  return (
    posix.startsWith('pages/') ||
    posix.startsWith('components/') ||
    posix.startsWith('library/') ||
    (!!tabbarDir && isPathIn(tabbarDir, posix))
  );
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

  /** 样式编译器跳轮复用，由闭包持有；具体编译在模块级函数里。 */
  const ensureStyleProcessor = () =>
    (styleProcessor ??= createStyleProcessor(options));

  const warnStyleOf = createStyleWarnOf(options);

  return {
    name: 'mini-program:assets',
    enforce: 'pre',
    async buildStart() {
      // watch 模式下每轮 buildStart 都要作废上一轮的分析结果，
      // 否则改模板不会重新产出 wxml
      if (options.watch) {
        analysisPromise = null;
      }
      analysisPromise ??= runAnalysis();
      /** 必须 await，否则分析失败就是 unhandled rejection，直接崩掉 node 进程 */
      await analysisPromise;
      if (options.analysisRef) {
        options.analysisRef.current = await analysisPromise;
      }
    },
    async generateBundle(_opts, bundle) {
      if (options.watch) {
        analysisPromise = runAnalysis();
      }
      analysisPromise ??= runAnalysis();
      const resolved = await analysisPromise;

      const compiledStyles = await compileResolvedStyles(
        options,
        ensureStyleProcessor,
        resolved,
      );

      const emit = (fileName: string, source: string) => {
        // 不能用 path.normalize：Windows 上它会把 `/` 转成 `\`，污染 app.js 的 require 字面量。
        // 产物路径一律 posix 正斜杠，并剥掉前导 `/`
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

      // 1.5 wxs：渲染层脚本原样落盘 + watch 登记
      emitWxs(resolved, emit, (p) => this.addWatchFile(p));

      // 2. wxss：按组件把编译后的样式拼起来，再过一遍小程序兼容处理
      emitStyles(resolved, compiledStyles, emit, warnStyleOf);

      // 3. json：用户已有的那份打底，构建器算出来的只补没写过的
      resolved.config.forEach((value, outPath) => {
        const existing = readJsonObject(value.existConfig);
        const usingComponents = value.usingComponents.reduce(
          (pre, cur) => {
            pre[cur.selector] = cur.path;
            return pre;
          },
          {} as Record<string, string>,
        );
        const config = mergeConfig(existing, {
          component: value.component,
          usingComponents,
        });
        emit(outPath, JSON.stringify(config));
      });

      // 4. otherMetaCollectionGroup -> 把模板 / usingComponents 回注到 scope，
      //    必须在 exportLibraryTemplate() 之前
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

      // 6. library 模板：已在 library-template.plugin 从 sidecar 取出时渲染成目标平台文本，
      //    这里不能再渲染，否则会把 app 自己的 wxml 插值吃掉
      const templateGroup = libraryTemplateScopeService.exportLibraryTemplate();
      for (const [key, element] of Object.entries(templateGroup)) {
        emit(key, element);
      }

      // 7. self template
      for (const [key, content] of Object.entries(resolved.selfTemplate)) {
        emit(key, content);
      }

      // 8. builder 配置里的 assets。被合并流程接管的配置文件不能在这里拷，
      //    否则会把合并结果盖回用户原文。
      const consumed = options.mpConfigs?.consumedAssets ?? new Set<string>();
      const emittedPaths = new Set<string>();
      for (const item of options.assets ?? []) {
        if (consumed.has(item.sourcePath)) {
          continue;
        }
        const text = fs.readFileSync(item.sourcePath, 'utf8');
        emit(item.outputRelPath, text);
        emittedPaths.add(toPosixPath(item.outputRelPath));
      }

      // 8.5 配置文件输出：没有任何可合并内容时逐字节用用户那份原文
      if (options.mpConfigs) {
        for (const resolvedConfig of [
          options.mpConfigs.app,
          options.mpConfigs.project,
        ]) {
          const text =
            resolvedConfig.verbatimText ??
            `${JSON.stringify(resolvedConfig.config, null, 2)}\n`;
          emit(resolvedConfig.filename, text);
          emittedPaths.add(resolvedConfig.filename);
        }
        const missing = checkReferencedFiles(
          options.mpConfigs.app.config,
          emittedPaths,
        );
        if (missing.length) {
          const message = `app 配置引用了产物里不存在的文件:\n  - ${missing.join('\n  - ')}`;
          // 静态那份 app.json 是用户从别的项目搬过来的，漏拷一个文件不该停整个构建
          if (options.mpConfigs.app.level === 'error') {
            this.error(message);
          } else {
            this.warn(message);
          }
        }
      }

      // 9. app.js：小程序没有模块系统，靠 app.js 里一串 require 把启动需要的 chunk 拉起来。
      //    require 顺序必须依赖在前、入口在后
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
      // app.js 的引导 chunk（应用 = main.js，测试 = test.js）
      const bootstrapChunk = options.bootstrapChunk ?? 'main.js';
      const tabbarDir = options.buildPlatform.customTabbar?.dir;
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
      // 塞进 `require('...')` 字面量后无效转义会被吃掉
      /**
       * app.js 只 require「app 引导（main.js）可达的 chunk」。page / component / library
       * entry 各自会在文件顶层调 Page() / Component()，必须由小程序运行时在正确上下文里
       * 加载，从 app.js 里 require 它们会直接报错。
       */
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
        // 没有 main 引导入口时退化成「排除 entry 类 chunk」
        required.push(
          ...emittedOrder.filter(
            (f) => !isEntryChunk(f, bootstrapChunk, tabbarDir),
          ),
        );
      }
      /**
       * polyfill 必须在最前面。它是独立入口，从 main.js 不可达，可达性分析不会把它纳入，
       * 而它又必须在任何使用 AbortController 的代码之前执行。
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

      // 10. 全局样式（app 级），来自 builder 配置里的 styles
      if (options.styles?.length) {
        const globalStyleSources = options.styles
          .map((s) => (typeof s === 'string' ? s : s.input))
          .filter((s) => fs.existsSync(path.resolve(options.workspaceRoot, s)))
          .map((s) => path.resolve(options.workspaceRoot, s));
        const styleProcessor = ensureStyleProcessor();
        const compiledGlobal = await compileStyles(
          styleProcessor,
          fileStyleEntries(styleProcessor, globalStyleSources),
          (error, key) =>
            options.context.logger.warn(
              `全局样式编译失败 ${key}: ${String(
                (error as Error)?.message ?? error,
              )}`,
            ),
        );
        const globalCss = transformMiniProgramStyle(
          globalStyleSources
            .map((s) => compiledGlobal.get(toNativePath(s)) ?? '')
            .join('\n'),
          {
            warn: (message) =>
              options.context.logger.warn(
                `[样式 app${options.buildPlatform.fileExtname.style}] ${message}`,
              ),
          },
        );
        // 文件名跟着平台走：wx 是 app.wxss，zfb 是 app.acss……
        emit('app' + options.buildPlatform.fileExtname.style, globalCss);
      }

      void bundle;
    },
    async closeBundle() {
      styleProcessor?.destroy?.();
    },
  };
}
