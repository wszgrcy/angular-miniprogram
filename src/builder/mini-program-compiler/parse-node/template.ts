import type { Template } from '../../angular-internal/ast.type';
import {
  NgNodeKind,
  NgNodeMeta,
  NgTemplateMeta,
  ParsedNode,
} from './interface';

export class ParsedNgTemplate implements ParsedNode<NgTemplateMeta> {
  kind = NgNodeKind.Template;
  private children: ParsedNode<NgNodeMeta>[] = [];

  constructor(
    private node: Template,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    public index: number
  ) {}

  appendNgNodeChild(child: ParsedNode<NgNodeMeta>) {
    this.children.push(child);
  }
  private getTemplateName(): string {
    if (this.node.references && this.node.references.length) {
      return this.node.references[0].name;
    } else {
      return `ngDefault_${this.index}`;
    }
  }

  getNodeMeta(): NgTemplateMeta {
    const directive = this.getTemplateName()!;
    const meta: NgTemplateMeta = {
      kind: NgNodeKind.Template,
      children: this.children.map((child) => child.getNodeMeta()),
      index: this.index,
      defineTemplateName: directive,
    };

    return meta;
  }
}
