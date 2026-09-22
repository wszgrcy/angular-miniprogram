import type {
  AST,
  ArrowFunction,
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
  RegularExpressionLiteral,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
  SpreadElement,
  TaggedTemplateLiteral,
  TemplateLiteral,
  TemplateLiteralElement,
  Text,
  TmplAstComponent,
  TmplAstContentBlock,
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
  TmplAstSwitchBlockCaseGroup,
  TmplAstSwitchExhaustiveCheck,
  TmplAstUnknownBlock,
  TypeofExpression,
  Unary,
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
    private componentContext: ComponentContext,
    /**
     * 当前视图在组件模板中的路径前缀，用于保证生成的模板名在
     * 同一个 wxml 里全局唯一（否则嵌套的匿名模板会互相覆盖）。
     */
    private namePrefix = ''
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
    // 有引用名就用引用名，否则用带路径前缀的默认名，保证全局唯一
    const templateName =
      template.references && template.references.length
        ? undefined
        : `ngDefault_${this.namePrefix}${nodeIndex}`;
    const templateInstance = new ParsedNgTemplate(
      template,
      this.parentNode,
      nodeIndex,
      templateName
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
      this.componentContext,
      `${this.namePrefix}${nodeIndex}_`
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
   * 统计若干表达式中管道占用的声明槽位。
   * 内建控制流的条件表达式在 Angular 里会被编译成宿主视图的 `ɵɵpipe`，
   * 每个管道占一个声明索引，必须跟着一起算，否则后面的节点全错位。
   */
  private countPipeSlots(
    ...asts: Array<{ visit: (v: AstVisitor) => unknown } | null | undefined>
  ): number {
    let count = 0;
    const visitor = new CustomAstVisitor(() => {
      count++;
    });
    asts.forEach((ast) => ast?.visit(visitor));
    return count;
  }

  /**
   * 为控制流分支建立一个模板节点。
   * 分支内容是一个独立的 embedded view，拥有自己的声明索引空间，
   * 所以这里用新的 `TemplateDefinition` 访问子节点，不影响当前视图的 `declIndex`。
   */
  private createControlFlowTemplate(
    children: TmplAstNode[],
    index: number,
    kind: string
  ) {
    const name = `${kind}_${this.namePrefix}${index}`;
    const templateInstance = new ParsedNgTemplate(
      null,
      this.parentNode,
      index,
      name
    );
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(templateInstance);
    }
    const instance = new TemplateDefinition(
      children,
      this.componentContext,
      `${this.namePrefix}${index}_`
    );
    instance.parentNode = templateInstance;
    instance.run();
    if (!this.parentNode) {
      this.list.push(templateInstance);
    }
  }

  /**
   * `@if` / `@else if` / `@else`。
   *
   * Angular 的槽位分配（见 `slot_allocation` + `pipe_creation` 两个 phase）：
   *
   * ```text
   * i        : 第一个分支的模板锚点（ɵɵconditionalCreate）
   * i+1..P   : 所有分支条件表达式里的管道（统一插到第一个 create 之后）
   * i+P+1..  : 其余分支的模板锚点（ɵɵconditionalBranchCreate）
   * ```
   */
  visitIfBlock(block: TmplAstIfBlock): void {
    const branches = block.branches;
    if (!branches.length) {
      return;
    }
    const pipeCount = this.countPipeSlots(
      ...branches.map((branch) => branch.expression)
    );
    const firstIndex = this.declIndex++;
    this.createControlFlowTemplate(branches[0].children, firstIndex, 'ifBlock');
    this.declIndex += pipeCount;
    for (let i = 1; i < branches.length; i++) {
      const index = this.declIndex++;
      this.createControlFlowTemplate(branches[i].children, index, 'ifBlock');
    }
  }
  visitIfBlockBranch(branch: TmplAstIfBlockBranch): void {
    // 分支由 visitIfBlock 统一处理，这里不单独占位
  }

  /**
   * `@switch` / `@case` / `@default`，槽位规则与 `@if` 一致，
   * 只是管道来自 `@switch` 主表达式和各 `@case` 表达式。
   *
   * Angular 21 重构了 `@switch` 的 AST：children 不再挂在 `@case` 上，而是把
   * 「共享同一份子节点的连续 case」合并成 `SwitchBlockCaseGroup`。
   * 一个 group 对应一份可渲染模板，所以占位按 group 走，
   * `@case` 只提供判断表达式。
   */
  visitSwitchBlock(block: TmplAstSwitchBlock): void {
    const groups = block.groups;
    if (!groups.length) {
      return;
    }
    const caseExpressions = groups.flatMap((group) =>
      group.cases.map((item) => item.expression)
    );
    const pipeCount = this.countPipeSlots(block.expression, ...caseExpressions);
    const firstIndex = this.declIndex++;
    this.createControlFlowTemplate(
      groups[0].children,
      firstIndex,
      'switchCase'
    );
    this.declIndex += pipeCount;
    for (let i = 1; i < groups.length; i++) {
      const index = this.declIndex++;
      this.createControlFlowTemplate(groups[i].children, index, 'switchCase');
    }
  }
  visitSwitchBlockCase(block: TmplAstSwitchBlockCase): void {
    // case 由 visitSwitchBlock 统一处理
  }
  visitSwitchBlockCaseGroup(group: TmplAstSwitchBlockCaseGroup): void {
    // group 由 visitSwitchBlock 统一处理
  }
  visitSwitchExhaustiveCheck(check: TmplAstSwitchExhaustiveCheck): void {
    // `@default` 的穷尽检查，不产生渲染节点
  }

  /**
   * `@for` / `@empty`（`ɵɵrepeaterCreate`）。
   *
   * ```text
   * i        : RepeaterMetadata 槽位（不是 TNode，不可渲染，但必须占位）
   * i+1      : 主模板锚点
   * i+2      : @empty 模板锚点（若有）
   * 之后      : 被遍历表达式里的管道
   * ```
   *
   * `track` 表达式 Angular 禁止使用管道，故不用考虑。
   */
  visitForLoopBlock(block: TmplAstForLoopBlock): void {
    const pipeCount = this.countPipeSlots(block.expression);
    // RepeaterMetadata 占位，不产生渲染节点
    this.declIndex++;
    const mainIndex = this.declIndex++;
    this.createControlFlowTemplate(block.children, mainIndex, 'forBlock');
    if (block.empty) {
      const emptyIndex = this.declIndex++;
      this.createControlFlowTemplate(
        block.empty.children,
        emptyIndex,
        'forEmpty'
      );
    }
    this.declIndex += pipeCount;
  }
  visitForLoopBlockEmpty(block: TmplAstForLoopBlockEmpty): void {
    // @empty 作为 @for 的属性被处理，不会作为兄弟节点出现
  }
  /**
   * `@defer` 依赖延迟加载与触发器调度，与小程序的静态模板机制对不上，
   * 目前不支持。静默渲染成空白比直接报错更难排查，所以这里显式抛错。
   */
  visitDeferredBlock(deferred: TmplAstDeferredBlock): void {
    throw new Error(
      '暂不支持 @defer 语法，请改用 @if 或组件自身的延迟加载能力'
    );
  }
  visitDeferredBlockError(block: TmplAstDeferredBlockError): void {
    this.visitDeferredBlock(null as unknown as TmplAstDeferredBlock);
  }
  visitDeferredBlockLoading(block: TmplAstDeferredBlockLoading): void {
    this.visitDeferredBlock(null as unknown as TmplAstDeferredBlock);
  }
  visitDeferredBlockPlaceholder(block: TmplAstDeferredBlockPlaceholder): void {
    this.visitDeferredBlock(null as unknown as TmplAstDeferredBlock);
  }
  visitDeferredTrigger(trigger: TmplAstDeferredTrigger): void {}
  /**
   * `@content`（Angular 22 新增）是内容查询块：它依赖 Angular 的 content query
   * 机制在运行时观察投影内容并重新渲染，小程序的 slot / self 模板是静态的，
   * 没有对应能力。同 `@defer` 一样显式抛错，避免静默渲染成空白。
   */
  visitContentBlock(block: TmplAstContentBlock): void {
    throw new Error('暂不支持 @content 语法');
  }
  visitUnknownBlock(block: TmplAstUnknownBlock): void {
    throw new Error(`无法识别的控制流块：@${block.name}`);
  }
  /** Angular 20 新增：模板 AST 中的组件 / 指令节点 */
  visitComponent(component: TmplAstComponent) {}
  visitDirective(directive: TmplAstDirective) {}

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
  /** Angular 21 新增：箭头函数 */
  visitArrowFunction(ast: ArrowFunction) {
    ast.body.visit(this);
  }
  /** Angular 21 新增：正则字面量（叶子节点） */
  visitRegularExpressionLiteral(ast: RegularExpressionLiteral) {}
  /** Angular 21 新增：展开元素 `...x` */
  visitSpreadElement(ast: SpreadElement) {
    ast.expression.visit(this);
  }
  /** Angular 21 新增：一元运算符 `-x` / `+x` */
  visitUnary(ast: Unary) {
    ast.expr.visit(this);
  }
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
