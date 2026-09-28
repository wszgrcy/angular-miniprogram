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
import path from 'path';
import { Injectable, Injector } from 'static-injector';
import ts, { ClassDeclaration } from 'typescript';
import { recordLibraryMetaMiss } from '../library/library-meta-diagnostics';
import { lookupLibraryMeta } from '../library/library-meta-reader';
import {
  LibraryComponentMetaRecord,
  safeStringList,
} from '../library/library-meta-schema';
import { BuildPlatform } from '../platform/platform';
import { COMPONENT_META } from '../token/component.token';
import { angularCompilerPromise } from '../util';
import { ComponentCompilerService } from './component-compiler.service';
import { recordGeneratedWxml } from './manifest-registry';
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
  reverseKey: 'reverseMap',
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
    private buildPlatform: BuildPlatform,
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
        (trait) => trait.handler.name === 'ComponentDecoratorHandler',
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
            classDeclaration.name?.getText() ?? '',
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((trait as any)?.analysis?.styleUrls || []).map(
            (item: { url: string }) => this.resolveStyleUrl(fileName, item.url),
          ),
        );
        this.componentMap.set(
          ts.getOriginalNode(classDeclaration) as ts.ClassDeclaration,
          meta,
        );
      });
      const directiveTraits = classRecord.traits.filter(
        (trait) => trait.handler.name === 'DirectiveDecoratorHandler',
      );
      if (directiveTraits.length > 1) {
        throw new Error('指令装饰器异常');
      }
      directiveTraits.forEach((trait) => {
        this.directiveMap.set(
          ts.getOriginalNode(classDeclaration) as ts.ClassDeclaration,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (trait as any).analysis?.meta,
        );
      });
    }
  }

  async exportComponentBuildMetaMap() {
    const { SelectorMatcher, CssSelector } = await angularCompilerPromise;
    for (const [classDeclaration, meta] of this.componentMap) {
      const fileName = path.normalize(
        classDeclaration.getSourceFile().fileName,
      );
      let directiveMatcher: SelectorMatcher | undefined;
      const declarations = this.resolveTemplateDeclarations(
        classDeclaration,
        meta,
      );
      if (declarations.length > 0) {
        const matcher = new SelectorMatcher();
        for (const directive of declarations) {
          const selector = directive.selector;
          const directiveClassDeclaration = ts.getOriginalNode(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (directive as any).ref.node,
          ) as ts.ClassDeclaration;
          const directiveMeta = this.directiveMap.get(
            directiveClassDeclaration,
          );
          const componentMeta = this.componentMap.get(
            directiveClassDeclaration,
          );
          let libraryMeta: MetaFromLibrary | undefined;
          if (directive.isComponent) {
            libraryMeta = this.getLibraryComponentMeta(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (directive as any).ref.node,
            );
          }
          if (!directive.isComponent && !directiveMeta) {
            libraryMeta = this.getLibraryDirectiveMeta(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (directive as any).ref.node,
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
        meta,
      );
      const componentKey = makeComponentKey(
        fileName,
        classDeclaration.name?.getText() ?? '',
      );
      this.resolvedDataGroup.outputContent.set(
        componentKey,
        componentBuildMeta.content,
      );

      // 同源记录：此刻组件身份（componentKey）与生成的 wxml 同时已知，
      // 配对关系是权威的。供「节点下标两端等价性」测试按组件精确比对，
      // 避免事后从制品反推配对（会被 code-splitting 打败）。
      recordGeneratedWxml(
        componentKey,
        classDeclaration.name?.getText() ?? '',
        fileName,
        componentBuildMeta.content,
      );

      this.resolvedDataGroup.useComponentPath.set(
        componentKey,
        componentBuildMeta.useComponentPath,
      );
      for (const key in componentBuildMeta.otherMetaGroup) {
        if (
          Object.prototype.hasOwnProperty.call(
            componentBuildMeta.otherMetaGroup,
            key,
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
    meta: R3ComponentMetadata<any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any[] {
    const rawDeclarations = meta.declarations as unknown;
    if (!Array.isArray(rawDeclarations)) {
      // `meta.declarations` 缺失 = 这个组件的 Angular 分析根本没跑成
      // （典型诱因：上游还有编译错误，比如 standalone 指令被 NgModule
      // declarations；或者组件 meta 因错被降级）。
      // 以前这里直接 `declarations.some(...)`，抛出来的是
      // “Cannot read properties of undefined (reading 'some')”，
      // 看不出是哪个组件、为什么，排查成本极高。改成带身份的报错。
      throw new Error(
        `[mini-program-compiler] 组件 ${
          classDeclaration.name?.getText() ?? '?'
        }（${path.normalize(
          classDeclaration.getSourceFile().fileName,
        )}）的 meta.declarations 缺失，Angular 组件分析未完成。` +
          `这通常是上游编译错误的连带结果，先把真正的报错修掉再来。`,
      );
    }
    const declarations = rawDeclarations as unknown[] as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    const importsNgModule = declarations.some(
      (item) => item.kind === R3_TEMPLATE_DEPENDENCY_KIND_NG_MODULE,
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
          'reverseMap',
        ),
        outputs: toBindingNameList(
          (dep as { outputs?: unknown }).outputs,
          'reverseMap',
        ),
      };
    });
  }

  private buildComponentMeta(
    directiveMatcher: SelectorMatcher | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    componentMeta: R3ComponentMetadata<any>,
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
    classDeclaration: ts.ClassDeclaration,
  ): DirectiveMetaFromLibrary | undefined {
    const className = classDeclaration.name?.getText();
    if (!className) {
      return undefined;
    }
    const sourceFile = classDeclaration.getSourceFile();

    /**
     * 唯一来源：库构建产出的 sidecar（`<库根>/mp-library-meta.json`）。
     *
     * 不做任何版本兼容 —— 旧版把 `declare const X_Listeners` 内联在 d.ts
     * 里的格式已废弃，不再读。
     */
    const lookup = lookupLibraryMeta(sourceFile.fileName, className);
    if (lookup.record) {
      return {
        isComponent: false,
        listeners: safeStringList(lookup.record.listeners),
        properties: safeStringList(lookup.record.properties),
      };
    }

    // 查不到：**不再静默返回空数组而不留痕迹**。
    // 旧行为在这里直接 `{listeners: []}` 覆盖掉 host.listeners，
    // wxml 一个事件绑定都没有且零报错。现在登记下来，
    // 由构建器在每轮结束时打汇总日志。
    recordLibraryMetaMiss({
      className,
      sourceFile: sourceFile.fileName,
      reason: lookup.entry ? 'sidecar-missing-class' : 'no-sidecar',
    });
    return {
      isComponent: false,
      listeners: [],
      properties: [],
    };
  }
  private getLibraryComponentMeta(
    classDeclaration: ts.ClassDeclaration,
  ): ComponentMetaFromLibrary | undefined {
    const className = classDeclaration.name?.getText();
    if (!className) {
      return undefined;
    }
    const lookup = lookupLibraryMeta(
      classDeclaration.getSourceFile().fileName,
      className,
    );
    if (lookup.kind !== 'component' || !lookup.record) {
      return undefined;
    }
    const record = lookup.record as LibraryComponentMetaRecord;
    return {
      exportPath: record.outputPath,
      listeners: safeStringList(record.listeners),
      properties: safeStringList(record.properties),
      isComponent: true,
    };
  }
}
