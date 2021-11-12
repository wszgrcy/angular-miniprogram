import { ASTWithSource, Interpolation } from '@angular/compiler';
import { BoundText } from '@angular/compiler/src/render3/r3_ast';
import {
  NgBoundTextMeta,
  NgElementMeta,
  NgNodeKind,
  NgNodeMeta,
  ParsedNode,
} from './interface';

export class ParsedNgBoundText implements ParsedNode<NgBoundTextMeta> {
  kind = NgNodeKind.BoundText;

  constructor(
    private node: BoundText,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    public nodeIndex: number
  ) {}
  analysis() {}
  getNodeMeta(): NgBoundTextMeta {
    this.analysis();
    return {
      kind: NgNodeKind.BoundText,
      nodeIndex: this.nodeIndex,
    };
  }
}
