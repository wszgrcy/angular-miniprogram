import type { NgtscProgram, ParsedConfiguration } from '@angular/compiler-cli';
import type { NgCompiler } from '@angular/compiler-cli/src/ngtsc/core';
import { join, normalize, resolve } from '@angular-devkit/core';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Injector, inject } from 'static-injector';
import ts from 'typescript';
import type { CompilerOptions } from 'typescript';
import { LIBRARY_OUTPUT_ROOTDIR } from '../library';
import {
  MiniProgramCompilerService,
  splitComponentKey,
} from '../mini-program-compiler';
import { BuildPlatform } from '../platform/platform';
import { angularCompilerCliPromise } from '../util/load_esm';
import { planSharedWxsEmit } from '../wxs/wxs-declare';
import { parseWxsSource } from '../wxs/wxs-source';
import { detectEntryComponent } from './entry-component';
import {
  COMPILER_HOST,
  OLD_BUILDER,
  PAGE_PATTERN_TOKEN,
  TS_CONFIG_TOKEN,
  TS_SYSTEM,
} from './token';
import type { CompilerHostLike, PagePattern } from './type';

/**
 * Windows 下把路径外联成 win32 形式（带缓存）。
 *
 * 原先从 `@ngtools/webpack/src/ivy/paths` 引入——那是 webpack 的
 * 内部实现细节，我们只是碰巧复用。现在本地实现，去掉对 webpack 的依赖。
 * 语义与原实现一致：非 win32 恒等；win32 走 win32.normalize + 缓存。
 */
const externalizationCache = new Map<string, string>();
function externalizePath(p: string): string {
  if (process.platform !== 'win32') {
    return p;
  }
  let result = externalizationCache.get(p);
  if (result === undefined) {
    result = path.win32.normalize(p);
    externalizationCache.set(p, result);
  }
  return result;
}

export class MiniProgramApplicationAnalysisService {
  private injector = inject(Injector);
  private system = inject<ts.System>(TS_SYSTEM);
  private compiler = inject<CompilerHostLike>(COMPILER_HOST);
  private tsConfig = inject<string>(TS_CONFIG_TOKEN);
  private oldBuilder = inject<
    ts.EmitAndSemanticDiagnosticsBuilderProgram | undefined
  >(OLD_BUILDER);
  private pagePatternList = inject<PagePattern[]>(PAGE_PATTERN_TOKEN);
  private buildPlatform = inject(BuildPlatform);

  private dependencyUseModule = new Map<string, string[]>();
  private cleanDependencyFileCacheSet = new Set<string>();
  builder!: ts.BuilderProgram | ts.EmitAndSemanticDiagnosticsBuilderProgram;
  private ngTscProgram!: NgtscProgram;
  private tsProgram!: ts.Program;
  private ngCompiler!: NgCompiler;
  private typeChecker!: ts.TypeChecker;

