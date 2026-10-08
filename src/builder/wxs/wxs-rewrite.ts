/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ASTWithSource,
  BindingType,
  BoundElementProperty,
  LiteralArray,
} from '@angular/compiler';
import { DeclaredWxsModules, containsWxsRoot } from './wxs-call';
import {
  WxsDeclaration,
  assertNoDuplicateModule,
  extractWxsDeclarations,
} from './wxs-declare';
import {
  WxsExprPlan,
  planWxsInterpolation,
  splitWxsExpression,
  wxsAbsoluteOffset,
  wxsCarrierKey,
} from './wxs-expr';

/**
 * 把含 wxs 的模板表达式改写成「枝叶数组」。
 *
 *   [foo]="wxs.util.add(a) + b"  →  [foo]="[a, b]"   ← Angular 编译的是纯数组
 *
 * 计划（wxml 串 + 枝叶数）按绑定载体存进 WeakMap，原表达式已从 AST 上摘掉，
 * 后续 walk 阶段只能凭载体反查。
 *
 * 能改的原因：`ingestComponent(name, meta.template.nodes, ...)` 是 emit 时才读这批节点，
 * 而 builder 跑在 `prepareEmit()` 之前，且 `meta` 是浅拷贝，`.template` 是同一个引用。
 */
const plans = new WeakMap<object, WxsExprPlan>();

/** 按绑定载体（`input.value` / `boundText.value`）反查改写计划 */
export function getWxsPlan(
  carrier: object | undefined | null,
): WxsExprPlan | undefined {
  return carrier ? plans.get(carrier) : undefined;
}

/**
 * 按组件源文件记录已声明的 wxs 模块集合。事件下推在 walk 阶段发生，而事件本身不改写
 * （没有 plan 可挂），所以识别集合必须单独存一份。
 */
const declaredBySourceFile = new Map<string, DeclaredWxsModules>();

/**
 * walk 阶段按组件源文件反查声明集合。没命中时每次新建空集，不共用一个常量：
 * 共用的空集一旦被写入，所有组件都会以为自己有 wxs。
 */
export function getDeclaredWxs(
  sourceFile: string | undefined | null,
): DeclaredWxsModules {
  return (
    (sourceFile && declaredBySourceFile.get(sourceFile)) || new Set<string>()
  );
}

/** 绑定类型：0=property 1=attr 2=class 3=style */
const BINDING_PROPERTY = 0;
const BINDING_CLASS = 2;
const BINDING_STYLE = 3;
/** `SecurityContext.NONE`；该枚举没从 @angular/compiler 导出，直接取枚举值 */
const SECURITY_NONE = 0;

function kindOf(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return '';
  }
  return (node as any).constructor?.name ?? '';
}

/**
 * `attachCarrier` 造出来的合成承载 input。它们在原文里没有对应片段，
 * 从 AST 反推模板文本时必须跳过。
 */
export const syntheticCarrierInputs = new WeakSet<object>();

class WxsRewriter {
  readonly modules = new Set<string>();
  private LiteralArray: any;

  constructor(
    private readonly c: {
      LiteralArray: any;
      ASTWithSource: any;
      BoundElementProperty: any;
      BindingType: any;
    },
    private readonly declared: DeclaredWxsModules,
  ) {
    this.LiteralArray = c.LiteralArray;
  }

  private stash(carrier: any, originalAst: any, plan: WxsExprPlan): void {
    carrier.ast = new this.LiteralArray(
      originalAst.span,
      originalAst.sourceSpan,
      plan.freeVars,
    );
    plans.set(carrier, plan);
    plan.modules.forEach((m) => this.modules.add(m));
  }

  private rewriteExpressionBinding(input: any): void {
    const carrier = input.value;
    const ast = carrier?.ast;
    if (!ast || !containsWxsRoot(ast, this.declared)) {
      return;
    }
    if (input.type === BINDING_CLASS || input.type === BINDING_STYLE) {
      // `[class]` / `[style]` 整体绑定是 type=0，不进这里；只有 `[class.foo]` / `[style.color]` 才是 type 2/3
      const kind = input.type === BINDING_CLASS ? 'class' : 'style';
      throw new Error(
        `wxs 不支持逐目标绑定 [${kind}.${input.name}]，` +
          `请改用整体绑定 [${kind}]="wxs.mod.fn(...)"。` +
          `逐目标需要每个目标各自开一条物化通道，` +
          `与「整值下推」模型对不上。`,
      );
    }
    if (input.type !== BINDING_PROPERTY) {
      return;
    }
    const plan = splitWxsExpression(ast, this.declared);
    /**
     * `[class]` / `[style]` 整体绑定发的是 `ɵɵclassMap` / `ɵɵstyleMap`，走 addClass / setStyle，
     * 不进 `setProperty`，枝叶数组到不了 `property.class`。改成合成普通 property 就能原样递过去。
     * 零枝叶时不改：wxml 里没有占位，不会去读承载位。
     */
    if (
      plan.freeVars.length &&
      (input.name === 'class' || input.name === 'style')
    ) {
      plan.origin = input.name;
      plan.carrier = wxsCarrierKey(plan);
      input.name = plan.carrier;
    }
    this.stash(carrier, ast, plan);
  }

