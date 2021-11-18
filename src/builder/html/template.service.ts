import type { R3ComponentMetadata, SelectorMatcher } from '@angular/compiler';
import type {
  NgtscProgram,
  ParsedConfiguration,
  // readConfiguration,
} from '@angular/compiler-cli';
import type { ComponentResolutionData } from '@angular/compiler-cli/src/ngtsc/annotations/src/component';
import type { NgCompiler } from '@angular/compiler-cli/src/ngtsc/core';
import type {
  ClassRecord,
  TraitCompiler,
} from '@angular/compiler-cli/src/ngtsc/transform';
import { externalizePath } from '@ngtools/webpack/src/ivy/paths';
import { createHash } from 'crypto';
import { DeleteChange, InsertChange, TsChange } from 'cyia-code-util';
import * as path from 'path';
import { Inject, Injectable, Injector } from 'static-injector';
import ts from 'typescript';
import type {
  ClassDeclaration,
  CompilerOptions,
  ObjectLiteralExpression,
  SourceFile,
} from 'typescript';
import { Compilation, Compiler } from 'webpack';
import { COMPONENT_META, DIRECTIVE_MATCHER } from '../token/component.token';
import { PAGE_PATTERN_TOKEN, TS_CONFIG_TOKEN } from '../token/project.token';
import { OLD_BUILDER, TS_SYSTEM } from '../token/ts-program.token';
import { WEBPACK_COMPILATION, WEBPACK_COMPILER } from '../token/webpack.token';
// import { DecoratorMetaDataResolver } from '../ts/decorator-metadata-resolver';
import { PagePattern } from '../type';
import {
  angularCompilerCliPromise,
  angularCompilerPromise,
} from '../util/load_esm';
import { RawUpdater } from '../util/raw-updater';
import { ComponentContext } from './node-handle/global-context';
import { TemplateCompiler } from './template-compiler';
import { StyleHookData } from './type';
// import { getAngularCompiler } from '../util/load_esm';
// const angularCompilerPromise = getAngularCompiler();
@Injectable()
export class TemplateService {
  private dependencyUseModule = new Map<string, string[]>();
  private cleanDependencyFileCacheSet = new Set<string>();
  // private resolver!: DecoratorMetaDataResolver;
  builder!: ts.BuilderProgram | ts.EmitAndSemanticDiagnosticsBuilderProgram;
  private ngTscProgram!: NgtscProgram;
  private tsProgram!: ts.Program;
  private ngCompiler!: NgCompiler;
  private componentMap = new Map<ClassDeclaration, R3ComponentMetadata>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private directiveMap = new Map<ClassDeclaration, any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ngModuleMap = new Map<ClassDeclaration, any>();
  private componentToEntryMap = new Map<string, PagePattern>();
  constructor(
    private injector: Injector,
    @Inject(WEBPACK_COMPILATION) private compilation: Compilation,
    @Inject(TS_SYSTEM) private system: ts.System,
    @Inject(WEBPACK_COMPILER) private compiler: Compiler,
    @Inject(TS_CONFIG_TOKEN) private tsConfig: string,
    @Inject(OLD_BUILDER)
    private oldBuilder: ts.EmitAndSemanticDiagnosticsBuilderProgram | undefined,
    @Inject(PAGE_PATTERN_TOKEN) private pagePatternList: PagePattern[]
  ) {
    // this.resolver = new DecoratorMetaDataResolver(
    //   this.tsProgram,
    //   this.tsProgram.getTypeChecker()
    // );
    // this.tsProgram
    //   .getSourceFiles()
    //   .filter((sf) => !sf.isDeclarationFile)
    //   .filter((sf) => !sf.fileName.includes('node_modules'))
    //   .forEach((item) => {
    //     this.resolver.resolverSourceFile(item);
    //   });
    // this.resolver.getComponentMetaMap().forEach((value, key) => {
    //   const fileName = key.getSourceFile().fileName;
    //   this.componentToEntryMap.set(
    //     fileName,
    //     this.getComponentPagePattern(fileName)
    //   );
    // });
  }
  removeStyle() {
    const componentChangeMap = new Map<string, StyleHookData>();
    // this.resolver.getComponentMetaMap().forEach((value, key) => {
    //   const sf = key.getSourceFile();
    //   const fileName = sf.fileName;
    //   const pagePattern = this.componentToEntryMap.get(fileName)!;
    //   componentChangeMap.set(pagePattern.outputFiles.style, {
    //     ...this.removeTemplateAndStyleInTs(
    //       (key.decorators![0].expression as CallExpression)
    //         .arguments[0] as ObjectLiteralExpression,
    //       sf
    //     ),
    //     styles: value['styles'] as string[],
    //     styleUrls: value['styleUrls'] as string[],
    //   });
    // });

    return componentChangeMap;
  }
  private collectionInfo() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const traitCompiler: TraitCompiler = (this.ngCompiler as any).compilation
      .traitCompiler;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classes = (traitCompiler as any).classes as Map<
      ts.ClassDeclaration,
      ClassRecord
    >;
    for (const [classDeclaration, classRecord] of classes) {
      const componentTraits = classRecord.traits.filter(
        (trait) => trait.handler.name === 'ComponentDecoratorHandler'
      );
      if (componentTraits.length > 1) {
        throw new Error('组件装饰器异常');
      }
      componentTraits.forEach((trait) => {
        const meta: R3ComponentMetadata = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(trait as any).analysis?.meta,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(trait as any).resolution,
        };
        this.componentMap.set(
          ts.getOriginalNode(classDeclaration) as ts.ClassDeclaration,
          meta
        );
      });
      const directiveTraits = classRecord.traits.filter(
        (trait) => trait.handler.name === 'DirectiveDecoratorHandler'
      );
      if (directiveTraits.length > 1) {
        throw new Error('指令装饰器异常');
      }
      directiveTraits.forEach((trait) => {
        this.directiveMap.set(
          ts.getOriginalNode(classDeclaration) as ts.ClassDeclaration,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (trait as any).analysis
        );
      });
      const ngModuleTraits = classRecord.traits.filter(
        (trait) => trait.handler.name === 'NgModuleDecoratorHandler'
      );