  async exportComponentBuildMetaMap() {
    const injector = Injector.create({
      providers: [
        {
          provide: MiniProgramCompilerService,
          useFactory: (injector: Injector, buildPlatform: BuildPlatform) => {
            return new MiniProgramCompilerService(
              this.ngTscProgram,
              injector,
              buildPlatform,
            );
          },
          deps: [Injector, BuildPlatform],
        },
      ],
      parent: this.injector,
    });
    const miniProgramCompilerService = injector.get(MiniProgramCompilerService);
    miniProgramCompilerService.init();
    const metaMap =
      await miniProgramCompilerService.exportComponentBuildMetaMap();

    const selfMetaCollection = metaMap.otherMetaCollectionGroup['$self'];
    const selfTemplate: Record<string, string> = {};
    if (selfMetaCollection) {
      const importSelfTemplatePath = `/self-template/self${this.buildPlatform.fileExtname.contentTemplate}`;
      const importSelfTemplate = `<import src="${importSelfTemplatePath}"/>`;
      metaMap.outputContent.forEach((value, key) => {
        value = `${importSelfTemplate}${value}`;
        metaMap.outputContent.set(key, value);
      });

      metaMap.useComponentPath.forEach((value, key) => {
        value.libraryPath.push(...selfMetaCollection.libraryPath);
        value.localPath.push(...selfMetaCollection.localPath);
      });
      selfTemplate[importSelfTemplatePath] = selfMetaCollection.templateList
        .map((item) => item.content)
        .join('');
      delete metaMap.otherMetaCollectionGroup['$self'];
    }
    metaMap.useComponentPath.forEach((value, key) => {
      value.libraryPath = Array.from(new Set(value.libraryPath));
      value.localPath = Array.from(new Set(value.localPath));
    });
    const styleMap = new Map<string, string[]>();
    metaMap.style.forEach((value, key) => {
      const { sourceFile, componentClassName } = splitComponentKey(key);
      const entryPattern = this.getComponentPagePattern(
        sourceFile,
        componentClassName,
      );
      styleMap.set(entryPattern.outputFiles.style, value);
    });
    const contentMap = new Map<string, string>();
    metaMap.outputContent.forEach((value, key) => {
      const { sourceFile, componentClassName } = splitComponentKey(key);
      const entryPattern = this.getComponentPagePattern(
        sourceFile,
        componentClassName,
      );
      contentMap.set(entryPattern.outputFiles.content, value);
    });

    const wxsSources = new Map<string, string>();
    const wxsSourceFiles: string[] = [];
    const wxsExtname = this.buildPlatform.fileExtname.wxs;
    const sharedDir = this.buildPlatform.templateTransform.wxsSharedDir;

    /** 先把所有组件的声明解析成「模块 + 源绝对路径」 */
    const resolvedEntries: Array<{ module: string; resolvedSource: string }> =
      [];
    metaMap.wxsModules?.forEach((decls, key) => {
      const { sourceFile } = splitComponentKey(key);
      for (const decl of decls) {
        // src 相对**组件源文件**解析，所以共享脚本写 ../common/format.wxs 即可
        const srcPath = path.resolve(path.dirname(sourceFile), decl.src);
        if (!fs.existsSync(srcPath)) {
          throw new Error(
            `wxs 模块 "${decl.module}" 声明的 src="${decl.src}" 解析后不存在：${srcPath}`,
          );
        }
        resolvedEntries.push({
          module: decl.module,
          resolvedSource: srcPath,
        });
      }
    });

    /** 归并：每个源只落一份，同名不同源报错 */
    for (const item of planSharedWxsEmit(
      resolvedEntries,
      sharedDir,
      wxsExtname,
    )) {
      const source = fs.readFileSync(item.source, 'utf8');
      // 语法白名单在落盘前把关，把非法写法扣在编译期而不是真机上
      parseWxsSource(source, item.module, item.source);
      wxsSources.set(item.outPath, source);
    }
    wxsSourceFiles.push(...resolvedEntries.map((e) => e.resolvedSource));

    metaMap.style = styleMap;
    const config = new Map<
      string,
      {
        component: true | undefined;
        usingComponents: { selector: string; path: string }[];
        existConfig: string;
      }
    >();
    metaMap.useComponentPath.forEach((value, key) => {
      const { sourceFile, componentClassName } = splitComponentKey(key);
      const entryPattern = this.getComponentPagePattern(
        sourceFile,
        componentClassName,
      );
      const list = [
        ...value.libraryPath.map((item) => {
          item.path = resolve(
            normalize('/'),
            join(normalize(LIBRARY_OUTPUT_ROOTDIR), item.path),
          );
          return item;
        }),
      ];
      list.push(
        ...value.localPath.map((item) => ({
          selector: item.selector,
          path: resolve(
            normalize('/'),
            normalize(this.getComponentPagePattern(item.path).outputFiles.path),
          ),
          className: item.className,
        })),
      );
      config.set(entryPattern.outputFiles.config, {
        // 页面走 Page()；组件与自定义 tabBar 都是 Component()，
        // json 必须带 component: true，否则小程序不把它当组件
        component: entryPattern.type === 'page' ? undefined : true,
        usingComponents: list,
        existConfig: entryPattern.inputFiles.config,
      });
    });

    for (const key in metaMap.otherMetaCollectionGroup) {
      if (
        Object.prototype.hasOwnProperty.call(
          metaMap.otherMetaCollectionGroup,
          key,
        )
      ) {
        const element = metaMap.otherMetaCollectionGroup[key];
        element.libraryPath.forEach((item) => {
          item.path = resolve(
            normalize('/'),
            join(normalize(LIBRARY_OUTPUT_ROOTDIR), item.path),
          );
        });
        element.localPath.forEach((item) => {
          item.path = resolve(
            normalize('/'),
            normalize(this.getComponentPagePattern(item.path).outputFiles.path),
          );
        });
      }
    }
    return {
      style: styleMap,
      outputContent: contentMap,
      wxsSources,
      wxsSourceFiles,
      /**
       * `组件文件#类名` -> wxs 声明。带出来是给 wxs-strip 插件当组件清单用，
       * 免得它自己扫全盘找哪个组件带了 wxs。
       */
      wxsModules: metaMap.wxsModules,
      config: config,
      otherMetaCollectionGroup: metaMap.otherMetaCollectionGroup,
      selfTemplate,
    };
  }

