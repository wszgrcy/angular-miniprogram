import type {
  AST,
  ArrowFunction,
  AstVisitor,
  Binary,
  BindingPipe,
  Call,
  Chain,
  Conditional,
  EmptyExpr,
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
  ThisReceiver,
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
import { TmplAstText } from '@angular/compiler';

import * as t from '../../angular-internal/ast.type';
import { ParsedNgBoundText } from './bound-text';
import { ComponentContext } from './component-context';
import { ParsedNgContent } from './content';
import { ParsedNgElement } from './element';
import { NgNodeMeta, ParsedNode } from './interface';
import { ParsedNgTemplate } from './template';
import { ParsedNgText } from './text';
import { MatchedComponent, MatchedDirective } from './type';

/** 从原文切出元素的开始标签。i18n pass 会吃掉 i18n 属性，AST 上不留痕迹。 */
function startTagOf(
  element: t.Element,
  templateText?: string,
): string | undefined {
  if (!templateText || !element.startSourceSpan) {
    return undefined;
  }
  const span = element.startSourceSpan as unknown as {
    start: { offset: number };
    end: { offset: number };
  };
  return templateText.slice(span.start.offset, span.end.offset);
}

/**
 * 元素开始标签上的 `i18n-<attr>`，连同是否带插值。
 *
 * 带插值的会发 `ɵɵi18nAttributes` 并多占一个声明槽，译文落在 `property` 上；
 * 静态的不占槽，译文在建元素时 `setAttribute` 落在 `attribute` 上。
 */
function i18nAttributesOf(
  element: t.Element,
  templateText?: string,
): { name: string; dynamic: boolean }[] {
  const tag = startTagOf(element, templateText);
  if (tag === undefined) {
    return [];
  }
  const attr = /i18n-([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  const out: { name: string; dynamic: boolean }[] = [];
  for (let m = attr.exec(tag); m; m = attr.exec(tag)) {
    const value = m[2] ?? m[3] ?? '';
    out.push({ name: m[1], dynamic: value.includes('{{') });
  }
  return out;
}

/** 元素开始标签上是否带了裸 `i18n`（不是 `i18n-<attr>`）。 */
function hasBareI18n(element: t.Element, templateText?: string): boolean {
  const tag = startTagOf(element, templateText);
  return tag !== undefined && /(^|\s)i18n\s*=/.test(tag);
}

/** 子节点能否算作投影兜底内容：纯空白文本不算。 */
function hasProjectionFallback(children: t.Node[] | undefined): boolean {
  return (
    !!children?.length &&
    children.some(
      (child) => !(child instanceof TmplAstText) || !!child.value.trim().length,
    )
  );
}

/**
 * 遍历 Angular 模板 AST，产出 `ParsedNode` 节点树，并同步计算声明槽位（decl slot）。
 *
 * wxml 用 `nodeList[i]` 定位节点，`i` 必须与 Angular 编译产物的 `ɵɵelementStart(i, ...)`
 * 一致，因此槽位需要按 Angular 的规则自行推导。
 */
export class TemplateDefinition implements TmplAstRecursiveVisitor {
  private parentNode: ParsedNgElement | ParsedNgTemplate | undefined;
  list: ParsedNode<NgNodeMeta>[] = [];
  private declIndex = 0;

  /** 表达式里每出现一个管道就多占一个声明槽。 */
  astVisitor = new CustomAstVisitor(() => {
    this.declIndex++;
  });

  constructor(
    private nodes: t.Node[],
    private componentContext: ComponentContext,
    /** 当前视图在模板中的路径前缀，保证生成的模板名全局唯一。 */
    private namePrefix = '',
  ) {}

  /**
   * 普通元素。槽位：元素本身 1 个，`inputs` 里的管道另占，`#ref` 每个 1 个，
   * 子节点在同一视图里继续排。`outputs` 不允许管道，`attributes` 是纯字面量，
   * 都不需要访问。
   */
  visitElement(element: t.Element) {
    const nodeIndex = this.declIndex++;
    // 带插值的 i18n 属性整体只多占一个声明槽，紧跟本元素之后
    const i18nAttrs = i18nAttributesOf(
      element,
      this.componentContext?.templateText,
    );
    if (i18nAttrs.some((item) => item.dynamic)) {
      this.declIndex++;
    }
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
      directiveMeta,
      this.componentContext?.declaredWxsModules,
      i18nAttrs.filter((item) => !item.dynamic).map((item) => item.name),
      // 裸 `i18n` 会让子级静态文本变成运行时文本
      hasBareI18n(element, this.componentContext?.templateText),
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

  /**
   * `<ng-template>`，以及结构性指令（`*ngIf` / `*ngFor` 等）脱糖后的容器。
   *
   * 占槽：`#tpl` 引用、`inputs` 里的管道；`let-` 变量是子视图上下文变量，不占槽。
   * 子节点属于独立的 embedded view，有自己的索引空间，另起一个 `TemplateDefinition`。
   */
  visitTemplate(template: t.Template) {
    const nodeIndex = this.declIndex++;
    // 无引用名时用带路径前缀的默认名，保证全局唯一
    const templateName =
      template.references && template.references.length
        ? undefined
        : `ngDefault_${this.namePrefix}${nodeIndex}`;
    const templateInstance = new ParsedNgTemplate(
      template,
      this.parentNode,
      nodeIndex,
      templateName,
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
      `${this.namePrefix}${nodeIndex}_`,
    );
    instance.parentNode = templateInstance;

    instance.run();
    if (!this.parentNode) {
      this.list.push(templateInstance);
    }
  }

  /**
   * `<ng-content>` 内容投影。
   *
   * 有兜底内容时占两个槽：兜底视图紧贴在投影节点后面，自己有一套从 0 开始的索引空间。
   * 小程序的 `<slot>` 没有兜底能力，wxml 侧靠「兜底容器有没有视图」二选一。
   */
  visitContent(content: t.Content) {
    const nodeIndex = this.declIndex++;
    const instance = new ParsedNgContent(content, this.parentNode, nodeIndex);
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(instance);
    } else {
      this.list.push(instance);
    }
    if (!hasProjectionFallback(content.children)) {
      return;
    }
    const fallbackIndex = this.declIndex++;
    const fallback = new ParsedNgTemplate(
      null,
      instance,
      fallbackIndex,
      `projectionFallback_${this.namePrefix}${fallbackIndex}`,
    );
    instance.fallback = fallback;
    const fallbackView = new TemplateDefinition(
      content.children,
      this.componentContext,
      `${this.namePrefix}${fallbackIndex}_`,
    );
    fallbackView.parentNode = fallback;
    fallbackView.run();
  }

  /** `let-` 声明属于子视图上下文，不占声明槽。 */
  visitVariable(variable: t.Variable) {}

  /**
   * 统计若干表达式中管道占用的声明槽位。
   * 控制流的条件表达式编译后落在宿主视图的 `ɵɵpipe` 上，必须跟着一起算。
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
   * 为控制流分支建立一个模板节点。分支内容是独立的 embedded view，有自己的声明索引空间，
   * 不影响当前视图的 `declIndex`。
   */
  private createControlFlowTemplate(
    children: TmplAstNode[],
    index: number,
    kind: string,
  ) {
    const name = `${kind}_${this.namePrefix}${index}`;
    const templateInstance = new ParsedNgTemplate(
      null,
      this.parentNode,
      index,
      name,
    );
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(templateInstance);
    }
    const instance = new TemplateDefinition(
      children,
      this.componentContext,
      `${this.namePrefix}${index}_`,
    );
    instance.parentNode = templateInstance;
    instance.run();
    if (!this.parentNode) {
      this.list.push(templateInstance);
    }
  }

  /**
   * `@if` / `@else if` / `@else` 的槽位分配：
   *
   * ```text
   * i        : 第一个分支的模板锚点
   * i+1..P   : 所有分支条件表达式里的管道
   * i+P+1..  : 其余分支的模板锚点
   * ```
   *
   * `@if (cond; as alias)` 的 `alias` 是分支视图的上下文变量，不占槽。
   */
  visitIfBlock(block: TmplAstIfBlock): void {
    const branches = block.branches;
    if (!branches.length) {
      return;
    }
    const pipeCount = this.countPipeSlots(
      ...branches.map((branch) => branch.expression),
    );
    const firstIndex = this.declIndex++;
    this.createControlFlowTemplate(branches[0].children, firstIndex, 'ifBlock');
    this.declIndex += pipeCount;
    for (let i = 1; i < branches.length; i++) {
      const index = this.declIndex++;
      this.createControlFlowTemplate(branches[i].children, index, 'ifBlock');
    }
  }

  /** `@if` 的单个分支，槽位由 `visitIfBlock` 统一排。 */
  visitIfBlockBranch(branch: TmplAstIfBlockBranch): void {}

  /**
   * `@switch` / `@case` / `@default`，槽位规则与 `@if` 一致，管道来自 `@switch` 主表达式和各 `@case` 表达式。
   * 共享同一份子节点的连续 `@case` 合并成一个 group，一个 group 一份模板，占位按 group 走。
   */
  visitSwitchBlock(block: TmplAstSwitchBlock): void {
    const groups = block.groups;
    if (!groups.length) {
      return;
    }
    const caseExpressions = groups.flatMap((group) =>
      group.cases.map((item) => item.expression),
    );
    const pipeCount = this.countPipeSlots(block.expression, ...caseExpressions);
    const firstIndex = this.declIndex++;
    this.createControlFlowTemplate(
      groups[0].children,
      firstIndex,
      'switchCase',
    );
    this.declIndex += pipeCount;
    for (let i = 1; i < groups.length; i++) {
      const index = this.declIndex++;
      this.createControlFlowTemplate(groups[i].children, index, 'switchCase');
    }
  }

  /** `@case (expr)` 只提供判断表达式，本身不产生渲染节点。 */
  visitSwitchBlockCase(block: TmplAstSwitchBlockCase): void {}

  /** 一组共享同一份子节点的连续 `@case`，模板由 `visitSwitchBlock` 建立。 */
  visitSwitchBlockCaseGroup(group: TmplAstSwitchBlockCaseGroup): void {}

  /** `@default` 的穷尽性检查，纯编译期产物，不占槽。 */
  visitSwitchExhaustiveCheck(check: TmplAstSwitchExhaustiveCheck): void {}

  /**
   * `@for` / `@empty`。
   *
   * ```text
   * i        : RepeaterMetadata 槽位（不可渲染，但必须占位）
   * i+1      : 主模板锚点
   * i+2      : @empty 模板锚点（若有）
   * 之后      : 被遍历表达式里的管道
   * ```
   *
   * `track` 禁止使用管道；`item` 等上下文变量走 `contextVariables`，不占槽。
   */
  visitForLoopBlock(block: TmplAstForLoopBlock): void {
    const pipeCount = this.countPipeSlots(block.expression);
    this.declIndex++; // RepeaterMetadata
    const mainIndex = this.declIndex++;
    this.createControlFlowTemplate(block.children, mainIndex, 'forBlock');
    if (block.empty) {
      const emptyIndex = this.declIndex++;
      this.createControlFlowTemplate(
        block.empty.children,
        emptyIndex,
        'forEmpty',
      );
    }
    this.declIndex += pipeCount;
  }

  /** `@empty` 作为 `@for` 的属性处理，不会单独出现，所以不占位。 */
  visitForLoopBlockEmpty(block: TmplAstForLoopBlockEmpty): void {}

  /**
   * `@defer` 依赖运行时异步 chunk 加载，与小程序的静态模板机制对不上，不支持。
   * 静默渲染成空白比报错更难排查，所以显式抛错。
   */
  visitDeferredBlock(deferred: TmplAstDeferredBlock): void {
    throw new Error(
      '暂不支持 @defer 语法，请改用 @if 或组件自身的延迟加载能力',
    );
  }

  /** `@defer` 的 `@error` 子块，随 `@defer` 一起不支持。 */
  visitDeferredBlockError(block: TmplAstDeferredBlockError): void {
    this.visitDeferredBlock(null as unknown as TmplAstDeferredBlock);
  }

  /** `@defer` 的 `@loading` 子块，随 `@defer` 一起不支持。 */
  visitDeferredBlockLoading(block: TmplAstDeferredBlockLoading): void {
    this.visitDeferredBlock(null as unknown as TmplAstDeferredBlock);
  }

  /** `@defer` 的 `@placeholder` 子块，随 `@defer` 一起不支持。 */
  visitDeferredBlockPlaceholder(block: TmplAstDeferredBlockPlaceholder): void {
    this.visitDeferredBlock(null as unknown as TmplAstDeferredBlock);
  }

  /** 触发器只在 `@defer` 内部出现，那条路已经抛错了。 */
  visitDeferredTrigger(trigger: TmplAstDeferredTrigger): void {}

  /** `@content` 内容查询块依赖运行时重渲染，小程序的静态 slot 没有对应能力，不支持。 */
  visitContentBlock(block: TmplAstContentBlock): void {
    throw new Error('暂不支持 @content 语法');
  }

  /** 无法识别的控制流块（`@foo { ... }`），显式报错好过静默丢弃。 */
  visitUnknownBlock(block: TmplAstUnknownBlock): void {
    throw new Error(`无法识别的控制流块：@${block.name}`);
  }

  /** `parseTemplate` 路径不会产出组件/指令节点，出现即上游 AST 来源变了，抛错把回归暴露出来。 */
  visitComponent(component: TmplAstComponent): void {
    throw new Error(
      `不该出现的 Component AST 节点：${component.componentName}（本 fork 的模板解析路径不产出此节点）`,
    );
  }

  /** 同 `visitComponent`。 */
  visitDirective(directive: TmplAstDirective): void {
    throw new Error(
      `不该出现的 Directive AST 节点：${directive.name}（本 fork 的模板解析路径不产出此节点）`,
    );
  }

  /** `@let` 模板变量编译成视图内常量，不产生渲染节点、不占声明槽。 */
  visitLetDeclaration(declaration: TmplAstLetDeclaration) {}

  /** `#ref` 的槽位由父节点的 `prepareRefsArray` 统一计入，这里不重复占位。 */
  visitReference(reference: t.Reference) {}

  /** 字面量属性 `id="a"`：纯字符串，没有表达式 AST，不占槽。 */
  visitTextAttribute(attribute: t.TextAttribute) {}

  /** 属性绑定 `[title]="v | number"`：表达式里的管道已在 `visitElement` / `visitTemplate` 计入。 */
  visitBoundAttribute(attribute: t.BoundAttribute) {}

  /** 事件绑定 `(click)="go()"`：action 表达式禁止带管道，没有槽位要算。 */
  visitBoundEvent(attribute: t.BoundEvent) {}

  /** 静态文本节点，占 1 个槽。 */
  visitText(text: t.Text) {
    const nodeIndex = this.declIndex++;
    const instance = new ParsedNgText(
      text,
      this.parentNode,
      nodeIndex,
      // 宿主带 `i18n` 时，这段文本在运行时由 `$localize` 查出，不能烘进 wxml
      this.parentNode instanceof ParsedNgElement && this.parentNode.i18nHost,
    );
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(instance);
    } else {
      this.list.push(instance);
    }
  }

  /** 插值绑定 `{{a | number}}`：先算表达式里的管道（排在插值节点之后），再建插值节点。 */
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

  /**
   * ICU 消息（复数 / 性别选择），如 `{count, plural, =1 {one item} other {…}}`。
   *
   * 编译成 `ɵɵi18n(i, msgIdx)`，只占一个声明槽，记账与 `{{a}}` 的文本节点相同。
   * 文案由序列化层从 lView 的 expando 上收回（`readI18nText`）。
   */
  visitIcu(icu: t.Icu) {
    const nodeIndex = this.declIndex++;
    const instance = new ParsedNgBoundText(
      icu as unknown as t.BoundText,
      this.parentNode,
      nodeIndex,
    );
    // ICU 表达式里的管道各占一个槽：判断变量在 `vars`，分支里的插值在 `placeholders`
    // `placeholders` 不在 `t.Icu` 的公开类型里，只能按形状取
    const asVariables = (value: unknown): unknown[] =>
      Array.isArray(value) ? value : Object.values((value ?? {}) as object);
    const expressions: { visit(v: unknown): void }[] = [];
    for (const variable of [
      ...asVariables(icu.vars),
      ...asVariables(
        (icu as unknown as { placeholders?: unknown }).placeholders,
      ),
    ]) {
      const value = (variable as { value?: { visit(v: unknown): void } })
        ?.value;
      if (value) {
        expressions.push(value);
      }
    }
    expressions.forEach((expression) => expression.visit(this.astVisitor));
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(instance);
    } else {
      this.list.push(instance);
    }
  }

  run() {
    visitAll(this, this.nodes);
    return this.list;
  }

  /** `#ref` 声明占槽，每个引用占一个。 */
  prepareRefsArray(refs: t.Reference[]) {
    if (!refs || !refs.length) {
      return;
    }
    refs.forEach((item) => {
      this.declIndex++;
    });
  }
}

