import { Content } from '@angular/compiler/src/render3/r3_ast';
import { NgContentMeta, NgNodeKind, NgNodeMeta, ParsedNode } from './interface';

export class ParsedNgContent implements ParsedNode<NgContentMeta> {
  kind = NgNodeKind.Content;
  bindValueList = [];
  constructor(
    private node: Content,
    public parent: ParsedNode<NgNodeMeta> | undefined
  ) {}
  getNodeMeta(): NgContentMeta {
    const nameAttr = this.node.attributes.find((item) => item.name === 'name');

    return {
      kind: NgNodeKind.Content,
      name: nameAttr ? nameAttr.value : undefined,
    };
  }
  getBindValueList() {
    return [];
  }
  getParentBindValueList() {
    return [];
  }
}