  /**
   * 取 entry 绑定的组件类表达式。
   *
   * 只有一个来源：入口的 `export default`（见 entry-component.ts）。
   */
  private getEntryComponentExpression(
    sourceFile: ts.SourceFile,
  ): ts.Expression {
    const expression = detectEntryComponent(sourceFile);
    if (!expression) {
      throw new Error(
        `${sourceFile.fileName} 没声明入口组件：` +
          `需要 export default 组件类（或 export { 组件类 as default } from './x'）`,
      );
    }
    return expression;
  }

  /**
   * 取入口绑定的组件类名。
   *
   * `getSymbolAtLocation` 拿到的声明通常是 ImportSpecifier / ExportSpecifier
   * （`import { X } from ...`、`export { X as default } from ...`），
   * 不是类声明本身，所以要先沿 alias 解到原始 symbol 再取类名。
   * `import { X as Y }` 的情况以原始类名为准。
   */
  private resolveImportedComponentName(symbol: ts.Symbol | undefined): string {
    if (!symbol) {
      return '';
    }
    let current = symbol;
    // alias 链最多走几层，防御性地防止环
    for (let i = 0; i < 5; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      if ((current.flags & ts.SymbolFlags.Alias) === ts.SymbolFlags.Alias) {
        current = this.typeChecker.getAliasedSymbol(current);
        continue;
      }
      const decl = current.getDeclarations()?.[0];
      if (decl && ts.isClassDeclaration(decl)) {
        return decl.name?.getText() ?? '';
      }
      return '';
    }
    return '';
  }

  /**
   * 从 import / export 说明符往上找到携带 moduleSpecifier 的那层。
   *
   * `import { X } from './y'` 与 `export { X as default } from './y'`
   * 到 ImportDeclaration / ExportDeclaration 的层数不一样（前者多一层
   * NamedNodeArray），所以逐层往上找，不数固定层数。
   */
  private findModuleSpecifier(
    node: ts.Node | undefined,
  ): ts.Expression | undefined {
    let current = node;
    // 层级最多几层，防御性地防环
    for (let i = 0; i < 5 && current; i++) {
      if (ts.isImportDeclaration(current) || ts.isExportDeclaration(current)) {
        return current.moduleSpecifier;
      }
      current = current.parent;
    }
    return undefined;
  }

