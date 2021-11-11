import { dirname, join, normalize } from '@angular-devkit/core';
import { CssSelector, SelectorMatcher } from '@angular/compiler';
import {
  NgtscProgram,
  ParsedConfiguration,
  readConfiguration,
} from '@angular/compiler-cli';
import { ComponentResolutionData } from '@angular/compiler-cli/src/ngtsc/annotations/src/component';
import { NgCompiler } from '@angular/compiler-cli/src/ngtsc/core';
import { ResolvedValue } from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {
  ClassRecord,
  TraitCompiler,
} from '@angular/compiler-cli/src/ngtsc/transform';
import { externalizePath } from '@ngtools/webpack/src/ivy/paths';
import { InputFileSystemSync } from '@ngtools/webpack/src/ivy/system';
import { DeleteChange, InsertChange, TsChange } from 'cyia-code-util';
import * as path from 'path';
import { Inject, Injectable, Injector } from 'static-injector';
import ts, {
  CallExpression,
  ClassDeclaration,
  CompilerOptions,
  Node,
  ObjectLiteralExpression,
  SourceFile,
} from 'typescript';
import { Compilation, Compiler } from 'webpack';
import {
  COMPONENT_FILE_NAME_TOKEN,
  COMPONENT_META,
  COMPONENT_TEMPLATE_CONTENT_TOKEN,
  DIRECTIVE_MATCHER,
  TEMPLATE_COMPILER_OPTIONS_TOKEN,
} from '../token/component.token';
import { TS_CONFIG_TOKEN } from '../token/project.token';
import { OLD_BUILDER, TS_SYSTEM } from '../token/ts-program.token';
import { WEBPACK_COMPILATION, WEBPACK_COMPILER } from '../token/webpack.token';
import { DecoratorMetaDataResolver } from '../ts/decorator-metadata-resolver';
import { PagePattern } from '../type';
import { RawUpdater } from '../util/raw-updater';
import { TemplateGlobalContext } from './node-handle/global-context';
import { TemplateCompiler } from './template-compiler';
import { TemplateInterpolationService } from './template-interpolation.service';

@Injectable()
export class TemplateService {
  private pageList!: PagePattern[];
  private componentList!: PagePattern[];
  private dependencyUseModule = new Map<string, string[]>();
  private cleanDependencyFileCacheSet = new Set<string>();

