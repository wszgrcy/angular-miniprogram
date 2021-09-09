import {
  DeclarationNode,
  Decorator,
  reflectObjectLiteral,
  TypeScriptReflectionHost,
} from '@angular/compiler-cli/src/ngtsc/reflection';
import {
  findAngularDecorator,
  forwardRefResolver,
  unwrapExpression,
} from '@angular/compiler-cli/src/ngtsc/annotations/src/util';
import ts, { Program, SourceFile, TypeChecker } from 'typescript';
import { nodeIteration } from './node-Iteration';
import { isAngularCorePackage } from '@angular/compiler-cli/src/ngtsc/core';
import {
  PartialEvaluator,
  ResolvedValue,
} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {
  ErrorCode,
  FatalDiagnosticError,
} from '@angular/compiler-cli/src/ngtsc/diagnostics';
import { Reference } from '@angular/compiler-cli/src/ngtsc/imports';
import { ClassDeclaration } from '@angular/compiler-cli/src/ngtsc/reflection/src/host';
import * as path from 'path';

export class DecoratorMetaDataResolver {
  private moduleMetaMap = new Map<
    ts.ClassDeclaration,
    Record<string, Reference<ClassDeclaration<DeclarationNode>>[]>
  >();
  private componentMetaMap = new Map<
    ts.ClassDeclaration,
    Record<string, ResolvedValue>
  >();

  private isCore: boolean;
  private reflector: TypeScriptReflectionHost;
  private evaluator: PartialEvaluator;
  constructor(private program: Program, private typeChecker: TypeChecker) {
    this.isCore = isAngularCorePackage(program);
    this.reflector = new TypeScriptReflectionHost(this.typeChecker);
    this.evaluator = new PartialEvaluator(
      this.reflector,
      this.typeChecker,
      null
    );
  }
  resolverSourceFile(sf: SourceFile) {
    let list: ts.ClassDeclaration[] = [];
    nodeIteration(sf, (node) => {
      if (ts.isClassDeclaration(node) && node.decorators) {
        list.push(node);
      }
    });
    list.forEach((item) => {
      if (this.reflector.isClass(item)) {
        let decoratorList = this.reflector.getDecoratorsOfDeclaration(item)!;
        this.findComponentDecorator(decoratorList, item);
        this.findModuleDecorator(decoratorList, item);
      }
    });
  }
  getComponentMetaMap() {
    return this.componentMetaMap;
  }
  private evaluate(node: ts.Expression) {
    return this.evaluator.evaluate(node);
  }
  private findComponentDecorator(
    decoratorList: Decorator[],
    classDeclaration: ts.ClassDeclaration
  ) {
    let decorator = findAngularDecorator(
      decoratorList,
      'Component',
      this.isCore
    );
    if (!decorator) return;
    const meta: ts.ObjectLiteralExpression = unwrapExpression(
      decorator.args![0]
    ) as any;
    if (!ts.isObjectLiteralExpression(meta)) {
      throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARG_NOT_LITERAL,
        meta,
        `Decorator argument must be literal.`
      );
    }
    const metaMap = reflectObjectLiteral(meta);
    this.componentMetaMap.set(classDeclaration, {
      selector:
        metaMap.has('selector') && this.evaluate(metaMap.get('selector')!),
      templateUrl:
        metaMap.has('templateUrl') &&
        path.resolve(
          path.dirname(classDeclaration.getSourceFile().fileName),
          this.evaluate(metaMap.get('templateUrl')!) as string
        ),
      template:
        metaMap.has('template') && this.evaluate(metaMap.get('template')!),
      styles: metaMap.has('styles') && this.evaluate(metaMap.get('styles')!),
      styleUrls:
        metaMap.has('styleUrls') &&
        (this.evaluate(metaMap.get('styleUrls')!) as string[]).map((item) =>
          path.resolve(
            path.dirname(classDeclaration.getSourceFile().fileName),
            item as string
          )
        ),
      interpolation:
        metaMap.has('interpolation') &&
        this.evaluate(metaMap.get('interpolation')!),
    });
  }
  private findModuleDecorator(
    decoratorList: Decorator[],
    item: ts.ClassDeclaration
  ) {
    let decorator = findAngularDecorator(
      decoratorList,
      'NgModule',
      this.isCore
    );
    if (!decorator) return;

    const meta: ts.ObjectLiteralExpression = unwrapExpression(
      decorator.args![0]
    ) as any;
    if (!ts.isObjectLiteralExpression(meta)) {
      throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARG_NOT_LITERAL,
        meta,
        `Decorator argument must be literal.`
      );
    }
    const metaMap = reflectObjectLiteral(meta);
    this.moduleMetaMap.set(item, {
      declarations: metaMap.has('declarations')
        ? this.getReferenceList(metaMap.get('declarations')!)
        : [],
    });
  }
  private getReferenceList(node: ts.Expression) {
    const declarationMeta = this.evaluator.evaluate(node, forwardRefResolver);
    let declarationRefs = this.resolveTypeList(
      node,
      declarationMeta,

      'declarations'
    );
    return declarationRefs;
  }
  /**
   * Compute a list of `Reference`s from a resolved metadata value.
   */
  private resolveTypeList(
    expr: ts.Node,
    resolvedList: ResolvedValue,
    arrayName: string
  ): Reference<ClassDeclaration>[] {
    const refList: Reference<ClassDeclaration>[] = [];
    if (!Array.isArray(resolvedList)) {
      throw '';
    }

    resolvedList.forEach((entry, idx) => {
      if (entry instanceof Map && entry.has('ngModule')) {
        entry = entry.get('ngModule')!;
      }

      if (Array.isArray(entry)) {
        // Recurse into nested arrays.
        refList.push(...this.resolveTypeList(expr, entry, arrayName));
      } else if (entry instanceof Reference) {
        if (!this.reflector.isClass(entry.node)) {
          throw '';
        }

        refList.push(entry as Reference<ClassDeclaration>);
      } else {
        // TODO(alxhub): Produce a better diagnostic here - the array index may be an inner array.
        throw '';
      }
    });

    return refList;
  }
  getModuleMetaMap() {
    return this.moduleMetaMap;
  }
}