  private initHost(config: ParsedConfiguration) {
    const host = ts.createIncrementalCompilerHost(config.options, this.system);
    this.augmentResolveModuleNames(host, config.options);
    this.addCleanDependency(host);
    return host;
  }
  private async initTscProgram() {
    const { readConfiguration, NgtscProgram } = await angularCompilerCliPromise;
    const config = readConfiguration(this.tsConfig, undefined);
    const host = this.initHost(config);
    this.ngTscProgram = new NgtscProgram(
      config.rootNames,
      config.options,
      host,
    );
    this.tsProgram = this.ngTscProgram.getTsProgram();
    this.typeChecker = this.tsProgram.getTypeChecker();
    this.augmentProgramWithVersioning(this.tsProgram);
    if (this.compiler.watchMode) {
      this.builder = this.oldBuilder =
        ts.createEmitAndSemanticDiagnosticsBuilderProgram(
          this.tsProgram,
          host,
          this.oldBuilder,
        );
    } else {
      this.builder = ts.createAbstractBuilder(this.tsProgram, host);
    }
    this.ngCompiler = this.ngTscProgram.compiler;
  }
  /** 获得组件/页面的入口 */
  private getComponentPagePattern(
    fileName: string,
    componentClassName?: string,
  ) {
    const findList = [fileName];
    let maybeEntryPath: PagePattern | undefined;

    while (findList.length) {
      const module = findList.shift();
      const moduleList = this.dependencyUseModule.get(path.normalize(module!));
      if (moduleList && moduleList.length) {
        findList.push(...moduleList);
      } else {
        maybeEntryPath = this.pagePatternList.find(
          (item) => path.normalize(item.src) === path.normalize(module!),
        );
        if (maybeEntryPath) {
          const sourceFile = this.tsProgram.getSourceFile(maybeEntryPath.src);
          if (!sourceFile) {
            throw new Error(
              `${maybeEntryPath.src} 不在 ${this.tsConfig} 的编译范围内，` +
                `入口文件必须被 tsconfig 的 files / include 覆盖`,
            );
          }
          const importComponent = this.getEntryComponentExpression(sourceFile);
          const symbol = this.typeChecker.getSymbolAtLocation(importComponent);
          const node = symbol?.getDeclarations()?.[0];

          // `export default InlineComponent` 这种组件就在 entry 文件里、
          // 不是 import 进来的，根本没有 ImportDeclaration，
          // 不能再往下走 parent 链（会 undefined.parent 崩）。
          // 组件声明文件就是 entry 本身，直接命中。
          // 注意 re-export（export { X as default } from './y'）的声明节点也在
          // entry 文件里，但它是别名不是声明，必须排除，否则同文件多组件时
          // 会错把别人的 entry 认成自己的。
          if (
            node &&
            !ts.isImportSpecifier(node) &&
            !ts.isExportSpecifier(node) &&
            path.normalize(node.getSourceFile().fileName) ===
              path.normalize(maybeEntryPath.src)
          ) {
            const declaredName = ts.isClassDeclaration(node)
              ? node.name?.getText()
              : undefined;
            if (
              !componentClassName ||
              !declaredName ||
              declaredName === componentClassName
            ) {
              return maybeEntryPath;
            }
            maybeEntryPath = undefined;
            continue;
          }

          // 同文件多组件时，光比对文件路径分不出到底是哪个组件：
          // 两个 entry 各自 import 同一个文件的不同组件时，必须连类名一起对上，
          // 否则先那个组件会被解析到别人的 entry 上，模板就串了。
          const resolvedComponentName =
            this.resolveImportedComponentName(symbol);
          if (
            componentClassName &&
            resolvedComponentName &&
            resolvedComponentName !== componentClassName
          ) {
            maybeEntryPath = undefined;
            continue;
          }
          const moduleSpecifier =
            // 优先从引用点往上找：`export { X as default } from './y'` 的
            // symbol 声明可能已经跳到 './y' 里的类声明上，从那里往上就找不到
            // 模块说明符了
            this.findModuleSpecifier(importComponent) ??
            this.findModuleSpecifier(node);
          if (!moduleSpecifier) {
            // 解析不到 import / re-export（组件不是外部模块引进来的），
            // 这个候选 entry 不匹配，继续找下一个而不是直接崩
            maybeEntryPath = undefined;
            continue;
          }
          const relativeImportComponentPath = moduleSpecifier
            .getText()
            .slice(1, -1);

          const importComponentPath =
            path.resolve(
              path.dirname(maybeEntryPath.src),
              path.normalize(relativeImportComponentPath),
            ) + '.ts';
          if (importComponentPath === path.normalize(fileName)) {
            break;
          }

          maybeEntryPath = undefined;
        }
      }
    }
    if (!maybeEntryPath) {
      throw new Error(
        `没有找到组件[${componentClassName ?? fileName}]对应的入口点`,
      );
    }
    return maybeEntryPath;
  }

