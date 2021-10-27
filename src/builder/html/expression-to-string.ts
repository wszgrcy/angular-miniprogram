import { AST } from '@angular/compiler/src/expression_parser/ast';
import { expressionIteration } from './expression-iteration';

export class ExpressionConvert {
  private propertyReadList: string[] = [];
  private pipeList: string[] = [];
  contextPrefix: string;
  toString(expression: AST): string {
    return expressionIteration(expression, {
      empty: () => '',
      Binary: (ast) =>
        this.toString(ast.left) + ast.operation + this.toString(ast.right),
      PropertyRead: (ast) => {
        const receiver = this.toString(ast.receiver);
        if (!receiver) {
          this.propertyReadList.push(ast.name);
          return this.contextPrefix + ast.name;
        }
        return (receiver ? receiver + '.' : '') + ast.name;
      },
      LiteralPrimitive: (ast) => {
        if (typeof ast.value === 'string') {
          return `'${ast.value}'`;
        }
        return `${ast.value}`;
      },
      PrefixNot: (ast) => {
        return '!' + this.toString(ast.expression);
      },
      LiteralArray: (ast) => {
        return `[${ast.expressions
          .map((item) => this.toString(item))
          .join(',')}]`;
      },
      LiteralMap: (ast) => {
        let result = '{';
        for (let i = 0; i < ast.keys.length; i++) {
          const key = ast.keys[i];
          const value = ast.values[i];
          result += key.quoted ? `'${key.key}'` : key.key;
          result += ':';
          result += this.toString(value);
        }
        result += '}';
        return result;
      },

      Conditional: (ast) => {
        return `${this.toString(ast.condition)}?${this.toString(
          ast.trueExp
        )}:${this.toString(ast.falseExp)}`;
      },
      KeyedRead: (ast) => {
        return `${this.toString(ast.obj)}[${this.toString(ast.key)}]`;
      },
      BindingPipe: (ast) => {
        this.pipeList.push(ast.name);
        return `getPipe(${ast.name},${this.toString(ast.exp)},${ast.args
          .map((arg: AST) => this.toString(arg))
          .join(',')})`;
      },
      default: (ast) => {
        return '';
      },
    });
  }
}