/** 遍历一组模板节点。这里直接调 `node.visit(visitor)`，不走 `visitor.visit` 拦截。 */
export function visitAll(
  visitor: TemplateDefinition,
  nodes: TmplAstNode[],
): void {
  for (const node of nodes) {
    node.visit(visitor);
  }
}

/**
 * 表达式侧访问器，只统计表达式里管道的个数。每个 `| pipe` 会在当前视图编译成
 * 一条 `ɵɵpipe(...)`，占一个声明索引。
 *
 * @internal 导出仅为测试可见，不属于公开 API。
 */
export class CustomAstVisitor implements AstVisitor {
  constructor(private pipeCallback: () => void) {}

  visitUnary(ast: Unary) {
    this.visit(ast.expr);
  }

  visitBinary(ast: Binary) {
    this.visit(ast.left);
    this.visit(ast.right);
  }

  visitChain(ast: Chain) {
    this.visitAll(ast.expressions);
  }

  visitConditional(ast: Conditional) {
    this.visit(ast.condition);
    this.visit(ast.trueExp);
    this.visit(ast.falseExp);
  }

  /** 接收者和参数都可能是嵌套管道，两个子树都得走，否则少算槽位。 */
  visitPipe(ast: BindingPipe) {
    this.pipeCallback();
    this.visit(ast.exp);
    this.visitAll(ast.args);
  }

