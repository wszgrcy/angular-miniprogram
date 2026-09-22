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
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  NonNullAssert,
  ParenthesizedExpression,
  PrefixNot,
  PropertyRead,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
  TaggedTemplateLiteral,
  TemplateLiteral,
  TemplateLiteralElement,
  Text,
  TmplAstComponent,
  TmplAstDeferredBlock,
  TmplAstDeferredBlockError,
  TmplAstDeferredBlockLoading,
  TmplAstDeferredBlockPlaceholder,
  TmplAstDeferredTrigger,
  TmplAstDirective,
  TmplAstForLoopBlock,
  TmplAstForLoopBlockEmpty,
  TmplAstIfBlock,
  TmplAstIfBlockBranch,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstRecursiveVisitor,
  TmplAstSwitchBlock,
  TmplAstSwitchBlockCase,
  TmplAstUnknownBlock,
  TypeofExpression,
  Visitor,
} from '@angular/compiler';

import * as t from '../../angular-internal/ast.type';
import { ParsedNgBoundText } from './bound-text';
import { ComponentContext } from './component-context';
import { ParsedNgContent } from './content';
import { ParsedNgElement } from './element';
import { NgNodeMeta, ParsedNode } from './interface';
import { ParsedNgTemplate } from './template';
import { ParsedNgText } from './text';
import { MatchedComponent, MatchedDirective } from './type';

export class TemplateDefinition implements TmplAstRecursiveVisitor {
  private templateDefinitionMap = new Map<t.Template, TemplateDefinition>();
  private parentNode: ParsedNgElement | ParsedNgTemplate | undefined;
  list: ParsedNode<NgNodeMeta>[] = [];
  private declIndex = 0;

