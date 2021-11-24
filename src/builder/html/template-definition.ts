import type {
  AST,
  AstVisitor,
  Binary,
  BindingPipe,
  Call,
  Chain,
  Conditional,
  ImplicitReceiver,
  Interpolation,
  KeyedRead,
  KeyedWrite,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  NonNullAssert,
  PrefixNot,
  PropertyRead,
  PropertyWrite,
  Quote,
  SafeKeyedRead,
  SafePropertyRead,
} from '@angular/compiler';
import type {
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
} from '@angular/compiler/src/render3/r3_ast';
import { ParsedNgBoundText } from './node-handle/bound-text';
import { ParsedNgContent } from './node-handle/content';
import { ParsedNgElement } from './node-handle/element';
import { ComponentContext } from './node-handle/global-context';
import { NgNodeMeta, ParsedNode } from './node-handle/interface';
import { ParsedNgTemplate } from './node-handle/template';
import { ParsedNgText } from './node-handle/text';
import type { MatchedComponentMeta, MatchedDirectiveMeta } from './type';

export class TemplateDefinition implements Visitor {
  /** 变量对应的值索引 */
  private templateDefinitionMap = new Map<Template, TemplateDefinition>();
  private parentNode: ParsedNgElement | ParsedNgTemplate | undefined;
  list: ParsedNode<NgNodeMeta>[] = [];
  private declIndex = 0;

  astVisitor = new CustomAstVisitor(() => {
    this.declIndex++;
  });
  constructor(
    private nodes: Node[],
    private templateGlobalContext: ComponentContext
  ) {}
  init() {}
  visit?(node: Node) {}
  visitElement(element: Element) {
    const nodeIndex = this.declIndex++;
    let componentMeta: MatchedComponentMeta | undefined;
    let directiveMeta: MatchedDirectiveMeta | undefined;
    const result = this.templateGlobalContext.matchDirective(element);
    if (result) {
      if (result.some((item) => item.isComponent)) {
        const type = result.find((item) => item.isComponent)!;
        componentMeta = {
          outputs: type.outputs!,
          isComponent: true,
          moduleName: type.moduleName!,
          filePath: type.filePath!,
          selector: type.selector!,
        };
      }

      const list = result.filter((item) => !item.isComponent);
      if (list.length) {
        directiveMeta = {
          listeners: list.map((item) => item.listeners!).flat(),
        };
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
      item.value.visit(this.astVisitor);
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
        item.value.visit(this.astVisitor);
      }
    });
    template.inputs.forEach((item) => {
      item.value.visit(this.astVisitor);
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
    text.value.visit(this.astVisitor);
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
export function visitAll<Result>(
  visitor: Visitor<Result>,
  nodes: Node[]
): Result[] {
  const result: Result[] = [];
  if (visitor.visit) {
    for (const node of nodes) {
      const newNode = visitor.visit(node) || node.visit(visitor);
    }
  } else {
    for (const node of nodes) {
      const newNode = node.visit(visitor);
      if (newNode) {
        result.push(newNode);
      }
    }
  }
  return result;
}
class CustomAstVisitor implements AstVisitor {
  constructor(private pipeCallback: () => void) {}
  visitCall(ast: Call, context: any) {
    ast.receiver.visit(this);
    this.visitAll(ast.args);
  }
  visitSafeKeyedRead(ast: SafeKeyedRead, context: any) {
    ast.receiver.visit(this);
    ast.key.visit(this);
  }
  visitImplicitReceiver(ast: ImplicitReceiver, context: any) {}
  visitInterpolation(ast: Interpolation, context: any) {
    this.visitAll(ast.expressions);
  }
  visitKeyedRead(ast: KeyedRead, context: any) {
    ast.receiver.visit(this);
    ast.key.visit(this);
  }
  visitKeyedWrite(ast: KeyedWrite, context: any) {
    ast.receiver.visit(this);
    ast.key.visit(this);
    ast.value.visit(this);
  }
  visitLiteralArray(ast: LiteralArray, context: any) {
    this.visitAll(ast.expressions);
  }
  visitLiteralMap(ast: LiteralMap, context: any) {
    this.visitAll(ast.values);
  }
  visitLiteralPrimitive(ast: LiteralPrimitive, context: any) {}
  visitPipe(ast: BindingPipe, context: any) {
    this.pipeCallback();
  }
  visitPrefixNot(ast: PrefixNot, context: any) {
    ast.expression.visit(this);
  }
  visitNonNullAssert(ast: NonNullAssert, context: any) {
    ast.expression.visit(this);
  }
  visitPropertyRead(ast: PropertyRead, context: any) {
    ast.receiver.visit(this);
  }
  visitPropertyWrite(ast: PropertyWrite, context: any) {}
  visitQuote(ast: Quote, context: any) {}
  visitSafePropertyRead(ast: SafePropertyRead, context: any) {}
  visitBinary(ast: Binary, context: any) {
    ast.left.visit(this);
    ast.right.visit(this);
  }
  visitChain(ast: Chain, context: any) {
    this.visitAll(ast.expressions);
  }
  visitConditional(ast: Conditional, context: any) {
    ast.condition.visit(this);
    ast.trueExp.visit(this);
    ast.falseExp.visit(this);
  }
  visit(ast: AST, context?: any) {}
  visitAll(asts: AST[]) {
    for (let i = 0; i < asts.length; ++i) {
      const original = asts[i];
      original.visit(this);
    }
  }
}