  visitImplicitReceiver(ast: ImplicitReceiver) {}

  /** `ThisReceiver.visit()` 走的是可选调用，方法缺失时静默跳过整棵子树，所以必须显式实现。 */
  visitThisReceiver(ast: ThisReceiver) {}

  visitInterpolation(ast: Interpolation) {
    this.visitAll(ast.expressions);
  }

  visitKeyedRead(ast: KeyedRead) {
    this.visit(ast.receiver);
    this.visit(ast.key);
  }

  visitLiteralArray(ast: LiteralArray) {
    this.visitAll(ast.expressions);
  }

  /** 只走 value，key 是字符串标识不是表达式。 */
  visitLiteralMap(ast: LiteralMap) {
    this.visitAll(ast.values);
  }

  visitLiteralPrimitive(ast: LiteralPrimitive) {}

  visitPrefixNot(ast: PrefixNot) {
    this.visit(ast.expression);
  }

  visitTypeofExpression(ast: TypeofExpression) {
    this.visit(ast.expression);
  }

  visitVoidExpression(ast: TypeofExpression) {
    this.visit(ast.expression);
  }

  visitNonNullAssert(ast: NonNullAssert) {
    this.visit(ast.expression);
  }

  visitPropertyRead(ast: PropertyRead) {
    this.visit(ast.receiver);
  }