  astVisitor = new CustomAstVisitor(() => {
    this.declIndex++;
  });
  constructor(
    private nodes: t.Node[],
    private componentContext: ComponentContext
  ) {}
  init() {}
  visit?(node: t.Node) {}
  visitElement(element: t.Element) {
    const nodeIndex = this.declIndex++;
    let componentMeta: MatchedComponent | undefined;
    let directiveMeta: MatchedDirective | undefined;
    const result = this.componentContext.matchDirective(element);
    const directiveMetaList = result.filter((item) => {
      if (item.isComponent) {
        componentMeta = item;
      }
      return !item.isComponent;
    });
    if (directiveMetaList.length) {
      directiveMeta = {
        isComponent: false,
        listeners: directiveMetaList.map((item) => item.listeners).flat(),
        properties: directiveMetaList.map((item) => item.properties).flat(),
        inputs: directiveMetaList.map((item) => item.inputs).flat(),
        outputs: directiveMetaList.map((item) => item.outputs).flat(),
      };
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

  visitTemplate(template: t.Template) {
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
      this.componentContext
    );
    instance.parentNode = templateInstance;
    this.templateDefinitionMap.set(template, instance);

    instance.run();
    if (!this.parentNode) {
      this.list.push(templateInstance);
    }
  }
  visitContent(content: t.Content) {
    const nodeIndex = this.declIndex++;
    const instance = new ParsedNgContent(content, this.parentNode, nodeIndex);
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(instance);
    } else {
      this.list.push(instance);
    }
  }
  visitVariable(variable: t.Variable) {}
  /**
   * Angular 18 新增的 `@let` 模板语法。
   * 它不会产生任何渲染节点，因此这里不占用 declIndex，仅作为空实现保证访问器完整。
   */
  visitLetDeclaration(declaration: TmplAstLetDeclaration) {}
  visitReference(reference: t.Reference) {}
  visitTextAttribute(attribute: t.TextAttribute) {}
  visitBoundAttribute(attribute: t.BoundAttribute) {}
  visitBoundEvent(attribute: t.BoundEvent) {}
  visitText(text: t.Text) {
    const nodeIndex = this.declIndex++;
    const instance = new ParsedNgText(text, this.parentNode, nodeIndex);
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(instance);
    } else {
      this.list.push(instance);
    }
  }
  visitBoundText(text: t.BoundText) {
    const nodeIndex = this.declIndex++;
    text.value.visit(this.astVisitor);
    const instance = new ParsedNgBoundText(text, this.parentNode, nodeIndex);
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(instance);
    } else {
      this.list.push(instance);
    }
  }
  visitIcu(icu: t.Icu) {}
  run() {
    visitAll(this, this.nodes);
    return this.list;
  }
  prepareRefsArray(refs: t.Reference[]) {
    if (!refs || !refs.length) {
      return;
    }
    refs.forEach((item) => {
      this.declIndex++;
    });
  }
  // todo
  visitDeferredBlock(deferred: TmplAstDeferredBlock): void {}
  visitDeferredBlockError(block: TmplAstDeferredBlockError): void {}
  visitDeferredBlockLoading(block: TmplAstDeferredBlockLoading): void {}
  visitDeferredBlockPlaceholder(block: TmplAstDeferredBlockPlaceholder): void {}
  visitDeferredTrigger(trigger: TmplAstDeferredTrigger): void {}
  visitForLoopBlock(block: TmplAstForLoopBlock): void {}
  visitForLoopBlockEmpty(block: TmplAstForLoopBlockEmpty): void {}
  visitIfBlock(block: TmplAstIfBlock): void {}
  visitIfBlockBranch(block: TmplAstIfBlockBranch): void {}
  visitSwitchBlock(block: TmplAstSwitchBlock): void {}
  visitSwitchBlockCase(block: TmplAstSwitchBlockCase): void {}
  visitUnknownBlock(block: TmplAstUnknownBlock): void {}
  /** Angular 20 新增：模板 AST 中的组件 / 指令节点 */
  visitComponent(component: TmplAstComponent) {}
  visitDirective(directive: TmplAstDirective) {}
}
export function visitAll(visitor: TemplateDefinition, nodes: TmplAstNode[]) {
  for (const node of nodes) {
    node.visit(visitor);
  }
}
class CustomAstVisitor implements AstVisitor {
  constructor(private pipeCallback: () => void) {}
  visitCall(ast: Call) {
    ast.receiver.visit(this);
    this.visitAll(ast.args);
  }
  visitSafeCall(ast: SafeCall) {
    ast.receiver.visit(this);
    this.visitAll(ast.args);
  }
  visitSafeKeyedRead(ast: SafeKeyedRead) {
    ast.receiver.visit(this);
    ast.key.visit(this);
  }
  visitImplicitReceiver(ast: ImplicitReceiver) {}
  visitInterpolation(ast: Interpolation) {
    this.visitAll(ast.expressions);
  }
  visitKeyedRead(ast: KeyedRead) {
    ast.receiver.visit(this);
    ast.key.visit(this);
  }
  visitLiteralArray(ast: LiteralArray) {
    this.visitAll(ast.expressions);
  }
  visitLiteralMap(ast: LiteralMap) {
    this.visitAll(ast.values);
  }
  visitLiteralPrimitive(ast: LiteralPrimitive) {}
  visitPipe(ast: BindingPipe) {
    this.pipeCallback();
  }
  visitPrefixNot(ast: PrefixNot) {
    ast.expression.visit(this);
  }
  visitNonNullAssert(ast: NonNullAssert) {
    ast.expression.visit(this);
  }
  visitPropertyRead(ast: PropertyRead) {
    ast.receiver.visit(this);
  }

  visitSafePropertyRead(ast: SafePropertyRead) {}
  visitBinary(ast: Binary) {
    ast.left.visit(this);
    ast.right.visit(this);
  }
  visitChain(ast: Chain) {
    this.visitAll(ast.expressions);
  }
  /** Angular 19 新增：`typeof` 表达式 */
  visitTypeofExpression(ast: TypeofExpression) {
    ast.expression.visit(this);
  }
  /** Angular 20 新增：`void` 表达式（类型与 typeof 共用） */
  visitVoidExpression(ast: TypeofExpression) {
    ast.expression.visit(this);
  }
  /** Angular 20 新增：带标签的模板字符串 */
  visitTaggedTemplateLiteral(ast: TaggedTemplateLiteral) {
    ast.tag.visit(this);
    this.visitAll(ast.template.expressions);
  }
  /** Angular 20 新增：括号表达式 */
  visitParenthesizedExpression(ast: ParenthesizedExpression) {
    ast.expression.visit(this);
  }
  /** Angular 19 新增：模板字符串字面量 */
  visitTemplateLiteral(ast: TemplateLiteral) {
    this.visitAll(ast.expressions);
  }
  visitTemplateLiteralElement(ast: TemplateLiteralElement) {}
  visitConditional(ast: Conditional) {
    ast.condition.visit(this);
    ast.trueExp.visit(this);
    ast.falseExp.visit(this);
  }
  visit(ast: AST) {}
  visitAll(asts: AST[]) {
    for (let i = 0; i < asts.length; ++i) {
      const original = asts[i];
      original.visit(this);
    }
  }
}
