import { join, normalize, resolve } from '@angular-devkit/core';
import type { NgtscProgram, ParsedConfiguration } from '@angular/compiler-cli';
import type { NgCompiler } from '@angular/compiler-cli/src/ngtsc/core';
import { externalizePath } from '@ngtools/webpack/src/ivy/paths';
import { createHash } from 'crypto';
import { createCssSelectorForTs } from 'cyia-code-util';
import * as path from 'path';
import { Inject, Injectable, Injector } from 'static-injector';
import ts from 'typescript';
import type { CompilerOptions } from 'typescript';
import { Compilation, Compiler } from 'webpack';
import { LIBRARY_OUTPUT_ROOTDIR } from '../library';
import { MiniProgramCompilerService } from '../mini-program-compiler';
import { BuildPlatform } from '../platform/platform';
import { angularCompilerCliPromise } from '../util/load_esm';
import {
  OLD_BUILDER,
  PAGE_PATTERN_TOKEN,
  TS_CONFIG_TOKEN,
  TS_SYSTEM,
  WEBPACK_COMPILATION,
  WEBPACK_COMPILER,
} from './token';
import type { PagePattern } from './type';

@Injectable()
export class MiniProgramApplicationAnalysisService {
  private dependencyUseModule = new Map<string, string[]>();
  private cleanDependencyFileCacheSet = new Set<string>();
  builder!: ts.BuilderProgram | ts.EmitAndSemanticDiagnosticsBuilderProgram;
  private ngTscProgram!: NgtscProgram;
  private tsProgram!: ts.Program;
  private ngCompiler!: NgCompiler;
  private typeChecker!: ts.TypeChecker;
  constructor(
    private injector: Injector,
    @Inject(WEBPACK_COMPILATION) private compilation: Compilation,
    @Inject(TS_SYSTEM) private system: ts.System,
    @Inject(WEBPACK_COMPILER) private compiler: Compiler,
    @Inject(TS_CONFIG_TOKEN) private tsConfig: string,
    @Inject(OLD_BUILDER)
    private oldBuilder: ts.EmitAndSemanticDiagnosticsBuilderProgram | undefined,
    @Inject(PAGE_PATTERN_TOKEN) private pagePatternList: PagePattern[],
    private buildPlatform: BuildPlatform
  ) {}

