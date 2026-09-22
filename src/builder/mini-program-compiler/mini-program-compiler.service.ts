import type {
  R3ComponentMetadata,
  R3DirectiveMetadata,
  SelectorMatcher,
} from '@angular/compiler';
import type { NgtscProgram } from '@angular/compiler-cli';
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
  LIBRARY_COMPONENT_OUTPUT_PATH_SUFFIX,
  LIBRARY_DIRECTIVE_LISTENERS_SUFFIX,
  LIBRARY_DIRECTIVE_PROPERTIES_SUFFIX,
} from '../library';
import { BuildPlatform } from '../platform/platform';
import { COMPONENT_META } from '../token/component.token';
import { angularCompilerPromise, literalResolve } from '../util';
import { ComponentCompilerService } from './component-compiler.service';
import { MetaCollection } from './meta-collection';
import { ComponentContext } from './parse-node';
import {
  ComponentMetaFromLibrary,
  DirectiveMetaFromLibrary,
  MetaFromLibrary,
  ResolvedDataGroup,
  UseComponent,
  makeComponentKey,
} from './type';

/** `R3TemplateDependencyKind.NgModule`，compiler 没有把这个枚举导出到运行时 */
const R3_TEMPLATE_DEPENDENCY_KIND_NG_MODULE = 2;

/**
 * ngtsc 的 `ClassPropertyMapping` 转成 R3 的绑定名数组。
 *
 * R3 的 `inputs` / `outputs` 是模板上能看到的绑定名（`string[]`），而 ngtsc 的
 * `DirectiveMeta` 用的是 `ClassPropertyMapping`，绑定名存在 `reverseMap` 的 key 里。
 */
function toBindingNameList(
  mapping: unknown,
  reverseKey: 'reverseMap'
): string[] {
  if (mapping == null) {
    return [];
  }
  if (Array.isArray(mapping)) {
    return mapping as string[];
  }
  const reverseMap = (
    mapping as unknown as {
      [reverseKey]?: Map<string, unknown>;
    }
  )[reverseKey];
  if (reverseMap instanceof Map) {
    return [...reverseMap.keys()];
  }
  return Object.keys(mapping as Record<string, unknown>);
}

