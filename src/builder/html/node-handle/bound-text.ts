import { ASTWithSource, Interpolation } from '@angular/compiler';
import { BoundText } from '@angular/compiler/src/render3/r3_ast';
import { ExpressionConvert } from '../expression-to-string';
import {
  ParsedNode,
  NgElementMeta,
  NgBoundTextMeta,
  NgNodeKind,
  NgNodeMeta,
} from './interface';
import { BindValue, PlainValue } from './value';

export class ParsedNgBoundText implements ParsedNode<NgBoundTextMeta> {
  valueList: NgBoundTextMeta['values'] = [];
  kind = NgNodeKind.BoundText;
  bindValueList: string[] = [];
  constructor(
    private node: BoundText,
    public parent: ParsedNode<NgNodeMeta> | undefined
  ) {}
  analysis() {
    let ast = (this.node.value as ASTWithSource).ast as Interpolation;
    ast.strings.forEach((item, i) => {
      this.valueList.push(new PlainValue(item));
      let expressionConvert = new ExpressionConvert();
      let result = expressionConvert.toString(ast.expressions[i]);
      if (result) {
        this.bindValueList.push(...expressionConvert.propertyReadList);
        this.valueList.push(new BindValue(result));
      }
    });
  }
  getNodeMeta(): NgBoundTextMeta {
    this.analysis();
    return {
      kind: NgNodeKind.BoundText,
      values: this.valueList,
      data: this.getBindValueList(),
    };
  }
  getBindValueList() {
    let parentList = this.getParentBindValueList();
    return this.bindValueList.filter((item) => !parentList.includes(item));
  }
  getParentBindValueList() {
    if (this.parent) {
      return [
        ...this.parent.bindValueList,
        ...(this.parent.autoGenerateValueList || []),
        ...this.parent.getParentBindValueList(),
      ];
    }
    return [];
  }
}
