import type { Element } from '../../angular-internal/ast.type';
import { ComponentContext } from './component-context';
import { NgElementMeta, NgNodeKind, NgNodeMeta, ParsedNode } from './interface';
import type { MatchedComponent, MatchedDirective } from './type';

export class ParsedNgElement implements ParsedNode<NgElementMeta> {
  private tagName!: string;
  private children: ParsedNode<NgNodeMeta>[] = [];
  attributeObject: Record<string, string> = {};
  kind = NgNodeKind.Element;
  inputs: string[] = [];
  outputs: string[] = [];
  singleClosedTag = false;
  constructor(
    private node: Element,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    private componentMeta: MatchedComponent | undefined,
    public index: number,
    private directiveMeta: MatchedDirective | undefined
  ) {}
  private analysis() {
    this.getTagName();
    this.node.attributes
      .filter((item) => item.name !== 'class' && item.name !== 'style')
      .forEach((item) => {
        this.attributeObject[item.name] = item.value;
      });

    this.node.inputs.forEach((input) => {
      if (input.type === 0) {
        this.inputs.push(input.name);
      }
    });
    this.node.outputs.forEach((output) => {
      this.outputs.push(output.name);
    });

    if (
      !this.node.endSourceSpan ||
      this.node.startSourceSpan.end.offset ===
        this.node.endSourceSpan.end.offset
    ) {
      this.singleClosedTag = true;
    }
  }
  private getTagName() {
    const originTagName = this.node.name;
    this.tagName = originTagName;
    if (/^(div|p|h1|h2|h3|h4|h5|h6|span)$/.test(originTagName)) {
      this.tagName = 'view';
    } else if (originTagName === 'ng-container') {
      this.tagName = 'block';
    }
  }

  appendNgNodeChild(child: ParsedNode<NgNodeMeta>) {
    this.children.push(child);
  }
  getNodeMeta(): NgElementMeta {
    this.analysis();

    return {
      kind: NgNodeKind.Element,
      tagName: this.tagName,
      children: this.children.map((child) => child.getNodeMeta()),
      inputs: this.inputs,
      outputs: this.outputs,
      attributes: this.attributeObject,
      singleClosedTag: this.singleClosedTag,
      componentMeta: this.componentMeta,
      index: this.index,
      directiveMeta: this.directiveMeta,
    };
  }
}
