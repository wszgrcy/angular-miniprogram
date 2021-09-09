import {
  Binary,
  Conditional,
  KeyedRead,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  PrefixNot,
  PropertyRead,
} from '@angular/compiler';
import { AST } from '@angular/compiler/src/expression_parser/ast';
import {
  isBinary,
  isConditional,
  isKeyedRead,
  isLiteralArray,
  isLiteralMap,
  isLiteralPrimitive,
  isPrefixNot,
  isPropertyRead,
} from './type-protection';
export interface ExpressionIterationOptions {
  Binary: (ast: Binary) => any;
  PropertyRead: (ast: PropertyRead) => any;
  LiteralPrimitive: (ast: LiteralPrimitive) => any;
  PrefixNot: (ast: PrefixNot) => any;
  LiteralArray: (ast: LiteralArray) => any;
  LiteralMap: (ast: LiteralMap) => any;
  Conditional: (ast: Conditional) => any;
  KeyedRead: (ast: KeyedRead) => any;
  default: (ast: any) => any;
  empty: (ast: any) => any;
}
/** 管道,函数待处理,其他一些Unary,NonNullAssert ,MethodCall,SafeMethodCall,FunctionCall,KeyedWrite*/
export function expressionIteration(
  ast: AST,
  options: ExpressionIterationOptions
) {
  if (!ast) {
    return options.empty(ast);
  }
  if (isBinary(ast)) {
    return options.Binary(ast);
  } else if (isPropertyRead(ast)) {
    return options.PropertyRead(ast);
  } else if (isLiteralPrimitive(ast)) {
    return options.LiteralPrimitive(ast);
  } else if (isPrefixNot(ast)) {
    return options.PrefixNot(ast);
  } else if (isLiteralArray(ast)) {
    return options.LiteralArray(ast);
  } else if (isLiteralMap(ast)) {
    return options.LiteralMap(ast);
  } else if (isConditional(ast)) {
    return options.Conditional(ast);
  } else if (isKeyedRead(ast)) {
    return options.KeyedRead(ast);
  }
  return options.default(ast);
}
