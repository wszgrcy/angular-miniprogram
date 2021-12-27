import type { BoundText } from '@angular/compiler/src/render3/r3_ast';
import {
  NgBoundTextMeta,
  NgNodeKind,
  NgNodeMeta,
  ParsedNode,
} from './interface';

export class ParsedNgBoundText implements ParsedNode<NgBoundTextMeta> {
  kind = NgNodeKind.BoundText;

  constructor(
    private node: BoundText,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    public index: number
  ) {}
  getNodeMeta(): NgBoundTextMeta {
    return {
      kind: NgNodeKind.BoundText,
      index: this.index,
    };
  }
}
