import { ASTWithSource } from '@angular/compiler';
import { BoundAttribute, Element } from '@angular/compiler/src/render3/r3_ast';
import { TemplateInterpolationService } from '../template-interpolation.service';
import { TagEventMeta } from './event';
import { TemplateGlobalContext } from './global-context';
import { NgElementMeta, NgNodeKind, NgNodeMeta, ParsedNode } from './interface';
import { BindValue, PlainValue } from './value';

export class ParsedNgElement implements ParsedNode<NgElementMeta> {
  classList: string[] = [];
  private tagChange = false;
  private tagName!: string;
  private children: ParsedNode<NgNodeMeta>[] = [];
  attributeObject: Record<string, string> = {};
  kind = NgNodeKind.Element;
  inputs: Record<string, PlainValue | BindValue> = {};
  outputSet: TagEventMeta[] = [];
  bindValueList: string[] = [];
  ngSwitch: BoundAttribute | undefined;
  ngSwitchFirst = true;
  singleClosedTag = false;

  constructor(
    private node: Element,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    public templateInterpolationService: TemplateInterpolationService
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
      const result =
        this.templateInterpolationService.expressionConvertToString(
          (input.value as ASTWithSource).ast
        );
      this.inputs[input.name] = result;
    });
    this.node.outputs.forEach((output) => {
      this.outputSet.push(
        new TagEventMeta(
          (output.target || 'bind') + ':' + output.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          output.handler as any
        )
      );
    });

    this.ngSwitch = this.node.inputs.find((item) => item.name === 'ngSwitch');
    if (this.ngSwitch) {
      delete this.inputs['ngSwitch'];
    }
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
  getNodeMeta(globalContext: TemplateGlobalContext): NgElementMeta {
    this.analysis();

    return {
      kind: NgNodeKind.Element,
      tagName: this.tagName,
      children: this.children.map((child) => child.getNodeMeta(globalContext)),
      inputs: this.inputs,
      outputs: this.outputSet,
      attributes: this.attributeObject,
      singleClosedTag: this.singleClosedTag,
      data: this.getBindValueList().map((item) => item.split('.')[0]),
    };
  }
  getNgSwitch() {
    if (this.ngSwitch) {
      const first = this.ngSwitchFirst;
      this.ngSwitchFirst = false;
      return { first: first, ngSwitch: this.ngSwitch };
    }
    return undefined;
  }
  getBindValueList() {
    const list = [
      // ...this.bindValueList,
      ...this.children
        .map((item) => item.getBindValueList())
        .reduce((pre, cur) => {
          pre.push(...cur);
          return pre;
        }, []),
    ];
    const parentList = this.getParentBindValueList();
    return list.filter((item) => !parentList.includes(item));
  }
  getParentBindValueList() {
    if (this.parent) {
      return [
        ...this.parent.bindValueList,
        ...(this.parent.autoGenerateValueList || []),
        ...this.parent.getParentBindValueList(),
      ];
    }
    return [];
  }
}
