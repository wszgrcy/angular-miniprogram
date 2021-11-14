import { BindingType } from '@angular/compiler';
import { BoundAttribute, Element } from '@angular/compiler/src/render3/r3_ast';
import { TagEventMeta } from './event';
import { TemplateGlobalContext } from './global-context';
import { NgElementMeta, NgNodeKind, NgNodeMeta, ParsedNode } from './interface';
import { MatchedDirective } from './type';

export class ParsedNgElement implements ParsedNode<NgElementMeta> {
  classList: string[] = [];
  private tagChange = false;
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
  ngInternalOutputs: string[] = [];
  constructor(
    private node: Element,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    private componentMeta:
      | { type: MatchedDirective; isComponent: boolean }
      | undefined,
    public nodeIndex: number,
    private directiveMeta: { listeners: string[] } | undefined
  ) {}
  private analysis() {
    this.getTagName();
    this.getClass();
    this.node.attributes
      .filter((item) => item.name !== 'class')
      .forEach((item) => {
        this.attributeObject[item.name] = item.value;
      });
    if (this.classList.length) {
      this.attributeObject['class'] = this.classList.join(' ');
    }
    this.node.inputs.forEach((input) => {
      if (input.type === BindingType.Property) {
        this.property.push(input.name);
      }
    });
    this.node.outputs.forEach((output) => {
      this.outputSet.push(
        new TagEventMeta(
          output.target || 'bind',
          output.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          output.handler as any
        )
      );
    });
    if (this.componentMeta) {
      this.ngInternalOutputs = this.componentMeta.type.meta.directive.outputs;
    }
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
      this.tagChange = true;
    }
  }
  private getClass() {
    const classAttribute = this.node.attributes.find(
      (item) => item.name === 'class'
    );
    if (classAttribute) {
      this.classList = classAttribute.value.split(' ');
    }
    if (this.tagChange) {
      this.classList.push(`origin-tag-${this.node.name}`);
    }
  }
  getOriginChildren() {
    return this.node.children;
  }
  setNgNodeChildren(children: ParsedNode<NgNodeMeta>[]) {
    this.children = children;
  }
  appendNgNodeChild(child: ParsedNode<NgNodeMeta>) {
    this.children.push(child);
  }
  getNodeMeta(globalContext: TemplateGlobalContext): NgElementMeta {
    this.analysis();

    return {
      kind: NgNodeKind.Element,
      tagName: this.tagName,
      children: this.children.map((child) => child.getNodeMeta(globalContext)),
      property: this.property,
      outputs: this.outputSet,
      attributes: this.attributeObject,
      singleClosedTag: this.singleClosedTag,
      componentMeta: {
        outputs: this.ngInternalOutputs,
        isComponent: this.componentMeta?.isComponent || false,
      },
      nodeIndex: this.nodeIndex,
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
