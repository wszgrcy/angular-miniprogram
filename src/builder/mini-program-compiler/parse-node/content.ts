import type { Content } from '../../angular-internal/ast.type';
import { NgContentMeta, NgNodeKind, NgNodeMeta, ParsedNode } from './interface';

const SELECT_NAME_VALUE_REGEXP = /^\[slot=["']?([^"']*)["']?\]$/;
export class ParsedNgContent implements ParsedNode<NgContentMeta> {
  kind = NgNodeKind.Content;

  constructor(
    private node: Content,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    public index: number
  ) {}
  getNodeMeta(): NgContentMeta {
    const nameAttr = this.node.attributes.find(
      (item) => item.name === 'select'
    );
    let value: string | undefined;
    if (nameAttr) {
      const result = nameAttr.value.match(SELECT_NAME_VALUE_REGEXP);
      if (!result) {
        throw new Error(
          `ng-content未匹配到指定格式的select,value:${nameAttr.value},需要格式为[slot="xxxx"]`
        );
      }
      value = result[1];
    }
    return {
      kind: NgNodeKind.Content,
      name: value,
      index: this.index,
    };
  }
}