  private resolver!: DecoratorMetaDataResolver;
  private componentToModule = new Map<SourceFile, SourceFile>();
  private changeFileMap = new Map<
    string,
    { sizeOffset: number; content: string }
  >();
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
    @Inject(OLD_BUILDER) private oldBuilder: any
  ) {
    this.initTscProgram();
    this.resolver = new DecoratorMetaDataResolver(
      this.tsProgram,
      this.tsProgram.getTypeChecker()
    );
    this.tsProgram
      .getSourceFiles()
      .filter((sf) => !sf.isDeclarationFile)
      .filter((sf) => !sf.fileName.includes('node_modules'))
      .forEach((item) => {
        this.resolver.resolverSourceFile(item);
      });
    this.resolver.getModuleMetaMap().forEach((value, key) => {
      if (value['declarations'] && value['declarations'].length) {
        if (value['declarations'].length > 1) {
          throw new Error('类声明组件超过一个');
        }
        const ref = value['declarations'][0];
        const sf = ref.node.getSourceFile();
        this.componentToModule.set(sf, key.getSourceFile());
      }
    });
  }
  removeStyle() {
    this.resolver.getComponentMetaMap().forEach((value, key) => {
      this.removeTemplateAndStyleInTs(
        (key.decorators![0].expression as CallExpression)
          .arguments[0] as ObjectLiteralExpression,
        key.getSourceFile(),
        ''
      );
    });
    return this.changeFileMap;
  }
  buildTemplate() {
    const traitCompiler: TraitCompiler = (this.ngCompiler as any).compilation
      .traitCompiler;
    const WXMLMap = new Map<string, string>();
    const updateLogicMap = new Map<string, string>();
    this.resolver.getComponentMetaMap().forEach((value, key) => {
      const original = ts.getOriginalNode(key) as ClassDeclaration;
      const record = (
        (traitCompiler as any).classes as Map<ts.ClassDeclaration, ClassRecord>
      ).get(original)!;
      const list = record.traits.filter(
        (trait) => trait.handler.name === 'ComponentDecoratorHandler'
      );
      list.forEach((trait) => {
        let directiveMatcher: SelectorMatcher | null = null;

        const meta: ComponentResolutionData = {
          ...(trait as any).analysis.meta,
          ...((trait as any).resolution as ComponentResolutionData),
        };
        if (meta.directives.length > 0) {
          const matcher = new SelectorMatcher();
          for (const directive of meta.directives) {
            const selector = directive.selector;
            matcher.addSelectables(CssSelector.parse(selector), directive);
          }
          directiveMatcher = matcher;
        }
        const WXMLTemplate = this.buildWxmlTemplate(
          key,
          value,
          directiveMatcher,
          meta
        );
        const module = this.componentToModule.get(key.getSourceFile());
        const entry = this.getModuleEntry(module!);
        if (!entry) {
          throw new Error('没有找到对应的出口信息');
        }
        WXMLMap.set(entry.outputWXML, WXMLTemplate.content);
        if (WXMLTemplate.template) {
          WXMLMap.set(
            join(dirname(normalize(entry.outputWXML)), 'template.wxml'),
            WXMLTemplate.template
          );
        }
        updateLogicMap.set(
          path.normalize(key.getSourceFile().fileName),
          WXMLTemplate.logic
        );
      });
    });
    return { WXMLMap: WXMLMap, updateLogicMap: updateLogicMap };
  }
  private removeTemplateAndStyleInTs(
    objectNode: ObjectLiteralExpression,
    sf: SourceFile,
    htmlString: string
  ) {
    const change = new TsChange(sf);
    const list: (InsertChange | DeleteChange)[] = change.deleteChildNode(
      objectNode,
      (node) => {
        let value: string;
        if (ts.isPropertyAssignment(node)) {
          const propertyName = node.name;
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

        return /^(styleUrls|styles)$/.test(value as string);
      }
    );
    list.sort((a, b) => {
      return b.start - a.start;
    });
    const content = RawUpdater.update(sf.text, list);
    this.changeFileMap.set(path.normalize(sf.fileName), {
      sizeOffset: sf.text.length - content.length,
      content: content,
    });
  }

  private buildWxmlTemplate(
    classDeclaration: ts.ClassDeclaration,
    meta: Record<string, ResolvedValue>,
    directiveMatcher: SelectorMatcher | null,
    componentMeta: ComponentResolutionData
  ) {
    let templateContent = '';
    const templateUrl = meta['templateUrl'] as string;
    if (templateUrl) {
      templateContent = this.system.readFile(templateUrl)!;
      this.compilation.fileDependencies.add(templateUrl);
    } else {
      templateContent = meta['template'] as string;
    }
    if (typeof templateContent !== 'string') {
      throw new Error('解析错误');
    }
    const interpolation = meta['interpolation'] as string[];
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: TemplateCompiler },
        { provide: COMPONENT_META, useValue: componentMeta },

        { provide: TemplateInterpolationService },
        { provide: DIRECTIVE_MATCHER, useValue: directiveMatcher },
      ],
    });
    const instance = injector.get(TemplateCompiler);
    return instance.transform();
  }
  private initHost(config: ParsedConfiguration) {
    const host = ts.createIncrementalCompilerHost(config.options, this.system);
    this.augmentResolveModuleNames(host, config.options);
    this.addCleanDependency(host);
    return host;
  }
  private initTscProgram() {
    const config = readConfiguration(this.tsConfig, undefined);
    const ifs = this.compiler.inputFileSystem as InputFileSystemSync;
    const host = this.initHost(config);
    this.ngTscProgram = new NgtscProgram(
      config.rootNames,
      config.options,
      host
    );
    this.tsProgram = this.ngTscProgram.getTsProgram();
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
  public setEntry(pageList: PagePattern[], componentList: PagePattern[]) {
    this.pageList = pageList;
    this.componentList = componentList;
  }
  public getComponentMetaMap() {
    return this.resolver.getComponentMetaMap();
  }
  analyzeAsync() {
    return this.ngCompiler.analyzeAsync();
  }
  getBuilder() {
    return this.builder;
  }
  getModuleEntryFromCss(sf: Node) {
    return this.getModuleEntry(
      this.componentToModule.get(sf.getSourceFile()!)!
    );
  }
}
