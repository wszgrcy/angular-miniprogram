import * as webpack from 'webpack';
import {
  createWebpackSystem,
  InputFileSystemSync,
} from '@ngtools/webpack/src/ivy/system';
import { externalizePath, normalizePath } from '@ngtools/webpack/src/ivy/paths';
import ts, {
  CallExpression,
  CompilerOptions,
  ObjectLiteralExpression,
  SourceFile,
  TypeChecker,
} from 'typescript';

import { readConfiguration } from '@angular/compiler-cli/src/perform_compile';
import { TsChange } from 'cyia-code-util';
import * as path from 'path';
import {
  DeleteChange,
  InsertChange,
} from 'cyia-code-util/dist/change/content-change';
import { RawSource } from 'webpack-sources';
import { PagePattern } from '../type';
import { ExportWeiXinAssetsPluginSymbol } from '../const';
import { dirname, join, normalize, strings } from '@angular-devkit/core';
import { TemplateCompiler } from '../html/template-compiler';
import { DecoratorMetaDataResolver } from '../ts/decorator-metadata-resolver';
import { ResolvedValue } from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import { RawUpdater } from '../util/raw-updater';
import { NgComponentCssExtractPlugin } from './ng-component-css-extract.plugin';
import { PlatformInfo } from '../platform/platform-info';
import { WebpackResourceLoader } from '@ngtools/webpack/src/resource_loader';
export interface ExportWeiXinAssetsPluginOptions {
  /** tsConfig配置路径 */
  tsConfig: string;
  pageList: PagePattern[];
  componentList: PagePattern[];
  platformInfo: PlatformInfo;
}
/**导出微信的wxml与wxss */
export class ExportWeiXinAssetsPlugin {
  private system!: ts.System;
  private WXMLMap = new Map<string, string>();
  private dependencyUseModule = new Map<string, string[]>();
  private program!: ts.Program;
  private compiler!: webpack.Compiler;
  private compilation!: webpack.Compilation;
  private typeChecker!: TypeChecker;
  private resolver!: DecoratorMetaDataResolver;
  private componentToModule = new Map<SourceFile, SourceFile>();
  private changeFileMap = new Map<
    string,
    { sizeOffset: number; content: string }
  >();
  private htmlContext = new Map<string, string[]>();
  private originInputFileSystemSync: { readFileSync: any; statSync: any } = {
    readFileSync: undefined,
    statSync: undefined,
  };
  private cleanDependencyFileCacheSet = new Set<string>();
  constructor(private options: ExportWeiXinAssetsPluginOptions) {}
  apply(compiler: webpack.Compiler) {
    this.compiler = compiler;
    let resourceLoader = new WebpackResourceLoader(compiler.watchMode);
    let ifs = this.compiler.inputFileSystem as InputFileSystemSync;
    this.originInputFileSystemSync.readFileSync = ifs.readFileSync;
    this.originInputFileSystemSync.statSync = ifs.statSync;
    let config = readConfiguration(this.options.tsConfig, undefined);
    compiler.hooks.thisCompilation.tap(
      'ExportWeiXinAssetsPlugin',
      (compilation) => {
        this.system = createWebpackSystem(
          compiler.inputFileSystem as InputFileSystemSync,
          normalizePath(compiler.context)
        );
        this.restore();
        this.compilation = compilation;
        let host = ts.createIncrementalCompilerHost(
          config.options,
          this.system
        );
        this.augmentResolveModuleNames(host, config.options);
        this.addCleanDependency(host);
        this.program = ts.createProgram(config.rootNames, config.options, host);
        this.typeChecker = this.program.getTypeChecker();
        this.resolver = new DecoratorMetaDataResolver(
          this.program,
          this.typeChecker
        );
        this.program
          .getSourceFiles()
          .filter((sf) => !sf.isDeclarationFile)
          .filter((sf) => !sf.fileName.includes('node_modules'))
          .forEach((item) => {
            this.resolver.resolverSourceFile(item);
          });
        this.resolver.getModuleMetaMap().forEach((value, key) => {
          if (value['declarations'] && value['declarations'].length) {
            if (value['declarations'].length > 1) {
              throw '类声明组件超过一个';
            }
            let ref = value['declarations'][0];
            let sf = ref.node.getSourceFile();
            this.componentToModule.set(sf, key.getSourceFile());
          }
        });
        this.resolver.getComponentMetaMap().forEach((value, key) => {
          let WXMLTemplate = this.buildWxmlTemplate(key, value);
          let module = this.componentToModule.get(key.getSourceFile());
          let entry = this.getModuleEntry(module!);
          if (!entry) {
            throw '没有找到对应的出口信息';
          }
          this.WXMLMap.set(entry.outputWXML, WXMLTemplate.content);
          if (WXMLTemplate.template) {
            this.WXMLMap.set(
              join(dirname(normalize(entry.outputWXML)), 'template.wxml'),
              WXMLTemplate.template
            );
          }
          this.removeTemplateAndStyleInTs(
            (key.decorators![0].expression as CallExpression)
              .arguments[0] as ObjectLiteralExpression,
            key.getSourceFile()
          );
          this.htmlContext.set(
            path.normalize(key.getSourceFile().fileName),
            WXMLTemplate.context
          );
        });
        this.hookFileSystemFile();
        let ngComponentCssExtractPlugin = new NgComponentCssExtractPlugin(
          this.resolver.getComponentMetaMap(),
          resourceLoader
        );
        ngComponentCssExtractPlugin.run(compilation);

        (compilation as any)[ExportWeiXinAssetsPluginSymbol] = {
          htmlContextMap: this.htmlContext,
          platformInfo: this.options.platformInfo,
        };
        compilation.hooks.processAssets.tapAsync(
          'ExportWeiXinAssetsPlugin',
          async (assets, cb) => {
            let cssMap = ngComponentCssExtractPlugin.getAllCss();
            for (const [key, value] of cssMap.entries()) {
              let entry = this.getModuleEntry(
                this.componentToModule.get(key.getSourceFile())!
              );
              compilation.assets[entry!.outputWXSS] = new RawSource(
                await value
              ) as any;
            }

            this.WXMLMap.forEach((value, key) => {
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
    let oldReadFile = host.readFile;
    let _this = this;
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
    let oldResolveModuleNames = host.resolveModuleNames;
    if (oldResolveModuleNames) {
      (host as any).resolveModuleNames = (
        moduleNames: string[],
        ...args: any[]
      ) => {
        return moduleNames.map((name) => {
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
    let useList =
      this.dependencyUseModule.get(path.normalize(module.resolvedFileName)) ||
      [];
    useList.push(filePath);
    this.dependencyUseModule.set(
      path.normalize(module.resolvedFileName),
      useList
    );
  }

  private getModuleEntry(sf: SourceFile) {
    let findList = [sf.fileName];
    let maybeEntryPath: PagePattern | undefined;

    while (findList.length) {
      let module = findList.pop();
      let moduleList = this.dependencyUseModule.get(path.normalize(module!));
      if (moduleList && moduleList.length) {
        findList.push(...moduleList);
      } else {
        maybeEntryPath = [
          ...this.options.pageList,
          ...this.options.componentList,
        ].find((item) => path.normalize(item.src) === path.normalize(module!));
        if (maybeEntryPath) {
          break;
        }
      }
    }
    return maybeEntryPath;
  }
  private removeTemplateAndStyleInTs(
    objectNode: ObjectLiteralExpression,
    sf: SourceFile
  ) {
    let change = new TsChange(sf);
    let list: (InsertChange | DeleteChange)[] = change.deleteChildNode(
      objectNode,
      (node) => {
        let value: string;
        let propertyName = (node as any).name;
        if (ts.isPropertyAssignment(node)) {
          if (
            ts.isIdentifier(propertyName) ||
            ts.isStringLiteral(propertyName) ||
            ts.isNumericLiteral(propertyName)
          ) {
            value = propertyName.text;
          } else {
            return false;
          }
        } else if (ts.isShorthandPropertyAssignment(node)) {
          value = node.name.text;
        } else {
          return false;
        }
        return /^(templateUrl|template|styleUrls|styles)$/.test(
          value as string
        );
      }
    );
    list.push(change.insertChildNode(objectNode, `template:''`));
    list.sort((a, b) => {
      return b.start - a.start;
    });
    let content = RawUpdater.update(sf.text, list);
    this.changeFileMap.set(path.normalize(sf.fileName), {
      sizeOffset: sf.text.length - content.length,
      content: content,
    });
  }
  private buildWxmlTemplate(
    classDeclaration: ts.ClassDeclaration,
    meta: Record<string, ResolvedValue>
  ) {
    let templateContent = '';
    let templateUrl = meta['templateUrl'] as string;
    if (templateUrl) {
      templateContent = this.system.readFile(templateUrl)!;
      this.compilation.fileDependencies.add(templateUrl);
    } else {
      templateContent = meta['template'] as string;
    }
    if (typeof templateContent !== 'string') {
      throw '解析错误';
    }
    let interpolation = meta['interpolation'] as string[];
    let instance = new TemplateCompiler(
      classDeclaration.getSourceFile().fileName,
      templateContent,
      this.options.platformInfo.templateTransform,
      { interpolation }
    );
    return instance.transform();
  }
  private restore() {
    let ifs = this.compiler.inputFileSystem as InputFileSystemSync;
    ifs.readFileSync = this.originInputFileSystemSync.readFileSync;
    ifs.statSync = this.originInputFileSystemSync.statSync;
    this.changeFileMap = new Map();
    this.htmlContext = new Map();
    this.cleanDependencyFileCacheSet = new Set();
    this.dependencyUseModule = new Map();
    this.componentToModule = new Map();
  }
  private hookFileSystemFile() {
    let _this = this;
    let ifs = this.compiler.inputFileSystem as InputFileSystemSync;
    let oldReadFileSync = ifs.readFileSync;
    ifs.readFileSync = function (filePath: string) {
      let changeFile = _this.changeFileMap.get(path.normalize(filePath));
      if (changeFile) {
        return Buffer.from(changeFile.content);
      }
      return oldReadFileSync.call(this, filePath);
    };
    let oldStatSync = ifs.statSync;
    ifs.statSync = function (filePath: string) {
      let stat = (oldStatSync as any).apply(this, Array.from(arguments));
      let changeFile = _this.changeFileMap.get(path.normalize(filePath));
      if (changeFile) {
        stat.size = stat.size - changeFile.sizeOffset;
      }
      return stat;
    };
  }
}