      ngModuleTraits.forEach((trait) => {
        const meta: R3ComponentMetadata = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(trait as any).analysis?.meta,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(trait as any).resolution,
        };
        this.ngModuleMap.set(classDeclaration, meta);
      });
    }
  }
  async exportComponentBuildMetaMap() {
    const componentBuildMetaRecord = {
      outputContent: new Map<string, string>(),
      meta: new Map<string, string>(),
    };
    for (const [key, meta] of this.componentMap) {
      const fileName = key.getSourceFile().fileName;
      let directiveMatcher: SelectorMatcher | undefined;
      if (meta.directives.length > 0) {
        const matcher = new (await angularCompilerPromise).SelectorMatcher();
        for (const directive of meta.directives) {
          const selector = directive.selector;
          const directiveClassDeclaration = ts.getOriginalNode(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (directive as any).ref.node
          ) as ts.ClassDeclaration;
          const directiveMeta = this.directiveMap.get(
            directiveClassDeclaration
          );
          matcher.addSelectables(
            (await angularCompilerPromise).CssSelector.parse(selector),
            {
              directive,
              directiveMeta,
            }
          );
        }
        directiveMatcher = matcher;
      }
      const componentBuildMeta = this.buildComponentMeta(
        directiveMatcher,
        meta
      );
      const pagePattern = this.componentToEntryMap.get(fileName)!;
      componentBuildMetaRecord.outputContent.set(
        pagePattern.outputFiles.content,
        componentBuildMeta.content
      );
      if (componentBuildMeta.template) {
        componentBuildMetaRecord.outputContent.set(
          pagePattern.outputFiles.contentTemplate,
          componentBuildMeta.template
        );
      }
      componentBuildMetaRecord.meta.set(
        path.normalize(fileName),
        componentBuildMeta.meta
      );
    }

    return componentBuildMetaRecord;
  }

  private removeTemplateAndStyleInTs(
    objectNode: ObjectLiteralExpression,
    sf: SourceFile
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
    const content = RawUpdater.update(sf.text, list);
    return {
      sizeOffset: sf.text.length - content.length,
      content: content,
    };
  }

  private buildComponentMeta(
    directiveMatcher: SelectorMatcher | undefined,
    componentMeta: ComponentResolutionData
  ) {
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: TemplateCompiler },
        { provide: COMPONENT_META, useValue: componentMeta },
        { provide: DIRECTIVE_MATCHER, useValue: directiveMatcher },
        {
          provide: ComponentContext,
          useFactory: () => {
            return new ComponentContext(directiveMatcher);
          },
        },
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
    this.collectionInfo();

    this.componentMap.forEach((value, key) => {
      const fileName = key.getSourceFile().fileName;
      this.componentToEntryMap.set(
        fileName,
        this.getComponentPagePattern(fileName)
      );
    });
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
  augmentProgramWithVersioning(program: ts.Program): void {
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
