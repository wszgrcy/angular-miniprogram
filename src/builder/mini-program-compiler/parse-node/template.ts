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

  /**
   * @param node 真实的 `<ng-template>` 节点；内建控制流（`@if`/`@for`/`@switch`）
   * 没有对应的 `Template` AST，传 `null` 并用 `templateName` 指定模板名。
   * @param templateName 显式模板名，优先级高于从 AST 推导。
   */
  constructor(
    private node: Template | null,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    public index: number,
    private templateName?: string
  ) {}

  appendNgNodeChild(child: ParsedNode<NgNodeMeta>) {
    this.children.push(child);
  }
  private getTemplateName(): string {
    if (this.templateName) {
      return this.templateName;
    }
    if (this.node && this.node.references && this.node.references.length) {
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
