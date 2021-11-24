import type { ASTWithSource, BindingType } from '@angular/compiler';
import type {
  BoundAttribute,
  Element,
} from '@angular/compiler/src/render3/r3_ast';
import type { MatchedComponentMeta, MatchedDirectiveMeta } from '../type';
import { TagEventMeta } from './event';
import { ComponentContext } from './global-context';
import { NgElementMeta, NgNodeKind, NgNodeMeta, ParsedNode } from './interface';

export class ParsedNgElement implements ParsedNode<NgElementMeta> {
  private tagName!: string;
  private children: ParsedNode<NgNodeMeta>[] = [];
  attributeObject: Record<string, string> = {};
  kind = NgNodeKind.Element;
  property: string[] = [];
  outputSet: TagEventMeta[] = [];
  ngSwitch: BoundAttribute | undefined;
  ngSwitchFirst = true;
  ngSwitchIndex = 0;
  singleClosedTag = false;
  constructor(
    private node: Element,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    private componentMeta: MatchedComponentMeta | undefined,
    public index: number,
    private directiveMeta: MatchedDirectiveMeta | undefined
  ) {}
  private analysis() {
    this.getTagName();
    this.node.attributes
      .filter((item) => item.name !== 'class')
      .forEach((item) => {
        this.attributeObject[item.name] = item.value;
      });

    this.node.inputs.forEach((input) => {
      if (input.type === 0) {
        this.property.push(input.name);
      }
    });
    this.node.outputs.forEach((output) => {
      this.outputSet.push(
        new TagEventMeta(
          output.target || 'bind',
          output.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (output.handler as ASTWithSource).source!
        )
      );
    });

    this.ngSwitch = this.node.inputs.find((item) => item.name === 'ngSwitch');

    if (!this.node.endSourceSpan) {
      this.singleClosedTag = true;
    }
  }
  private getTagName() {
    const originTagName = this.node.name;
    this.tagName = originTagName;
    if (/^(div|p|h1|h2|h3|h4|h5|h6|span)$/.test(originTagName)) {
      this.tagName = 'view';
    }
  }

  appendNgNodeChild(child: ParsedNode<NgNodeMeta>) {
    this.children.push(child);
  }
  getNodeMeta(globalContext: ComponentContext): NgElementMeta {
    this.analysis();

    return {
      kind: NgNodeKind.Element,
      tagName: this.tagName,
      children: this.children.map((child) => child.getNodeMeta(globalContext)),
      property: this.property,
      outputs: this.outputSet,
      attributes: this.attributeObject,
      singleClosedTag: this.singleClosedTag,
      componentMeta: this.componentMeta,
      index: this.index,
      directiveMeta: this.directiveMeta,
    };
  }
  getNgSwitch() {
    if (this.ngSwitch) {
      const first = this.ngSwitchFirst;
      this.ngSwitchFirst = false;

      return {
        first: first,
        ngSwitch: this.ngSwitch,
        index: this.ngSwitchIndex++,
      };
    }
    return undefined;
  }
}
