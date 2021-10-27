import { AST } from '@angular/compiler';
import { Injectable } from 'static-injector';
import { ExpressionConvert } from './expression-to-string';
import { BindValue, PlainValue } from './node-handle/value';
import { isLiteralPrimitive } from './type-protection';

export class TemplateInterpolationService {
  private index: number;
  private interpolationMapping = new Map<string, number>();
  private currentContext: string[] = [];
  constructor(private parent?: TemplateInterpolationService) {}
  expressionConvertToString(ast: AST) {
    if (isLiteralPrimitive(ast)) {
      return new PlainValue(ast.value);
    }
    const instance = new ExpressionConvert();
    // const result = instance.toString(ast);
    // if (!this.interpolationMapping.has(result)) {
    //   const index = this.index++;
    //   this.interpolationMapping.set(result, index);
    // }
    return new BindValue((contextPrefix) => {
      instance.contextPrefix = contextPrefix;
      return instance.toString(ast);
    });
  }
  addCurrentContext(str) {
    this.currentContext.push(str);
  }
  getParentContext() {
    return [
      ...this.currentContext,
      ...(this.parent ? this.parent.getParentContext() : []),
    ];
  }
}
