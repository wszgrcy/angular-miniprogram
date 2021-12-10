import type {
  BoundAttribute,
  Template,
  TextAttribute,
} from '@angular/compiler/src/render3/r3_ast';
import { ComponentContext } from './component-context';
import {
  NgNodeKind,
  NgNodeMeta,
  NgTemplateMeta,
  ParsedNode,
} from './interface';

export class ParsedNgTemplate implements ParsedNode<NgTemplateMeta> {
  kind = NgNodeKind.Template;
  attrs!: (BoundAttribute | TextAttribute)[];

  declareContext: Record<string, string> = {};
  globalContext!: ComponentContext;
  private children: ParsedNode<NgNodeMeta>[] = [];

  constructor(
    private node: Template,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    public index: number
  ) {}

  getOriginChildren() {
    return this.node.children;
  }
  setNgNodeChildren(children: ParsedNode<NgNodeMeta>[]) {
    this.children = children;
  }
  appendNgNodeChild(child: ParsedNode<NgNodeMeta>) {
    this.children.push(child);
  }
  private getTemplateName(): string {
    this.attrs = this.node.templateAttrs;
    if (this.node.references && this.node.references.length) {
      return this.node.references[0].name;
    } else {
      return `ngDefault_${this.globalContext.getBindIndex()}`;
    }
  }

  getNodeMeta(globalContext: ComponentContext): NgTemplateMeta {
    this.globalContext = globalContext;
    const directive = this.getTemplateName()!;
    const meta: NgTemplateMeta = {
      kind: NgNodeKind.Template,
      children: this.children.map((child) => child.getNodeMeta(globalContext)),
      index: this.index,
      defineTemplateName: directive,
    };

    return meta;
  }
}
