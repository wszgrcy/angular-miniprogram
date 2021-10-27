import { AST } from '@angular/compiler';
import { Injectable } from 'static-injector';
import { ExpressionConvert } from './expression-to-string';
import { BindValue, PlainValue } from './node-handle/value';
import { isLiteralPrimitive } from './type-protection';

export class TemplateInterpolationService {
  constructor() {}
  expressionConvertToString(ast: AST) {
    if (isLiteralPrimitive(ast)) {
      return new PlainValue(ast.value);
    }
    const instance = new ExpressionConvert();
    return new BindValue((contextPrefix) => {
      instance.contextPrefix = contextPrefix;
      return instance.toString(ast);
    });
  }
}
