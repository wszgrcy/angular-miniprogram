import { join, normalize, resolve } from '@angular-devkit/core';
import type { NgtscProgram, ParsedConfiguration } from '@angular/compiler-cli';
import type { NgCompiler } from '@angular/compiler-cli/src/ngtsc/core';
import { externalizePath } from '@ngtools/webpack/src/ivy/paths';
import { createHash } from 'crypto';
import * as path from 'path';
import { Inject, Injectable, Injector } from 'static-injector';
import ts from 'typescript';
import type { CompilerOptions } from 'typescript';
import { Compilation, Compiler } from 'webpack';
import { LIBRARY_OUTPUT_PATH } from '../const';
import { PAGE_PATTERN_TOKEN, TS_CONFIG_TOKEN } from '../token/project.token';
import { OLD_BUILDER, TS_SYSTEM } from '../token/ts-program.token';
import { WEBPACK_COMPILATION, WEBPACK_COMPILER } from '../token/webpack.token';
import { PagePattern } from '../type';
import { angularCompilerCliPromise } from '../util/load_esm';
import { MiniProgramPlatformCompilerService } from './mini-program-platform-compiler.service';

@Injectable()
export class TemplateService {
  private dependencyUseModule = new Map<string, string[]>();
  private cleanDependencyFileCacheSet = new Set<string>();
  builder!: ts.BuilderProgram | ts.EmitAndSemanticDiagnosticsBuilderProgram;
  private ngTscProgram!: NgtscProgram;
  private tsProgram!: ts.Program;
  private ngCompiler!: NgCompiler;

  constructor(
    private injector: Injector,
    @Inject(WEBPACK_COMPILATION) private compilation: Compilation,
    @Inject(TS_SYSTEM) private system: ts.System,
    @Inject(WEBPACK_COMPILER) private compiler: Compiler,
    @Inject(TS_CONFIG_TOKEN) private tsConfig: string,
    @Inject(OLD_BUILDER)
    private oldBuilder: ts.EmitAndSemanticDiagnosticsBuilderProgram | undefined,
    @Inject(PAGE_PATTERN_TOKEN) private pagePatternList: PagePattern[]
  ) {}

  async exportComponentBuildMetaMap() {
    const injector = Injector.create({
      providers: [
        {
          provide: MiniProgramPlatformCompilerService,
          useFactory: (injector: Injector) => {
            return new MiniProgramPlatformCompilerService(
              this.ngTscProgram,
              injector
            );
          },
          deps: [Injector],
        },
      ],
      parent: this.injector,
    });
    const miniProgramPlatformCompilerService = injector.get(
      MiniProgramPlatformCompilerService
    );
    miniProgramPlatformCompilerService.init();
    const metaMap =
      await miniProgramPlatformCompilerService.exportComponentBuildMetaMap();
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
    metaMap.outputContentTemplate.forEach((value, key) => {
      const entryPattern = this.getComponentPagePattern(key);
      contentMap.set(entryPattern.outputFiles.contentTemplate, value);
    });
    metaMap.style = styleMap;
    const config = new Map<
      string,
      {
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
            join(normalize(LIBRARY_OUTPUT_PATH), item.path)
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
        usingComponents: list,
        existConfig: entryPattern.inputFiles.config,
      });
    });
    return {
      style: styleMap,
      outputContent: contentMap,
      meta: metaMap.meta,
      config: config,
    };
  }

  private initHost(config: ParsedConfiguration) {
    const host = ts.createIncrementalCompilerHost(config.options, this.system);
    this.augmentResolveModuleNames(host, config.options);
    this.addCleanDependency(host);
    return host;
  }
  private async initTscProgram() {
    const config = (await angularCompilerCliPromise).readConfiguration(
      this.tsConfig,
      undefined
    );
    const host = this.initHost(config);
    this.ngTscProgram = new (await angularCompilerCliPromise).NgtscProgram(
      config.rootNames,
      config.options,
      host
    );
    this.tsProgram = this.ngTscProgram.getTsProgram();
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
  private getComponentPagePattern(fileName: string) {
    const findList = [fileName];
    let maybeEntryPath: PagePattern | undefined;

    while (findList.length) {
      const module = findList.pop();
      const moduleList = this.dependencyUseModule.get(path.normalize(module!));
      if (moduleList && moduleList.length) {
        findList.push(...moduleList);
      } else {
        maybeEntryPath = this.pagePatternList.find(
          (item) => path.normalize(item.src) === path.normalize(module!)
        );
        if (maybeEntryPath) {
          break;
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