  async exportComponentBuildMetaMap() {
    const injector = Injector.create({
      providers: [
        {
          provide: MiniProgramCompilerService,
          useFactory: (injector: Injector, buildPlatform: BuildPlatform) => {
            return new MiniProgramCompilerService(
              this.ngTscProgram,
              injector,
              buildPlatform
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
      const entryPattern = this.getComponentPagePattern(key);
      styleMap.set(entryPattern.outputFiles.style, value);
    });
    const contentMap = new Map<string, string>();
    metaMap.outputContent.forEach((value, key) => {
      const entryPattern = this.getComponentPagePattern(key);
      contentMap.set(entryPattern.outputFiles.content, value);
    });

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
      const entryPattern = this.getComponentPagePattern(key);
      const list = [
        ...value.libraryPath.map((item) => {
          item.path = resolve(
            normalize('/'),
            join(normalize(LIBRARY_OUTPUT_ROOTDIR), item.path)
          );
          return item;
        }),
      ];
      list.push(
        ...value.localPath.map((item) => ({
          selector: item.selector,
          path: resolve(
            normalize('/'),
            normalize(this.getComponentPagePattern(item.path).outputFiles.path)
          ),
          className: item.className,
        }))
      );
      config.set(entryPattern.outputFiles.config, {
        component: entryPattern.type === 'component' || undefined,
        usingComponents: list,
        existConfig: entryPattern.inputFiles.config,
      });
    });

    for (const key in metaMap.otherMetaCollectionGroup) {
      if (
        Object.prototype.hasOwnProperty.call(
          metaMap.otherMetaCollectionGroup,
          key
        )
      ) {
        const element = metaMap.otherMetaCollectionGroup[key];
        element.libraryPath.forEach((item) => {
          item.path = resolve(
            normalize('/'),
            join(normalize(LIBRARY_OUTPUT_ROOTDIR), item.path)
          );
        });
        element.localPath.forEach((item) => {
          item.path = resolve(
            normalize('/'),
            normalize(this.getComponentPagePattern(item.path).outputFiles.path)
          );
        });
      }
    }
    return {
      style: styleMap,
      outputContent: contentMap,
      config: config,
      otherMetaCollectionGroup: metaMap.otherMetaCollectionGroup,
      selfTemplate,
    };
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
      host
    );
    this.tsProgram = this.ngTscProgram.getTsProgram();
    this.typeChecker = this.tsProgram.getTypeChecker();
    this.augmentProgramWithVersioning(this.tsProgram);
    if (this.compiler.watchMode) {
      this.builder = this.oldBuilder =
        ts.createEmitAndSemanticDiagnosticsBuilderProgram(
          this.tsProgram,
          host,
          this.oldBuilder
        );
    } else {
      this.builder = ts.createAbstractBuilder(this.tsProgram, host);
    }
    this.ngCompiler = this.ngTscProgram.compiler;
  }
  /** 获得组件/页面的入口 */
  private getComponentPagePattern(fileName: string) {
    const findList = [fileName];
    let maybeEntryPath: PagePattern | undefined;

    while (findList.length) {
      const module = findList.shift();
      const moduleList = this.dependencyUseModule.get(path.normalize(module!));
      if (moduleList && moduleList.length) {
        findList.push(...moduleList);
      } else {
        maybeEntryPath = this.pagePatternList.find(
          (item) => path.normalize(item.src) === path.normalize(module!)
        );
        if (maybeEntryPath) {
          const sourceFile = this.tsProgram.getSourceFile(maybeEntryPath.src)!;
          const selector = createCssSelectorForTs(sourceFile);
          let importComponent: ts.Expression;
          if (maybeEntryPath.type === 'page') {
            const node = selector.queryOne(
              `CallExpression[expression=pageStartup]`
            ) as ts.CallExpression;
            importComponent = node.arguments[1];
          } else {
            const node = selector.queryOne(
              `CallExpression[expression=componentRegistry]`
            ) as ts.CallExpression;
            importComponent = node.arguments[0];
          }
          const symbol = this.typeChecker.getSymbolAtLocation(importComponent);
          const node = symbol?.getDeclarations()?.[0];
          const importDeclaration = node?.parent.parent
            .parent as ts.ImportDeclaration;
          const relativeImportComponentPath = importDeclaration.moduleSpecifier
            .getText()
            .slice(1, -1);

          const importComponentPath =
            path.resolve(
              path.dirname(maybeEntryPath.src),
              path.normalize(relativeImportComponentPath)
            ) + '.ts';
          if (importComponentPath === path.normalize(fileName)) {
            break;
          }

          maybeEntryPath = undefined;
        }
      }
    }
    if (!maybeEntryPath) {
      throw new Error(`没有找到组件[${fileName}]对应的入口点`);
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
    module: ts.ResolvedModule
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
      useList
    );
  }
  private augmentResolveModuleNames(
    host: ts.CompilerHost,
    compilerOptions: CompilerOptions
  ) {
    const moduleResolutionCache = ts.createModuleResolutionCache(
      host.getCurrentDirectory(),
      host.getCanonicalFileName.bind(host),
      compilerOptions
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
            ...args
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
        options: ts.CompilerOptions
      ) => {
        return moduleNames.map((name) => {
          const result = ts.resolveModuleName(
            name,
            containingFile,
            options,
            host,
            moduleResolutionCache,
            redirectedReference
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
  getBuilder() {
    return this.builder;
  }
  cleanDependencyFileCache() {
    this.cleanDependencyFileCacheSet.forEach((filePath) => {
      try {
        this.compiler.inputFileSystem.purge!(filePath);
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