  private rewriteBoundText(node: any, host: any): void {
    const carrier = node.value;
    const ast = carrier?.ast;
    if (!ast || kindOf(ast) !== 'Interpolation') {
      return;
    }
    if (!containsWxsRoot(ast, this.declared)) {
      return;
    }
    const plan = planWxsInterpolation(
      ast,
      (expr) => `{{${expr}}}`,
      this.declared,
    );
    plan.origin = 'text';
    // 字面文本必须在这里取：`stash()` 之后 `carrier.ast` 已是 LiteralArray，拿不到 `strings`
    (plan as any).literal = ((ast as any).strings ?? []).join('');
    this.stash(carrier, ast, plan);
    // 零枝叶时 wxml 里没有占位，不承载
    if (plan.freeVars.length) {
      plan.carrier = wxsCarrierKey(plan);
      this.attachCarrier(host, node, plan);
    }
  }

  /**
   * 把枝叶数组挂到宿主元素的一个合成普通 property 上。
   * 文本节点自己带不了数组（`ɵɵtextInterpolate*` 会 `String(v)`），只能借宿主元素的 `setProperty`。
   * 原 BoundText 不删：槽位模拟按走树顺序编号，删了会让后续下标整体错位。
   */
  private attachCarrier(host: any, textNode: any, plan: WxsExprPlan): void {
    if (!host || !Array.isArray(host.inputs)) {
      throw new Error(
        `wxs 插值找不到宿主元素，无法下推枝叶数组：${textNode.sourceSpan ?? ''}`,
      );
    }
    const { ASTWithSource, BoundElementProperty, BindingType } = this.c;
    const literal = new this.LiteralArray(
      textNode.value?.span,
      textNode.value?.sourceSpan,
      plan.freeVars,
    );
    const value = new ASTWithSource(
      literal,
      '',
      host.name ?? '',
      wxsAbsoluteOffset(textNode.value) || 0,
      [],
    );
    const synthetic = new BoundElementProperty(
      plan.carrier,
      BindingType.Property,
      SECURITY_NONE,
      value,
      null,
      // 借的是文本节点的 span，原文里没有对应片段，下游靠 syntheticCarrierInputs 跳过它
      textNode.sourceSpan,
      undefined,
      undefined,
    );
    host.inputs.push(synthetic);
    syntheticCarrierInputs.add(synthetic);
    plans.set(value, plan);
  }

  walk(nodes: any[], host?: any): void {
    (nodes ?? []).forEach((node) => {
      if (!node || typeof node !== 'object') {
        return;
      }
      const isElement = kindOf(node) === 'Element';
      const scope = isElement ? node : host;
      (node.inputs ?? []).forEach((input: any) =>
        this.rewriteExpressionBinding(input),
      );
      if (kindOf(node) === 'BoundText') {
        this.rewriteBoundText(node, scope);
      }
      // 子节点 / ng-template 内容 / 延迟块都靠递归覆盖
      this.walk(node.children ?? [], scope);
      if (node.template) {
        this.walk([node.template], scope);
      }
    });
  }
}

/**
 * 走查并改写一棵解析后的模板。必须在 builder walk 模板之前调用，
 * 否则 walk 读到的还是原表达式，而 emit 用的是改写后的。
 * 声明先行：先把 `<wxs module src>` 摘出来构成识别集合，再改写表达式。
 */
export async function rewriteWxsTemplates(
  nodes: any[],
  sourceFile?: string,
): Promise<{
  modules: string[];
  declarations: WxsDeclaration[];
  declared: DeclaredWxsModules;
}> {
  const declarations = extractWxsDeclarations(nodes);
  assertNoDuplicateModule(declarations);
  const declared = new Set(declarations.map((d) => d.module));
  if (sourceFile) {
    declaredBySourceFile.set(sourceFile, declared);
  }
  const rewriter = new WxsRewriter(
    { LiteralArray, ASTWithSource, BoundElementProperty, BindingType },
    declared,
  );
  rewriter.walk(nodes);

  return { modules: [...rewriter.modules], declarations, declared };
}
