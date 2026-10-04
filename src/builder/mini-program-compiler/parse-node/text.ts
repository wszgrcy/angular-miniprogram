import type { Text } from '../../angular-internal/ast.type';
import { NgNodeKind, NgNodeMeta, NgTextMeta, ParsedNode } from './interface';

export class ParsedNgText implements ParsedNode<NgTextMeta> {
  kind = NgNodeKind.Text;

  constructor(
    private node: Text,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    public index: number,
    /** 宿主元素带 `i18n`，见 `NgTextMeta.i18n` */
    private i18n = false,
  ) {}

  getNodeMeta(): NgTextMeta {
    return {
      kind: NgNodeKind.Text,
      value: this.node.value,
      index: this.index,
      i18n: this.i18n,
    };
  }
}