@Injectable()
export class MiniProgramCompilerService {
  private ngCompiler!: NgCompiler;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private componentMap = new Map<ClassDeclaration, R3ComponentMetadata<any>>();
  private directiveMap = new Map<ClassDeclaration, R3DirectiveMetadata>();
  private resolvedDataGroup: ResolvedDataGroup = {
    style: new Map<string, string[]>(),
    outputContent: new Map<string, string>(),
    useComponentPath: new Map<
      string,
      {
        localPath: UseComponent[];
        libraryPath: UseComponent[];
      }
    >(),
    otherMetaCollectionGroup: {},
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const meta: R3ComponentMetadata<any> = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(trait as any).analysis?.meta,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(trait as any).resolution,
        };
        this.resolvedDataGroup.style.set(
          makeComponentKey(
            path.normalize(fileName),
            classDeclaration.name?.getText() ?? ''
          ),
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
          (trait as any).analysis?.meta
        );
      });
    }
  }

  async exportComponentBuildMetaMap() {
    const { SelectorMatcher, CssSelector } = await angularCompilerPromise;
    for (const [classDeclaration, meta] of this.componentMap) {
      const fileName = path.normalize(
        classDeclaration.getSourceFile().fileName
      );
      let directiveMatcher: SelectorMatcher | undefined;
      const declarations = this.resolveTemplateDeclarations(
        classDeclaration,
        meta
      );
      if (declarations.length > 0) {
        const matcher = new SelectorMatcher();
        for (const directive of declarations) {
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
          matcher.addSelectables(CssSelector.parse(selector), {
            directive,
            directiveMeta,
            componentMeta,
            libraryMeta,
          });
        }
        directiveMatcher = matcher;
      }
      const componentBuildMeta = this.buildComponentMeta(
        directiveMatcher,
        meta
      );
      const componentKey = makeComponentKey(
        fileName,
        classDeclaration.name?.getText() ?? ''
      );
      this.resolvedDataGroup.outputContent.set(
        componentKey,
        componentBuildMeta.content
      );

      this.resolvedDataGroup.useComponentPath.set(
        componentKey,
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
          this.resolvedDataGroup.otherMetaCollectionGroup[key] =
            this.resolvedDataGroup.otherMetaCollectionGroup[key] ||
            new MetaCollection();
          this.resolvedDataGroup.otherMetaCollectionGroup[key].merge(element);
        }
      }
    }

    this.resolvedDataGroup.useComponentPath.forEach((value, key) => {
      value.libraryPath = Array.from(new Set(value.libraryPath));
      value.localPath = Array.from(new Set(value.localPath));
    });

    return this.resolvedDataGroup;
  }

  /**
   * 取得组件模板可用的指令/管道列表。
   *
   * standalone 组件的 `imports` 允许直接引入 NgModule，此时 `meta.declarations` 里会出现
   * `R3TemplateDependencyKind.NgModule`（值为 2）的项。它只带一个指向模块标识符的
   * `type.node`，没有普通依赖上的 `ref.node`，直接拿去查元数据会炸。
   *
   * 这里改用 Angular 自己的 `TypeCheckScope` 拿扁平化之后的作用域（模块会被展开成它
   * 导出的指令与管道），非 standalone 组件保持原样。
   */
  private resolveTemplateDeclarations(
    classDeclaration: ts.ClassDeclaration,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta: R3ComponentMetadata<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any[] {
    const declarations = meta.declarations as unknown[] as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    const importsNgModule = declarations.some(
      (item) => item.kind === R3_TEMPLATE_DEPENDENCY_KIND_NG_MODULE
    );
    if (!importsNgModule) {
      return declarations;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scopeRegistry = (this.ngCompiler as any).compilation
      .typeCheckScopeRegistry;
    const scope = scopeRegistry.getTypeCheckScope({
      node: classDeclaration,
    } as never);
    // TypeCheckScope 里是 ngtsc 的 DirectiveMeta / PipeMeta，而下游
    // `ComponentContext` 读的是 R3 的 `R3DirectiveDependencyMetadata`，
    // 两边字段名不一致（主要是 `importedFile`），这里对齐成 R3 的形状。
    return [...scope.directives, ...scope.pipes.values()].map((dep) => {
      const node = dep.ref.node as ts.ClassDeclaration;
      return {
        ...dep,
        isComponent: (dep as { isComponent?: boolean }).isComponent ?? false,
        importedFile: node.getSourceFile(),
        inputs: toBindingNameList(
          (dep as { inputs?: unknown }).inputs,
          'reverseMap'
        ),
        outputs: toBindingNameList(
          (dep as { outputs?: unknown }).outputs,
          'reverseMap'
        ),
      };
    });
  }

  private buildComponentMeta(
    directiveMatcher: SelectorMatcher | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    componentMeta: R3ComponentMetadata<any>
  ) {
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: ComponentCompilerService },
        { provide: COMPONENT_META, useValue: componentMeta },
        {
          provide: ComponentContext,
          useFactory: () => {
            return new ComponentContext(directiveMatcher);
          },
        },
      ],
    });
    const instance = injector.get(ComponentCompilerService);
    return instance.compile();
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
    if (listenersNode) {
      listeners = literalResolve(listenersNode.type!.getText());
    }
    const propertiesNode = selector.queryOne(
      `VariableDeclaration[name=${directiveName}_${LIBRARY_DIRECTIVE_PROPERTIES_SUFFIX}]`
    ) as ts.VariableDeclaration;
    if (propertiesNode) {
      properties = literalResolve(propertiesNode.type!.getText());
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
      `VariableDeclaration[name=${directiveName}_${LIBRARY_COMPONENT_OUTPUT_PATH_SUFFIX}]`
    ) as ts.VariableDeclaration;
    if (!exportPathNode) {
      return undefined;
    }
    const exportPath = exportPathNode.type!.getText();
    return {
      exportPath: literalResolve(exportPath),
      ...this.getLibraryDirectiveMeta(classDeclaration)!,
      isComponent: true,
    };
  }
}
