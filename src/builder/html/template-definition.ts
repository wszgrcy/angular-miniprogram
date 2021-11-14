import { ConstantPool } from '@angular/compiler';
import {
  BoundAttribute,
  BoundEvent,
  BoundText,
  Content,
  Element,
  Icu,
  Node,
  Reference,
  Template,
  Text,
  TextAttribute,
  Variable,
  Visitor,
  visitAll,
} from '@angular/compiler/src/render3/r3_ast';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { ParsedNgBoundText } from './node-handle/bound-text';
import { ParsedNgContent } from './node-handle/content';
import { ParsedNgElement } from './node-handle/element';
import { TemplateGlobalContext } from './node-handle/global-context';
import { NgNodeMeta, ParsedNode } from './node-handle/interface';
import { ParsedNgTemplate } from './node-handle/template';
import { ParsedNgText } from './node-handle/text';
import { MatchedDirective } from './node-handle/type';

export class TemplateDefinition implements Visitor {
  test = Math.random();
  /** 变量对应的值索引 */
  private templateDefinitionMap = new Map<Template, TemplateDefinition>();
  private parentNode: ParsedNgElement | ParsedNgTemplate | undefined;
  list: ParsedNode<NgNodeMeta>[] = [];
  private currentComponentIndex = 0;
  private declIndex = 0;
  private valueConverter = new ValueConverter(
    new ConstantPool(),
    () => {
      this.declIndex++;
      return 0;
    },
    () => 0,
    () => {}
  );
  constructor(
    private nodes: Node[],
    private templateGlobalContext: TemplateGlobalContext
  ) {}

  visit?(node: Node) {}
  visitElement(element: Element) {
    const nodeIndex = this.declIndex++;
    let componentMeta:
      | { type: MatchedDirective; isComponent: boolean }
      | undefined;
    let directiveMeta: { listeners: string[] } | undefined;
    const result = this.templateGlobalContext.matchDirective(element);
    if (result) {
      if (result.some((item) => item.directiveMetadata.isComponent)) {
        const type = result.find((item) => item.directiveMetadata.isComponent)!;
        componentMeta = { type: type, isComponent: true };
      } else {
        const list = result.filter(
          (item) => !item.directiveMetadata.isComponent
        );
        const listeners: string[] = [];
        list.forEach((item) => {
          Object.keys(
            (item.directiveMetadata as any).meta.host.listeners
          ).forEach((listener) => {
            listeners.push(listener);
          });
        });
        directiveMeta = { listeners };
      }
    }

    const instance = new ParsedNgElement(
      element,
      this.parentNode,
      componentMeta,
      nodeIndex,
      directiveMeta
    );
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(instance);
    }
    element.inputs.forEach((item) => {
      item.value.visit(this.valueConverter);
    });
    const oldParent = this.parentNode;
    this.parentNode = instance;
    this.prepareRefsArray(element.references);

    visitAll(this, element.children);
    this.parentNode = oldParent;
    if (!this.parentNode) {
      this.list.push(instance);
    }
  }
  /**
   * 先查定义
   * 然后再查引用
   * 最后再ngif及ngfor,ngtemplateoutlet上面找对应的模板,进行标识
   * todo 对于自定义结构型指令的处理
   */
  visitTemplate(template: Template) {
    const nodeIndex = this.declIndex++;
    const templateInstance = new ParsedNgTemplate(
      template,
      this.parentNode,
      nodeIndex
    );
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(templateInstance);
    }
    this.prepareRefsArray(template.references);
    template.templateAttrs.forEach((item) => {
      if (typeof item.value !== 'string') {
        item.value.visit(this.valueConverter);
      }
    });
    template.inputs.forEach((item) => {
      item.value.visit(this.valueConverter);
    });
    const instance = new TemplateDefinition(
      template.children,
      this.templateGlobalContext
    );
    instance.parentNode = templateInstance;
    this.templateDefinitionMap.set(template, instance);

    instance.run();
    if (!this.parentNode) {
      this.list.push(templateInstance);
    }
  }
  visitContent(content: Content) {
    const nodeIndex = this.declIndex++;
    const instance = new ParsedNgContent(content, this.parentNode, nodeIndex);
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(instance);
    }
    if (!this.parentNode) {
      this.list.push(instance);
    }
  }
  visitVariable(variable: Variable) {}
  visitReference(reference: Reference) {}
  visitTextAttribute(attribute: TextAttribute) {}
  visitBoundAttribute(attribute: BoundAttribute) {}
  visitBoundEvent(attribute: BoundEvent) {}
  visitText(text: Text) {
    const nodeIndex = this.declIndex++;
    const instance = new ParsedNgText(text, this.parentNode, nodeIndex);
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(instance);
    }
    if (!this.parentNode) {
      this.list.push(instance);
    }
  }
  visitBoundText(text: BoundText) {
    const nodeIndex = this.declIndex++;
    text.value.visit(this.valueConverter);
    const instance = new ParsedNgBoundText(text, this.parentNode, nodeIndex);
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(instance);
    }
    if (!this.parentNode) {
      this.list.push(instance);
    }
  }
  visitIcu(icu: Icu) {}
  run() {
    visitAll(this, this.nodes);
    return this.list;
  }
  prepareRefsArray(refs: Reference[]) {
    if (!refs || !refs.length) {
      return;
    }
    refs.forEach((item) => {
      this.declIndex++;
    });
  }
}
