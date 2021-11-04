import { dirname, join, normalize, strings } from '@angular-devkit/core';
import { NgtscProgram } from '@angular/compiler-cli';
import { ResolvedValue } from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import { readConfiguration } from '@angular/compiler-cli/src/perform_compile';
import { externalizePath, normalizePath } from '@ngtools/webpack/src/ivy/paths';
import {
  InputFileSystemSync,
  createWebpackSystem,
} from '@ngtools/webpack/src/ivy/system';
import { WebpackResourceLoader } from '@ngtools/webpack/src/resource_loader';
import { TsChange } from 'cyia-code-util';
import {
  DeleteChange,
  InsertChange,
} from 'cyia-code-util/dist/change/content-change';
import * as path from 'path';
import { Inject, Injectable, Injector } from 'static-injector';
import ts, {
  CallExpression,
  CompilerOptions,
  ObjectLiteralExpression,
  SourceFile,
  TypeChecker,
} from 'typescript';
import * as webpack from 'webpack';

import { RawSource } from 'webpack-sources';
import { ExportWeiXinAssetsPluginSymbol } from '../const';
import { TemplateGlobalContext } from '../html/node-handle/global-context';
import { TemplateCompiler } from '../html/template-compiler';
import { TemplateInterpolationService } from '../html/template-interpolation.service';
import { TemplateService } from '../html/template.service';
import { ComponentTemplateLoaderContext } from '../loader/type';
import { BuildPlatform } from '../platform/platform';
import { PlatformInfo } from '../platform/platform-info';
import {
  COMPONENT_FILE_NAME_TOKEN,
  COMPONENT_TEMPLATE_CONTENT_TOKEN,
  TEMPLATE_COMPILER_OPTIONS_TOKEN,
} from '../token/component.token';
import { TS_CONFIG_TOKEN } from '../token/project.token';
import {
  NGTSC_PROGRAM,
  NG_COMPILER,
  TS_SYSTEM,
  TS_TPROGRAM,
} from '../token/ts-program.token';
import { WEBPACK_COMPILATION } from '../token/webpack.token';
import { DecoratorMetaDataResolver } from '../ts/decorator-metadata-resolver';
import { PagePattern } from '../type';
import { RawUpdater } from '../util/raw-updater';
import { NgComponentCssExtractPlugin } from './ng-component-css-extract.plugin';

