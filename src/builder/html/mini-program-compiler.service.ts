import type { R3ComponentMetadata, SelectorMatcher } from '@angular/compiler';
import type { NgtscProgram } from '@angular/compiler-cli';
import type { ComponentResolutionData } from '@angular/compiler-cli/src/ngtsc/annotations/src/component';
import type { NgCompiler } from '@angular/compiler-cli/src/ngtsc/core';
import type {
  ClassRecord,
  TraitCompiler,
} from '@angular/compiler-cli/src/ngtsc/transform';
import { createCssSelectorForTs } from 'cyia-code-util';
import path from 'path';
import { Injectable, Injector } from 'static-injector';
import ts, { ClassDeclaration } from 'typescript';
import {
  LIBRARY_COMPONENT_EXPORT_PATH_SUFFIX,
  LIBRARY_DIRECTIVE_LISTENERS_SUFFIX,
  LIBRARY_DIRECTIVE_PROPERTIES_SUFFIX,
} from '../const';
import { BuildPlatform } from '../platform/platform';
import { COMPONENT_META, DIRECTIVE_MATCHER } from '../token/component.token';
import { angularCompilerPromise } from '../util/load_esm';
import { MetaCollection } from './meta-collection';
import { ComponentContext } from './node-handle/component-context';
import { ComponentCompiler } from './template-compiler';
import {
  ComponentMetaFromLibrary,
  DirectiveMetaFromLibrary,
  MetaFromLibrary,
  UseComponent,
} from './type';

@Injectable()
export class MiniProgramCompilerService {
  private ngCompiler!: NgCompiler;
  private componentMap = new Map<ClassDeclaration, R3ComponentMetadata>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private directiveMap = new Map<ClassDeclaration, any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ngModuleMap = new Map<ClassDeclaration, any>();
  private componentDataMap = {
    style: new Map<string, string[]>(),
    outputContent: new Map<string, string>(),
    outputContentTemplate: new Map<string, string>(),
    useComponentPath: new Map<
      string,
      {
        localPath: UseComponent[];
        libraryPath: UseComponent[];
      }
    >(),
    otherMetaCollectionGroup: {} as Record<string, MetaCollection>,
  };
  constructor(
    private ngTscProgram: NgtscProgram,
    private injector: Injector,
    private buildPlatform: BuildPlatform
  ) {}
  init() {
    this.ngCompiler = this.ngTscProgram.compiler;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const traitCompiler: TraitCompiler = (this.ngCompiler as any).compilation
      .traitCompiler;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classes = (traitCompiler as any).classes as Map<
      ts.ClassDeclaration,
      ClassRecord
    >;
    for (const [classDeclaration, classRecord] of classes) {
      const fileName = classDeclaration.getSourceFile().fileName;
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
        this.componentDataMap.style.set(
          path.normalize(fileName),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((trait as any)?.analysis?.styleUrls || []).map(
            (item: { url: string }) => this.resolveStyleUrl(fileName, item.url)
          )
        );
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
    for (const [key, meta] of this.componentMap) {
      const fileName = path.normalize(key.getSourceFile().fileName);
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
          const componentMeta = this.componentMap.get(
            directiveClassDeclaration
          );
          let libraryMeta: MetaFromLibrary | undefined;
          if (directive.isComponent) {
            libraryMeta = this.getLibraryComponentMeta(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (directive as any).ref.node
            );
          }
          if (!directive.isComponent && !directiveMeta) {
            libraryMeta = this.getLibraryDirectiveMeta(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (directive as any).ref.node
            );
          }
          matcher.addSelectables(
            (await angularCompilerPromise).CssSelector.parse(selector),
            {
              directive,
              directiveMeta,
              componentMeta,
              libraryMeta,
            }
          );
        }
        directiveMatcher = matcher;
      }
      const componentBuildMeta = this.buildComponentMeta(
        directiveMatcher,
        meta
      );
      this.componentDataMap.outputContent.set(
        path.normalize(fileName),
        componentBuildMeta.content
      );

      if (componentBuildMeta.template) {
        this.componentDataMap.outputContentTemplate.set(
          path.normalize(fileName),
          componentBuildMeta.template
        );
      }
      this.componentDataMap.useComponentPath.set(
        path.normalize(fileName),
        componentBuildMeta.useComponentPath
      );
      for (const key in componentBuildMeta.otherMetaGroup) {
        if (
          Object.prototype.hasOwnProperty.call(
            componentBuildMeta.otherMetaGroup,
            key
          )
        ) {
          const element = componentBuildMeta.otherMetaGroup[key];
          this.componentDataMap.otherMetaCollectionGroup[key] =
            this.componentDataMap.otherMetaCollectionGroup[key] ||
            new MetaCollection();
          this.componentDataMap.otherMetaCollectionGroup[key].merge(element);
        }
      }
    }

    this.componentDataMap.useComponentPath.forEach((value, key) => {
      value.libraryPath = Array.from(new Set(value.libraryPath));
      value.localPath = Array.from(new Set(value.localPath));
    });

    return this.componentDataMap;
  }

  private buildComponentMeta(
    directiveMatcher: SelectorMatcher | undefined,
    componentMeta: ComponentResolutionData
  ) {
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: ComponentCompiler },
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
    const instance = injector.get(ComponentCompiler);
    return instance.transform();
  }
  private resolveStyleUrl(componentPath: string, styleUrl: string) {
    return path.normalize(path.resolve(path.dirname(componentPath), styleUrl));
  }
  getDirectiveMap() {
    return this.directiveMap;
  }
  getComponentMap() {
    return this.componentMap;
  }
  private getLibraryDirectiveMeta(
    classDeclaration: ts.ClassDeclaration
  ): DirectiveMetaFromLibrary | undefined {
    let listeners: string[] = [];
    let properties: string[] = [];
    const directiveName = classDeclaration.name!.getText();
    const selector = createCssSelectorForTs(classDeclaration.getSourceFile());
    const listenersNode = selector.queryOne(
      `VariableDeclaration[name=${directiveName}_${LIBRARY_DIRECTIVE_LISTENERS_SUFFIX}]`
    ) as ts.VariableDeclaration;

    const propertiesNode = selector.queryOne(
      `VariableDeclaration[name=${directiveName}_${LIBRARY_DIRECTIVE_PROPERTIES_SUFFIX}]`
    ) as ts.VariableDeclaration;
    if (listenersNode) {
      listeners = JSON.parse(listenersNode.type!.getText());
    }
    if (propertiesNode) {
      properties = JSON.parse(propertiesNode.type!.getText());
    }
    return {
      isComponent: false,
      listeners: listeners,
      properties: properties,
    };
  }
  private getLibraryComponentMeta(
    classDeclaration: ts.ClassDeclaration
  ): ComponentMetaFromLibrary | undefined {
    const directiveName = classDeclaration.name!.getText();
    const selector = createCssSelectorForTs(classDeclaration.getSourceFile());
    const exportPathNode = selector.queryOne(
      `VariableDeclaration[name=${directiveName}_${LIBRARY_COMPONENT_EXPORT_PATH_SUFFIX}]`
    ) as ts.VariableDeclaration;
    if (!exportPathNode) {
      return undefined;
    }
    const exportPath = exportPathNode.type!.getText();
    return {
      exportPath: JSON.parse(exportPath),
      ...this.getLibraryDirectiveMeta(classDeclaration)!,
      isComponent: true,
    };
  }
}
