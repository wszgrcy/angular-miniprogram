import { AST } from '@angular/compiler';
import { Injectable } from 'static-injector';
import { BuildPlatform } from '../platform/platform';
import { ExpressionConvert } from './expression-to-string';
import { BindValue, PlainValue } from './node-handle/value';
import { isLiteralPrimitive } from './type-protection';

@Injectable()
export class TemplateInterpolationService {
  pipes = new Set<string>();

  constructor(private buildPlatform: BuildPlatform) {}
  expressionConvertToString(ast: AST) {
    if (isLiteralPrimitive(ast)) {
      return new PlainValue(ast.value);
    }
    const instance = new ExpressionConvert();

    return new BindValue((contextPrefix) => {
      instance.contextPrefix = contextPrefix;
      instance.globalVariablePrefix = this.buildPlatform.globalVariablePrefix;
      const result = instance.toString(ast);

      instance.getPipeList().forEach((item) => {
        this.pipes.add(item);
      });
      return result;
    });
  }
}