export interface ExportWeiXinAssetsPluginOptions {
  /** tsConfig配置路径 */
  tsConfig: string;
  buildPlatform: PlatformInfo;
}
/** 导出微信的wxml与wxss */
@Injectable()
export class ExportWeiXinAssetsPlugin {
  private pageList!: PagePattern[];
  private componentList!: PagePattern[];
  private system!: ts.System;
  private WXMLMap = new Map<string, string>();
  private dependencyUseModule = new Map<string, string[]>();
  // private program!: ts.Program;
  private compiler!: webpack.Compiler;
  private compilation!: webpack.Compilation;
  private typeChecker!: TypeChecker;
  private resolver!: DecoratorMetaDataResolver;
  private componentToModule = new Map<SourceFile, SourceFile>();
  private changeFileMap = new Map<
    string,
    { sizeOffset: number; content: string }
  >();
  private updateLogicMap = new Map<string, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private originInputFileSystemSync: { readFileSync: any; statSync: any } = {
    readFileSync: undefined,
    statSync: undefined,
  };
  private cleanDependencyFileCacheSet = new Set<string>();
  private options: ExportWeiXinAssetsPluginOptions;
  constructor(
    @Inject(TS_CONFIG_TOKEN) tsConfig: string,
    buildPlatform: BuildPlatform,
    private injector: Injector
  ) {
    this.options = {
      tsConfig: tsConfig,
      buildPlatform: buildPlatform,
    };
  }
  apply(compiler: webpack.Compiler) {
    this.compiler = compiler;
    const resourceLoader = new WebpackResourceLoader(compiler.watchMode);
    const ifs = this.compiler.inputFileSystem as InputFileSystemSync;
    this.originInputFileSystemSync.readFileSync = ifs.readFileSync;
    this.originInputFileSystemSync.statSync = ifs.statSync;
    let oldBuilder: ts.EmitAndSemanticDiagnosticsBuilderProgram | undefined =
      undefined;

    compiler.hooks.thisCompilation.tap(
      'ExportWeiXinAssetsPlugin',
      (compilation) => {
        const config = readConfiguration(this.options.tsConfig, undefined);
        this.system = createWebpackSystem(
          compiler.inputFileSystem as InputFileSystemSync,
          normalizePath(compiler.context)
        );
        this.restore();
        this.compilation = compilation;
        const host = ts.createIncrementalCompilerHost(
          config.options,
          this.system
        );
        this.augmentResolveModuleNames(host, config.options);
        this.addCleanDependency(host);
        // this.program = ts.createProgram(config.rootNames, config.options, host);
        // this.typeChecker = this.program.getTypeChecker();
        const program = new NgtscProgram(
          config.rootNames,
          config.options,
          host
        );
        const ngCompiler = program.compiler;

        const typeScriptProgram = program.getTsProgram();
        let builder:
          | ts.BuilderProgram
          | ts.EmitAndSemanticDiagnosticsBuilderProgram;
        if (compiler.watchMode) {
          builder = oldBuilder =
            ts.createEmitAndSemanticDiagnosticsBuilderProgram(
              typeScriptProgram,
              host,
              oldBuilder
            );
        } else {
          builder = ts.createAbstractBuilder(typeScriptProgram, host);
        }
        const waitAnalyzeAsync = ngCompiler.analyzeAsync();
        const injector = Injector.create({
          providers: [
            { provide: TemplateService },
            { provide: NG_COMPILER, useValue: ngCompiler },
            { provide: TS_TPROGRAM, useValue: typeScriptProgram },
            { provide: NGTSC_PROGRAM, useValue: program },
            { provide: WEBPACK_COMPILATION, useValue: compilation },
            {
              provide: TS_SYSTEM,
              useValue: this.system,
            },
          ],
          parent: this.injector,
        });
        const templateService = injector.get(TemplateService);
        this.changeFileMap = templateService.removeStyle();

        this.hookFileSystemFile();
        // const ngComponentCssExtractPlugin = new NgComponentCssExtractPlugin(
        //   this.resolver.getComponentMetaMap(),
        //   resourceLoader
        // );
        // ngComponentCssExtractPlugin.run(compilation);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (compilation as any)[ExportWeiXinAssetsPluginSymbol] = {
          updateLogicMap: this.updateLogicMap,
          platformInfo: this.options.buildPlatform,
        } as ComponentTemplateLoaderContext;
        compilation.hooks.processAssets.tapAsync(
          'ExportWeiXinAssetsPlugin',
          async (assets, cb) => {
            await waitAnalyzeAsync;
            templateService.buildTemplate();
            /**
             * 等待分析结束
             * 读组件组件节点的数据TraitCompiler compile
             * 通过组件节点数据生成SelectorMatcher
             * 比较标签类型,指令类型得到实际的指令索引
             * 对索引固化
             */
            // const cssMap = ngComponentCssExtractPlugin.getAllCss();
            // for (const [key, value] of cssMap.entries()) {
            //   const entry = this.getModuleEntry(
            //     this.componentToModule.get(key.getSourceFile())!
            //   );
            //   compilation.assets[entry!.outputWXSS] = new RawSource(
            //     await value
            //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
            //   ) as any;
            // }

            this.WXMLMap.forEach((value, key) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              compilation.assets[key] = new RawSource(value) as any;
            });

            cb();
          }
        );
        this.cleanDependencyFileCacheSet.forEach((filePath) => {
          try {
            compiler.inputFileSystem.purge!(filePath);
          } catch (error) {}
        });
      }
    );
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

  private getModuleEntry(sf: SourceFile) {
    const findList = [sf.fileName];
    let maybeEntryPath: PagePattern | undefined;

    while (findList.length) {
      const module = findList.pop();
      const moduleList = this.dependencyUseModule.get(path.normalize(module!));
      if (moduleList && moduleList.length) {
        findList.push(...moduleList);
      } else {
        maybeEntryPath = [...this.pageList, ...this.componentList].find(
          (item) => path.normalize(item.src) === path.normalize(module!)
        );
        if (maybeEntryPath) {
          break;
        }
      }
    }
    return maybeEntryPath;
  }
  // private removeTemplateAndStyleInTs(
  //   objectNode: ObjectLiteralExpression,
  //   sf: SourceFile,
  //   htmlString: string
  // ) {
  //   const change = new TsChange(sf);
  //   const list: (InsertChange | DeleteChange)[] = change.deleteChildNode(
  //     objectNode,
  //     (node) => {
  //       let value: string;
  //       if (ts.isPropertyAssignment(node)) {
  //         const propertyName = node.name;
  //         if (
  //           ts.isIdentifier(propertyName) ||
  //           ts.isStringLiteral(propertyName) ||
  //           ts.isNumericLiteral(propertyName)
  //         ) {
  //           value = propertyName.text;
  //         } else {
  //           return false;
  //         }
  //       } else if (ts.isShorthandPropertyAssignment(node)) {
  //         value = node.name.text;
  //       } else {
  //         return false;
  //       }

  //       return /^(templateUrl|template|styleUrls|styles)$/.test(
  //         value as string
  //       );
  //     }
  //   );
  //   if (typeof htmlString === 'string' && htmlString) {
  //     list.push(change.insertChildNode(objectNode, `template:"${htmlString}"`));
  //   } else {
  //     list.push(change.insertChildNode(objectNode, `template:''`));
  //   }
  //   list.sort((a, b) => {
  //     return b.start - a.start;
  //   });
  //   const content = RawUpdater.update(sf.text, list);
  //   this.changeFileMap.set(path.normalize(sf.fileName), {
  //     sizeOffset: sf.text.length - content.length,
  //     content: content,
  //   });
  // }
  // private buildWxmlTemplate(
  //   classDeclaration: ts.ClassDeclaration,
  //   meta: Record<string, ResolvedValue>
  // ) {
  //   let templateContent = '';
  //   const templateUrl = meta['templateUrl'] as string;
  //   if (templateUrl) {
  //     templateContent = this.system.readFile(templateUrl)!;
  //     this.compilation.fileDependencies.add(templateUrl);
  //   } else {
  //     templateContent = meta['template'] as string;
  //   }
  //   if (typeof templateContent !== 'string') {
  //     throw new Error('解析错误');
  //   }
  //   const interpolation = meta['interpolation'] as string[];
  //   const injector = Injector.create({
  //     parent: this.injector,
  //     providers: [
  //       { provide: TemplateCompiler },
  //       {
  //         provide: COMPONENT_FILE_NAME_TOKEN,
  //         useValue: classDeclaration.getSourceFile().fileName,
  //       },
  //       {
  //         provide: COMPONENT_TEMPLATE_CONTENT_TOKEN,
  //         useValue: templateContent,
  //       },
  //       {
  //         provide: TEMPLATE_COMPILER_OPTIONS_TOKEN,
  //         useValue: { interpolation },
  //       },
  //       { provide: TemplateInterpolationService },
  //       { provide: TemplateGlobalContext },
  //     ],
  //   });
  //   const instance = injector.get(TemplateCompiler);
  //   return instance.transform();
  // }
  private restore() {
    const ifs = this.compiler.inputFileSystem as InputFileSystemSync;
    ifs.readFileSync = this.originInputFileSystemSync.readFileSync;
    ifs.statSync = this.originInputFileSystemSync.statSync;
    this.changeFileMap = new Map();
    this.updateLogicMap = new Map();
    this.cleanDependencyFileCacheSet = new Set();
    this.dependencyUseModule = new Map();
    this.componentToModule = new Map();
  }
  private hookFileSystemFile() {
    const _this = this;
    const ifs = this.compiler.inputFileSystem as InputFileSystemSync;
    const oldReadFileSync = ifs.readFileSync;
    ifs.readFileSync = function (filePath: string) {
      const changeFile = _this.changeFileMap.get(path.normalize(filePath));
      if (changeFile) {
        return Buffer.from(changeFile.content);
      }
      return oldReadFileSync.call(this, filePath);
    };
    const oldStatSync = ifs.statSync;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ifs.statSync = function (filePath: string, ...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stat = (oldStatSync as any).apply(this, [filePath, ...args]);
      const changeFile = _this.changeFileMap.get(path.normalize(filePath));
      if (changeFile) {
        stat.size = stat.size - changeFile.sizeOffset;
      }
      return stat;
    };
  }
  public setEntry(pageList: PagePattern[], componentList: PagePattern[]) {
    this.pageList = pageList;
    this.componentList = componentList;
  }
}
