import type { Text } from '../../angular-internal/ast.type';
import { NgNodeKind, NgNodeMeta, NgTextMeta, ParsedNode } from './interface';

export class ParsedNgText implements ParsedNode<NgTextMeta> {
  kind = NgNodeKind.Text;

  constructor(
    private node: Text,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    public index: number
  ) {}

  getNodeMeta(): NgTextMeta {
    return {
      kind: NgNodeKind.Text,
      value: this.node.value,
      index: this.index,
    };
  }
}