  private addCleanDependency(host: ts.CompilerHost) {
    const oldReadFile = host.readFile;
    const _this = this;
    host.readFile = function (fileName) {
      if (fileName.includes('node_modules')) {
        _this.cleanDependencyFileCacheSet.add(externalizePath(fileName));
      }
      return oldReadFile.call(this, fileName);
    };
  }
  private saveModuleDependency(
    filePath: string,
    moduleName: string,
    module: ts.ResolvedModule,
  ) {
    if (!module) {
      throw new Error(`模块未被解析,文件名${filePath},模块名${moduleName}`);
    }
    const useList =
      this.dependencyUseModule.get(path.normalize(module.resolvedFileName)) ||
      [];
    useList.push(filePath);
    this.dependencyUseModule.set(
      path.normalize(module.resolvedFileName),
      useList,
    );
  }
  private augmentResolveModuleNames(
    host: ts.CompilerHost,
    compilerOptions: CompilerOptions,
  ) {
    const moduleResolutionCache = ts.createModuleResolutionCache(
      host.getCurrentDirectory(),
      host.getCanonicalFileName.bind(host),
      compilerOptions,
    );
    const oldResolveModuleNames = host.resolveModuleNames;
    if (oldResolveModuleNames) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      host.resolveModuleNames = (moduleNames: string[], ...args: any[]) => {
        return moduleNames.map((name) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = (oldResolveModuleNames! as any).call(
            host,
            [name],
            ...args,
          );
          this.saveModuleDependency(args[0], name, result);

          return result;
        });
      };
    } else {
      host.resolveModuleNames = (
        moduleNames: string[],
        containingFile: string,
        _reusedNames: string[] | undefined,
        redirectedReference: ts.ResolvedProjectReference | undefined,
        options: ts.CompilerOptions,
      ) => {
        return moduleNames.map((name) => {
          const result = ts.resolveModuleName(
            name,
            containingFile,
            options,
            host,
            moduleResolutionCache,
            redirectedReference,
          ).resolvedModule;
          if (!containingFile.includes('node_modules')) {
            this.saveModuleDependency(containingFile, name, result!);
          }
          return result;
        });
      };
    }
  }

  async analyzeAsync() {
    await this.initTscProgram();
    await this.ngCompiler.analyzeAsync();
  }
  cleanDependencyFileCache() {
    this.cleanDependencyFileCacheSet.forEach((filePath) => {
      try {
        this.compiler.inputFileSystem?.purge!(filePath);
      } catch (error) {}
    });
  }
  private augmentProgramWithVersioning(program: ts.Program): void {
    const baseGetSourceFiles = program.getSourceFiles;
    program.getSourceFiles = function (...parameters) {
      const files: readonly (ts.SourceFile & { version?: string })[] =
        baseGetSourceFiles(...parameters);

      for (const file of files) {
        if (file.version === undefined) {
          file.version = createHash('sha256').update(file.text).digest('hex');
        }
      }

      return files;
    };
  }
}
