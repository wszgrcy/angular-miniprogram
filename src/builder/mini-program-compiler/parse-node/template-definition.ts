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

import * as t from '../../angular-internal/ast.type';
import { ParsedNgBoundText } from './bound-text';
import { ComponentContext } from './component-context';
import { ParsedNgContent } from './content';
import { ParsedNgElement } from './element';
import { NgNodeMeta, ParsedNode } from './interface';
import { ParsedNgTemplate } from './template';
import { ParsedNgText } from './text';
import { MatchedComponent, MatchedDirective } from './type';

/**
 * 把 Angular 的模板 AST 走一遍，产出本 fork 自己的节点树（`ParsedNode`），
 * 同时**精确模拟 Angular 的声明槽位（decl slot）分配**。
 *
 * 为什么要自己算槽位：wxml 里每个节点靠 `nodeList[i]` 定位，这个 `i`
 * 必须和 Angular 编译产物里的 `ɵɵelementStart(i, ...)` 完全一致。我们不在
 * Angular 的编译管线内，只能照着它的规则自己推。少算一个槽位，后面所有
 * 节点整体错位一位 —— 渲染错乱但**不抛错**，是最难查的一类 bug。
 *
 * 结构对齐两份参照实现：
 *   - 模板侧：`RecursiveVisitor`
 *     （packages/compiler/src/render3/r3_ast.ts）
 *   - 表达式侧：`RecursiveAstVisitor`
 *     （packages/compiler/src/expression_parser/ast.ts）
 *
 * 方法顺序刻意照抄 Angular，升级时可以直接 diff 出「Angular 新增了哪种
 * 节点」，避免漏掉。
 */
export class TemplateDefinition implements TmplAstRecursiveVisitor {
  private parentNode: ParsedNgElement | ParsedNgTemplate | undefined;
  list: ParsedNode<NgNodeMeta>[] = [];
  private declIndex = 0;

  /**
   * 表达式访问器：表达式里每出现一个管道就多占一个声明槽，
   * 所以回调里直接把 `declIndex` 顶上去。
   *
   * ```html
   * <div>{{title | uppercase}}</div>
   *        └─ ①div ②pipe，div 的兄弟节点要从 3 开始
   * ```
   */
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

  /**
   * 普通元素。
   *
   * ```html
   * <div id="a" [title]="v | number" (click)="go()">
   *   <span>child</span>
   * </div>
   * ```
   *
   * 槽位：元素本身 1 个；`inputs` 里的管道另占（见 `astVisitor`）；
   * `references`（`#ref`）每个 1 个；子节点在**同一视图**里继续排。
   *
   * 不访问 `outputs`：Angular 语法层面就禁止事件表达式带管道
   * （`(click)="a|b"` 直接报 "Cannot have a pipe in an action
   * expression"），所以没有槽位要算。
   *
   * 不访问 `attributes`：`TextAttribute` 是纯字面量，没有表达式 AST。
   */
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

  /**
   * `<ng-template>`，以及结构性指令（`*ngIf` / `*ngFor` 等）脱糖后的容器。
   *
   * ```html
   * <ng-template #tpl let-row="item" let-i="index">
   *   <p>{{row}}</p>
   * </ng-template>
   * ```
   *
   * 槽位规则（对照 `local_refs.ts` 的
   * `op.numSlotsUsed += op.localRefs.length`）：
   *
   * - `#tpl`（`references`）→ **占槽**，走 `prepareRefsArray`
   * - `let-row` / `let-i`（`variables`）→ **不占槽**。它们在
   *   `ingest.ts` 里进的是 `childView.contextVariables`，是子视图的
   *   上下文变量，不是父视图的声明槽
   * - `inputs` 里的管道 → 占槽，走 `astVisitor`
   *
   * 子节点是独立的 embedded view，有自己的 0 起始索引空间，
   * 所以另起一个 `TemplateDefinition` 去走。
   */
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

