import type { R3ComponentMetadata } from '@angular/compiler';
import type { NgtscProgram } from '@angular/compiler-cli';
import type { ComponentResolutionData } from '@angular/compiler-cli/src/ngtsc/annotations/src/component';
import type { NgCompiler } from '@angular/compiler-cli/src/ngtsc/core';
import type {
  ClassRecord,
  TraitCompiler,
} from '@angular/compiler-cli/src/ngtsc/transform';
import path from 'path';
import { Injectable, Injector } from 'static-injector';
import ts, { ClassDeclaration } from 'typescript';
import { SelectorMatcher } from '../angular-internal/selector';
import { COMPONENT_META, DIRECTIVE_MATCHER } from '../token/component.token';
import { angularCompilerPromise } from '../util/load_esm';
import { ComponentContext } from './node-handle/global-context';
import { ComponentCompiler } from './template-compiler';

@Injectable()
export class MiniProgramPlatformCompilerService {
  private ngCompiler!: NgCompiler;
  private componentMap = new Map<ClassDeclaration, R3ComponentMetadata>();
  private directiveMap = new Map<ClassDeclaration, any>();
  private ngModuleMap = new Map<ClassDeclaration, any>();
  private componentDataMap = {
    style: new Map<string, string[]>(),
    outputContent: new Map<string, string>(),
    outputContentTemplate: new Map<string, string>(),
    meta: new Map<string, string>(),
  };
  constructor(private ngTscProgram: NgtscProgram, private injector: Injector) {}
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
          fileName,
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
      this.componentDataMap.outputContent.set(
        fileName,
        componentBuildMeta.content
      );

      if (componentBuildMeta.template) {
        this.componentDataMap.outputContentTemplate.set(
          fileName,
          componentBuildMeta.template
        );
      }
      this.componentDataMap.meta.set(
        path.normalize(fileName),
        componentBuildMeta.meta
      );
    }

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
}