  visitSafePropertyRead(ast: SafePropertyRead) {
    this.visit(ast.receiver);
  }

  visitSafeKeyedRead(ast: SafeKeyedRead) {
    this.visit(ast.receiver);
    this.visit(ast.key);
  }

  visitCall(ast: Call) {
    this.visit(ast.receiver);
    this.visitAll(ast.args);
  }

  visitSafeCall(ast: SafeCall) {
    this.visit(ast.receiver);
    this.visitAll(ast.args);
  }

  /** elements 比 expressions 多一个，按声明顺序交替访问。 */
  visitTemplateLiteral(ast: TemplateLiteral) {
    for (let i = 0; i < ast.elements.length; i++) {
      this.visit(ast.elements[i]);

      const expression = i < ast.expressions.length ? ast.expressions[i] : null;
      if (expression !== null) {
        this.visit(expression);
      }
    }
  }

  visitTemplateLiteralElement(ast: TemplateLiteralElement) {}

  /** 先走 tag，再把整个 template 节点交回 `visitTemplateLiteral`。 */
  visitTaggedTemplateLiteral(ast: TaggedTemplateLiteral) {
    this.visit(ast.tag);
    this.visit(ast.template);
  }

  visitParenthesizedExpression(ast: ParenthesizedExpression) {
    this.visit(ast.expression);
  }

  /** 只走 body，参数列表是标识符声明不是求值表达式。 */
  visitArrowFunction(ast: ArrowFunction) {
    this.visit(ast.body);
  }

  visitRegularExpressionLiteral(ast: RegularExpressionLiteral) {}

  visitSpreadElement(ast: SpreadElement) {
    this.visit(ast.expression);
  }

  /** 缺方法会让子树遍历在此中断，所以必须显式实现。 */
  visitEmptyExpr(ast: EmptyExpr) {}

  /** 把节点重新派发回它自己的 `visit`，内部所有递归都走这里。 */
  visit(ast: AST) {
    ast.visit(this);
  }

  visitAll(asts: AST[]) {
    for (let i = 0; i < asts.length; ++i) {
      this.visit(asts[i]);
    }
  }
}
