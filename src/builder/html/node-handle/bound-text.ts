import { ASTWithSource, Interpolation } from '@angular/compiler';
import { BoundText } from '@angular/compiler/src/render3/r3_ast';
import { TemplateInterpolationService } from '../template-interpolation.service';
import {
  NgBoundTextMeta,
  NgElementMeta,
  NgNodeKind,
  NgNodeMeta,
  ParsedNode,
} from './interface';
import { BindValue, PlainValue } from './value';

export class ParsedNgBoundText implements ParsedNode<NgBoundTextMeta> {
  valueList: NgBoundTextMeta['values'] = [];
  kind = NgNodeKind.BoundText;

  constructor(
    private node: BoundText,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    public templateInterpolationService: TemplateInterpolationService,
    public nodeIndex: number
  ) {}
  analysis() {
    const ast = (this.node.value as ASTWithSource).ast as Interpolation;
    ast.strings.forEach((item, i) => {
      if (item !== '') {
        this.valueList.push(new PlainValue(item));
      }
      if (ast.expressions[i]) {
        const result =
          this.templateInterpolationService.expressionConvertToString(
            ast.expressions[i]
          );
        this.valueList.push(result);
      }
    });
  }
  getNodeMeta(): NgBoundTextMeta {
    this.analysis();
    return {
      kind: NgNodeKind.BoundText,
      values: this.valueList,
      nodeIndex: this.nodeIndex,
    };
  }
}