    instance.run();
    if (!this.parentNode) {
      this.list.push(templateInstance);
    }
  }

  /**
   * `<ng-content>` 内容投影。
   *
   * ```html
   * <ng-content select=".header"></ng-content>   ← 支持，children 为空
   * <ng-content>默认内容</ng-content>            ← 不支持，显式抛错
   * ```
   *
   * 实测：空标签和纯空白都会被 Angular 归一成 `children = []`，
   * 只有写了 fallback 才有子节点。小程序的 `<slot>` 没有 fallback
   * 能力，所以这里对非空 children 显式抛错 —— 静默丢掉 fallback
   * 会让「投影不到东西」这种问题极难定位。
   */
  visitContent(content: t.Content) {
    if (content.children && content.children.length) {
      throw new Error(
        '暂不支持 <ng-content> 的 fallback 内容（小程序 slot 无对应能力），' +
          '请把兜底逻辑放到宿主组件里处理'
      );
    }
    const nodeIndex = this.declIndex++;
    const instance = new ParsedNgContent(content, this.parentNode, nodeIndex);
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(instance);
    } else {
      this.list.push(instance);
    }
  }

  /**
   * `<ng-template let-foo="bar">` 里的 `let-` 声明。
   *
   * 不占声明槽：`ingest.ts` 把它塞进 `childView.contextVariables`，
   * 属于子视图上下文而非父视图声明。这里保留空实现只为访问器完整。
   */
  visitVariable(variable: t.Variable) {}

  /**
   * 统计若干表达式中管道占用的声明槽位。
   *
   * 内建控制流的条件表达式在 Angular 里会被编译成宿主视图的 `ɵɵpipe`，
   * 每个管道占一个声明索引，必须跟着一起算，否则后面的节点全错位。
   *
   * ```html
   * @switch (v | number) { @case (1) {a} @default {b} }
   *           └── 这个管道落在 @switch 的宿主视图，不是分支视图
   * ```
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
   *
   * 分支内容是一个独立的 embedded view，拥有自己的声明索引空间，
   * 所以这里用新的 `TemplateDefinition` 访问子节点，
   * 不影响当前视图的 `declIndex`。
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
   *
   * `@if (cond; as alias)` 的 `alias` **不占槽**：`ingest.ts` 里走的是
   * `cView.contextVariables.set(name, CTX_REF)`，是分支视图的上下文变量。
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

  /**
   * `@if` 的单个分支。
   *
   * 分支的槽位（含 `expressionAlias`）由 `visitIfBlock` 统一按
   * 「锚点 + 管道」的规则排，这里不单独占位。
   */
  visitIfBlockBranch(branch: TmplAstIfBlockBranch): void {
    // 分支由 visitIfBlock 统一处理，这里不单独占位
  }

  /**
   * `@switch` / `@case` / `@default`，槽位规则与 `@if` 一致，
   * 只是管道来自 `@switch` 主表达式和各 `@case` 表达式。
   *
   * ```html
   * @switch (v | number) {
   *   @case (1) {<a></a>}
   *   @case (2) {<b></b>}
   *   @default  {<c></c>}
   * }
   * ```
   *
   * Angular 21 重构了 `@switch` 的 AST：children 不再挂在 `@case` 上，
   * 而是把「共享同一份子节点的连续 case」合并成 `SwitchBlockCaseGroup`。
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

  /**
   * `@case (expr)`。只提供判断表达式（其管道已由 `visitSwitchBlock`
   * 统一计入宿主视图），本身不产生渲染节点。
   */
  visitSwitchBlockCase(block: TmplAstSwitchBlockCase): void {
    // case 由 visitSwitchBlock 统一处理
  }

  /**
   * 一组共享同一份子节点的连续 `@case`。
   * 对应的模板由 `visitSwitchBlock` 按 group 建立，这里不重复处理。
   */
  visitSwitchBlockCaseGroup(group: TmplAstSwitchBlockCaseGroup): void {
    // group 由 visitSwitchBlock 统一处理
  }

  /**
   * `@default` 的穷尽性检查（`@switch ... @default` 的类型收窄标记）。
   * 纯编译期产物，不产生渲染节点、不占槽。
   */
  visitSwitchExhaustiveCheck(check: TmplAstSwitchExhaustiveCheck): void {
    // `@default` 的穷尽检查，不产生渲染节点
  }

  /**
   * `@for` / `@empty`（`ɵɵrepeaterCreate`）。
   *
   * ```html
   * @for (item of items | async; track item.id) {
   *   <p>{{item}}</p>
   * } @empty {
   *   <span>none</span>
   * }
   * ```
   *
   * ```text
   * i        : RepeaterMetadata 槽位（不是 TNode，不可渲染，但必须占位）
   * i+1      : 主模板锚点
   * i+2      : @empty 模板锚点（若有）
   * 之后      : 被遍历表达式里的管道（上例的 `async`）
   * ```
   *
   * `track` 表达式 Angular 禁止使用管道，故不用考虑。
   * `item` / `let-` 上下文变量走 `contextVariables`，不占槽。
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

  /**
   * `@empty` 块。它作为 `@for` 的 `empty` 属性被 `visitForLoopBlock`
   * 处理，不会作为兄弟节点单独出现，所以这里不占位。
   */
  visitForLoopBlockEmpty(block: TmplAstForLoopBlockEmpty): void {
    // @empty 作为 @for 的属性被处理，不会作为兄弟节点出现
  }

  /**
   * `@defer` 延迟加载块。
   *
   * 依赖运行时的依赖图调度与异步 chunk 加载，与小程序的静态模板机制
   * 对不上，目前不支持。静默渲染成空白比直接报错更难排查，所以显式抛错。
   *
   * ```html
   * @defer (on viewport) { <heavy-cmp></heavy-cmp> }
   * @placeholder { <div>loading…</div> }
   * ```
   */
  visitDeferredBlock(deferred: TmplAstDeferredBlock): void {
    throw new Error(
      '暂不支持 @defer 语法，请改用 @if 或组件自身的延迟加载能力'
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

  /**
   * `@defer` 的触发器（`on viewport` / `on idle` / `on timer(...)` 等）。
   * 随 `@defer` 一起不支持；这里留空是因为触发器只有在 `@defer` 内部
   * 才会出现，而那条路已经在 `visitDeferredBlock` 抛错了。
   */
  visitDeferredTrigger(trigger: TmplAstDeferredTrigger): void {}

  /**
   * `@content` 内容查询块（Angular 22 新增）。
   *
   * ```html
   * @content { @case (foo) { <p>has foo</p> } }
   * ```
   *
   * 依赖 Angular 的 content query 在运行时观察投影内容并**重新渲染**，
   * 小程序的 slot / self 模板是静态的，没有对应能力。
   * 同 `@defer` 一样显式抛错，避免静默渲染成空白。
   */
  visitContentBlock(block: TmplAstContentBlock): void {
    throw new Error('暂不支持 @content 语法');
  }

  /**
   * 无法识别的控制流块（`@foo { ... }`）。
   * 通常是比当前 fork 支持范围更新的语法，显式报错好过静默丢弃。
   */
  visitUnknownBlock(block: TmplAstUnknownBlock): void {
    throw new Error(`无法识别的控制流块：@${block.name}`);
  }

  /**
   * 组件节点。
   *
   * 注意：本 fork 走的 `parseTemplate` 路径**不会产出这个节点** ——
   * 实测普通标签、selectorless 模式下都只出 `Element`。
   * `Component` / `Directive` 这类节点来自旧的 `r3_template_transform`
   * 与类型检查路径。
   *
   * 之所以抛错而不是留空：留空意味着「万一哪天真的出现了，节点会被
   * 静默丢掉」，槽位随之错位且不报错。抛错能把这种回归立刻暴露出来。
   */
  visitComponent(component: TmplAstComponent): void {
    throw new Error(
      `不该出现的 Component AST 节点：${component.componentName}（本 fork 的模板解析路径不产出此节点）`
    );
  }

  /**
   * 指令节点。同 `visitComponent`，正常解析路径不会产出，
   * 出现即说明上游 AST 来源变了，抛错暴露。
   */
  visitDirective(directive: TmplAstDirective): void {
    throw new Error(
      `不该出现的 Directive AST 节点：${directive.name}（本 fork 的模板解析路径不产出此节点）`
    );
  }

  /**
   * `@let` 模板变量声明（Angular 18 新增）。
   *
   * ```html
   * @let total = items.length | number;
   * <p>{{total}}</p>
   * ```
   *
   * 编译成视图内的常量 / 上下文变量，**不产生渲染节点、不占声明槽**，
   * 所以这里是不占位的空实现（不是漏实现）。
   */
  visitLetDeclaration(declaration: TmplAstLetDeclaration) {}

  /**
   * `#ref` 模板引用。
   *
   * ```html
   * <input #email />
   * ```
   *
   * 槽位由父节点的 `prepareRefsArray` 统一计入（`local_refs.ts` 的
   * `op.numSlotsUsed += op.localRefs.length`），所以这里不重复占位。
   */
  visitReference(reference: t.Reference) {}

  /**
   * 字面量属性 `id="a"`。纯字符串，没有表达式 AST，不占槽。
   */
  visitTextAttribute(attribute: t.TextAttribute) {}

  /**
   * 属性绑定 `[title]="v | number"`。
   *
   * 其表达式里的管道在 `visitElement` / `visitTemplate` 里已经通过
   * `item.value.visit(this.astVisitor)` 计入，这里不重复处理。
   */
  visitBoundAttribute(attribute: t.BoundAttribute) {}

  /**
   * 事件绑定 `(click)="go()"`。
   *
   * Angular 语法禁止 action 表达式带管道
   * （`(click)="a|b"` → "Cannot have a pipe in an action expression"），
   * 所以没有槽位要算。
   */
  visitBoundEvent(attribute: t.BoundEvent) {}

  /**
   * 静态文本节点。
   *
   * ```html
   * <div>hello</div>
   *        └─ 占 1 个槽
   * ```
   */
  visitText(text: t.Text) {
    const nodeIndex = this.declIndex++;
    const instance = new ParsedNgText(text, this.parentNode, nodeIndex);
    if (this.parentNode) {
      this.parentNode.appendNgNodeChild(instance);
    } else {
      this.list.push(instance);
    }
  }

  /**
   * 插值绑定 `{{a | number}}`。
   *
   * 先算表达式里的管道（每个占一个槽，且**排在插值节点之后**），
   * 再建插值节点本身。
   */
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
   * ICU 消息（复数 / 性别选择）。
   *
   * ```html
   * {count, plural, =1 {one item} other {{{count}} items}}
   * ```
   *
   * Angular 会编译成 `ɵɵpipe` + `I18nSelect` 并动态切换子模板，
   * 小程序没有对应的运行时能力。
   *
   * 这里必须抛错：实测该节点会真实出现在解析结果里
   * （`Element, Icu`），留空等于**静默丢掉整段内容**，
   * 且后续所有节点槽位错位。
   */
  visitIcu(icu: t.Icu) {
    throw new Error(
      '暂不支持 ICU 消息语法（{x, plural, ...} / {x, select, ...}），' +
        '请改用组件内的普通条件渲染'
    );
  }

  run() {
    visitAll(this, this.nodes);
    return this.list;
  }

  /**
   * `#ref` 声明占槽。
   *
   * ```html
   * <div #a #b></div>   ← 多占 2 个槽
   * ```
   *
   * 对应 `local_refs.ts`：`op.numSlotsUsed += op.localRefs.length`。
   */
  prepareRefsArray(refs: t.Reference[]) {
    if (!refs || !refs.length) {
      return;
    }
    refs.forEach((item) => {
      this.declIndex++;
    });
  }
}

/**
 * 遍历一组模板节点。
 *
 * 注意这里直接调 `node.visit(visitor)`，**不走** `visitor.visit`。
 * Angular 自己的 `visitAll` 是「若 `visitor.visit` 存在则用它拦截」，
 * 本 fork 不需要那层拦截，所以 `TemplateDefinition` 不实现 `visit()`
 * —— 一旦实现了，语义会和这里不一致，反而埋坑。
 */
export function visitAll(
  visitor: TemplateDefinition,
  nodes: TmplAstNode[]
): void {
  for (const node of nodes) {
    node.visit(visitor);
  }
}

/**
 * 表达式侧访问器：**只关心「这条表达式里有几个管道」**。
 *
 * 结构、方法顺序完全对齐 `@angular/compiler` 的 `RecursiveAstVisitor`
 * （packages/compiler/src/expression_parser/ast.ts），这样升级 Angular 时
 * 可以直接 diff 出「新增了哪种 AST 节点 / 某个节点的子节点变了」。
 *
 * 为什么只数管道：Angular 里每个 `| pipe` 会在**当前视图**编译成一条
 * `ɵɵpipe(...)`，占一个声明索引。本 fork 需要在没有 Angular 编译管线的
 * 情况下预知每个节点的槽位，所以必须自己算准。
 * 漏数一个 → 后面所有节点整体错位 → 渲染错乱但不报错。
 *
 * @internal 导出仅为测试可见，不属于公开 API。
 */
export class CustomAstVisitor implements AstVisitor {
  constructor(private pipeCallback: () => void) {}

  /**
   * 一元运算符。
   *
   * ```html
   * {{ -count }}   {{ +a }}   {{ !flag }}（! 走 PrefixNot）
   * ```
   */
  visitUnary(ast: Unary) {
    this.visit(ast.expr);
  }

  /**
   * 二元运算。两侧都可能是带管道的子表达式。
   *
   * ```html
   * {{ (a | number) + (b | number) }}   → 2 个管道
   * {{ a ?? b }}   {{ x && y }}   {{ s % 2 }}
   * ```
   */
  visitBinary(ast: Binary) {
    this.visit(ast.left);
    this.visit(ast.right);
  }

  /**
   * 分号分隔的多表达式。
   *
   * ```html
   * {{ exprA; exprB }}
   * ```
   */
  visitChain(ast: Chain) {
    this.visitAll(ast.expressions);
  }

  /**
   * 三元条件。三个分支都要走。
   *
   * ```html
   * {{ ok ? (a | number) : (b | number) }}   → 2 个管道
   * ```
   */
  visitConditional(ast: Conditional) {
    this.visit(ast.condition);
    this.visit(ast.trueExp);
    this.visit(ast.falseExp);
  }

  /**
   * 管道 —— 本访问器唯一真正关心的节点。
   *
   * ```html
   * {{ title | uppercase }}            → 1 个
   * {{ a | date:(b | number) }}       → 2 个（参数里还能再嵌管道）
   * ```
   *
   * **必须继续访问 `args`**：管道参数本身可以是另一条带管道的表达式，
   * 漏掉 args 就会少算槽位。
   */
  visitPipe(ast: BindingPipe) {
    this.pipeCallback();
    this.visitAll(ast.args);
  }

  /**
   * 隐式接收者 —— 模板里「当前上下文对象」的抽象，没有具体源码。
   *
   * ```html
   * {{ name }}        ← name 挂在隐式接收者上
   * ```
   *
   * 叶子节点，无子节点。
   */
  visitImplicitReceiver(ast: ImplicitReceiver) {}

  /**
   * `this` 接收者。
   *
   * ```html
   * {{ this.user.name }}
   * ```
   *
   * 叶子节点。必须显式实现：`ThisReceiver.visit()` 走的是
   * `visitor.visitThisReceiver?.(...)` 的**可选调用**，方法不存在时
   * 返回 `undefined` 而**不报错**，等于静默跳过整棵子树。
   */
  visitThisReceiver(ast: ThisReceiver) {}

  /**
   * 插值 `{{ }}`。
   *
   * ```html
   * {{ a | number }} / {{ x }}-{{ y }}
   * ```
   */
  visitInterpolation(ast: Interpolation) {
    this.visitAll(ast.expressions);
  }

  /**
   * 下标读取 `a[0]` / `map[key]`。key 也可能是带管道的表达式。
   *
   * ```html
   * {{ list[i | number] }}   → 1 个
   * ```
   */
  visitKeyedRead(ast: KeyedRead) {
    this.visit(ast.receiver);
    this.visit(ast.key);
  }

  /**
   * 数组字面量。
   *
   * ```html
   * {{ [a | number, b] }}   → 1 个
   * ```
   */
  visitLiteralArray(ast: LiteralArray) {
    this.visitAll(ast.expressions);
  }

  /**
   * 对象字面量。只走 value，key 是字符串标识不是表达式。
   *
   * ```html
   * {{ {a: x | number} }}   → 1 个
   * ```
   */
  visitLiteralMap(ast: LiteralMap) {
    this.visitAll(ast.values);
  }

  /**
   * 原始字面量：`1` / `'str'` / `true` / `null`。叶子节点。
   */
  visitLiteralPrimitive(ast: LiteralPrimitive) {}

  /**
   * 逻辑非 `!flag`。
   *
   * ```html
   * {{ !a }}   {{ !(x | number) }}
   * ```
   */
  visitPrefixNot(ast: PrefixNot) {
    this.visit(ast.expression);
  }

  /**
   * `typeof x`。
   *
   * ```html
   * {{ typeof v }}   {{ typeof (v | number) }}
   * ```
   */
  visitTypeofExpression(ast: TypeofExpression) {
    this.visit(ast.expression);
  }

  /**
   * `void x`（与 `typeof` 共用 AST 类型）。
   *
   * ```html
   * {{ void v }}
   * ```
   */
  visitVoidExpression(ast: TypeofExpression) {
    this.visit(ast.expression);
  }

  /**
   * 非空断言 `x!`。
   *
   * ```html
   * {{ a! | number }}   {{ (a | number)! }}
   * ```
   */
  visitNonNullAssert(ast: NonNullAssert) {
    this.visit(ast.expression);
  }

  /**
   * 属性读取 `a.b`。receiver 可能是带管道的子表达式。
   *
   * ```html
   * {{ (a | number).toFixed }}   → 1 个
   * ```
   */
  visitPropertyRead(ast: PropertyRead) {
    this.visit(ast.receiver);
  }

  /**
   * 安全属性读取 `a?.b`。
   *
   * ```html
   * {{ (a | number)?.b }}   → 1 个管道，藏在 receiver 里
   * ```
   *
   * **必须访问 receiver**。此前这里是空实现，导致 receiver 内的管道
   * 全部漏计，槽位整体错位。
   */
  visitSafePropertyRead(ast: SafePropertyRead) {
    this.visit(ast.receiver);
  }

  /**
   * 安全下标读取 `a?.[k]`。receiver 和 key 都要走。
   *
   * ```html
   * {{ a?.[(k | number)] }}   → 1 个
   * ```
   */
  visitSafeKeyedRead(ast: SafeKeyedRead) {
    this.visit(ast.receiver);
    this.visit(ast.key);
  }

  /**
   * 方法调用 `a.f(x)`。receiver 和全部实参都要走。
   *
   * ```html
   * {{ obj.get(v | number) }}   → 1 个
   * ```
   */
  visitCall(ast: Call) {
    this.visit(ast.receiver);
    this.visitAll(ast.args);
  }

  /**
   * 安全方法调用 `a?.f(x)`。
   *
   * ```html
   * {{ a?.f(b | number) }}   → 1 个
   * ```
   */
  visitSafeCall(ast: SafeCall) {
    this.visit(ast.receiver);
    this.visitAll(ast.args);
  }

  /**
   * 模板字符串 `` `a${x}b` ``。
   *
   * 与 Angular 一致地**按声明顺序**交替访问 element 与 expression：
   * elements 比 expressions 多一个。
   *
   * ```html
   * {{ `pre${a | number}mid${b}post` }}
   *   访问序: "pre" → (a|number) → "mid" → b → "post"
   * ```
   */
  visitTemplateLiteral(ast: TemplateLiteral) {
    for (let i = 0; i < ast.elements.length; i++) {
      this.visit(ast.elements[i]);

      const expression = i < ast.expressions.length ? ast.expressions[i] : null;
      if (expression !== null) {
        this.visit(expression);
      }
    }
  }

  /**
   * 模板字符串里的静态片段。叶子节点（其文本不参与表达式求值）。
   *
   * ```html
   * {{ `static-part${x}` }}
   *      ^^^^^^^^^^^ 就是这个
   * ```
   */
  visitTemplateLiteralElement(ast: TemplateLiteralElement) {}

  /**
   * 带标签的模板字符串 `` tag`a${x}` ``。
   *
   * 与 Angular 一致：先走 tag，再把整个 template 节点交回去
   * （由 `visitTemplateLiteral` 负责内部顺序），而不是只挑 expressions。
   *
   * ```html
   * {{ dedent`a${v | number}b` }}   → 1 个
   * ```
   */
  visitTaggedTemplateLiteral(ast: TaggedTemplateLiteral) {
    this.visit(ast.tag);
    this.visit(ast.template);
  }

  /**
   * 括号表达式 `( ... )`。
   *
   * ```html
   * {{ (a | number) }}
   * ```
   */
  visitParenthesizedExpression(ast: ParenthesizedExpression) {
    this.visit(ast.expression);
  }

  /**
   * 箭头函数（Angular 21 新增）。
   *
   * ```html
   * <button (click)="() => doIt(v)">x</button>
   * {{ items.map(() => a | number) }}
   * ```
   *
   * 只走 body；参数列表是标识符声明，不是求值表达式。
   */
  visitArrowFunction(ast: ArrowFunction) {
    this.visit(ast.body);
  }

  /**
   * 正则字面量（Angular 21 新增）。叶子节点。
   *
   * ```html
   * {{ /ab+c/.test(v) }}
   * ```
   */
  visitRegularExpressionLiteral(ast: RegularExpressionLiteral) {}

  /**
   * 展开元素 `...x`（Angular 21 新增）。
   *
   * ```html
   * {{ [...a, b | number] }}
   * ```
   */
  visitSpreadElement(ast: SpreadElement) {
    this.visit(ast.expression);
  }

  /**
   * 空表达式。
   *
   * ```html
   * <div [title]=""></div>
   * <div>{{ }}</div>
   * ```
   *
   * 叶子节点。必须显式实现：`EmptyExpr` 是独立 AST 类型，
   * 缺方法会让子树遍历在此中断。
   */
  visitEmptyExpr(ast: EmptyExpr) {}

  /**
   * 通用入口：把节点重新派发回它自己的 `visit`，
   * 从而落到上面某个具体方法（对齐 `RecursiveAstVisitor.visit`）。
   *
   * 之所以不是空实现：内部所有子节点遍历都走 `this.visit(child)`，
   * 这里若为空，整条递归立刻断掉、什么都数不到。
   */
  visit(ast: AST) {
    ast.visit(this);
  }

  /**
   * 批量访问。对齐 `RecursiveAstVisitor.visitAll`。
   */
  visitAll(asts: AST[]) {
    for (let i = 0; i < asts.length; ++i) {
      this.visit(asts[i]);
    }
  }
}
