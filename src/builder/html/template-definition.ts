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
import { ParsedNgBoundText } from './node-handle/bound-text';
import { ParsedNgContent } from './node-handle/content';
import { ParsedNgElement } from './node-handle/element';
import { TemplateGlobalContext } from './node-handle/global-context';
import { NgNodeMeta, ParsedNode } from './node-handle/interface';
import { ParsedNgTemplate } from './node-handle/template';
import { ParsedNgText } from './node-handle/text';
import { MatchedDirective } from './node-handle/type';
import { TemplateInterpolationService } from './template-interpolation.service';

export class TemplateDefinition implements Visitor {
  /** 变量对应的值索引 */
  private templateDefinitionMap = new Map<Template, TemplateDefinition>();
  private parentNode: ParsedNgElement | ParsedNgTemplate | undefined;
  list: ParsedNode<NgNodeMeta>[] = [];
  private currentComponentIndex = 0;
  constructor(
    private nodes: Node[],
    private templateGlobalContext: TemplateGlobalContext,
    private service: TemplateInterpolationService
  ) {}

  visit?(node: Node) {}
  visitElement(element: Element) {
    let componentMeta: { index: number; type: MatchedDirective } | undefined;
    const result = this.templateGlobalContext.matchDirective(element);
    let index: number | undefined;
    if (result && result.some((item) => item.directiveMetadata.isComponent)) {
      index = this.currentComponentIndex++;
      const type = result.find((item) => item.directiveMetadata.isComponent)!;
      componentMeta = { index, type: type };
    }
    const instance = new ParsedNgElement(
      element,
      this.parentNode,
      this.service,
      componentMeta
    );
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(instance);
    }
    const oldParent = this.parentNode;
    this.parentNode = instance;
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
    const templateInstance = new ParsedNgTemplate(
      template,
      this.parentNode,
      this.service
    );
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(templateInstance);
    }
    const instance = new TemplateDefinition(
      template.children,
      this.templateGlobalContext,
      this.service
    );
    instance.parentNode = templateInstance;
    this.templateDefinitionMap.set(template, instance);

    instance.run();
    if (!this.parentNode) {
      this.list.push(templateInstance);
    }
  }
  visitContent(content: Content) {
    const instance = new ParsedNgContent(
      content,
      this.parentNode,
      this.service
    );
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
    const instance = new ParsedNgText(text, this.parentNode, this.service);
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(instance);
    }
    if (!this.parentNode) {
      this.list.push(instance);
    }
  }
  visitBoundText(text: BoundText) {
    const instance = new ParsedNgBoundText(text, this.parentNode, this.service);
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
}
