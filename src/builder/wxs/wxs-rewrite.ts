/* eslint-disable @typescript-eslint/no-explicit-any */
import { angularCompilerPromise } from '../util/load_esm';
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
} from './wxs-expr';

/**
 * 把含 wxs 的模板表达式改写成「枝叶数组」。
 *
 *   [foo]="wxs.util.add(a) + b"
 *     ↓ 改写
 *   [foo]="[a, b]"            ← Angular 编译的是纯数组
 *
 * 计划（wxml 串 + 枝叶数）按**绑定载体**存进 WeakMap，因为原表达式
 * 已从 AST 上摘掉，后续 walk 阶段只能凭载体反查。
 *
 * 为什么能改：`compileComponentFromMetadata` 里
 * `ingestComponent(name, meta.template.nodes, ...)` 是 **emit 时**才读
 * 这批节点；而本仓库的 builder 跑在 `prepareEmit()` 之前，
 * 且 `meta = {...trait.analysis.meta, ...}` 是浅拷贝，`.template`
 * 就是同一个对象引用。改得动，且 codegen 认。
 */
const plans = new WeakMap<object, WxsExprPlan>();

/** 按绑定载体（`input.value` / `boundText.value`）反查改写计划 */
export function getWxsPlan(
  carrier: object | undefined | null,
): WxsExprPlan | undefined {
  return carrier ? plans.get(carrier) : undefined;
}

/**
 * 按组件源文件记录「已声明的 wxs 模块集合」。
 *
 * 事件下推在 walk 阶段发生，而事件本身不改写（没有 plan 可挂），
 * 所以识别集合必须单独存一份。按源文件键控而不是全局变量，
 * 避免多组件之间串味。
 */
const declaredBySourceFile = new Map<string, DeclaredWxsModules>();

/**
 * walk 阶段按组件源文件反查声明集合。
 *
 * 没命中时**每次新建空集**，不共用一个常量：
 * `ReadonlySet` 只挡编译期，`Object.freeze(new Set())` 也挡不住
 * `.add()`（数据在内部槽不在自有属性）。共用的空集一旦被写入，
 * 所有组件都会以为自己有 wxs —— 跳组件污染，极难查。
 * 编译期调用，新建成本可忽略。
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

function kindOf(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return '';
  }
  return (node as any).constructor?.name ?? '';
}

class WxsRewriter {
  readonly modules = new Set<string>();
  private LiteralArray: any;

  constructor(
    LiteralArray: any,
    private readonly declared: DeclaredWxsModules,
  ) {
    this.LiteralArray = LiteralArray;
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
      // 注意：`[class]` / `[style]` 整体绑定是 type=0，不进这里；
      // 只有 `[class.foo]` / `[style.color]` 这种逐目标绑定才是 type 2/3。
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
    this.stash(carrier, ast, splitWxsExpression(ast, this.declared));
  }

  private rewriteBoundText(node: any): void {
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
    this.stash(carrier, ast, plan);
  }

  walk(nodes: any[]): void {
    (nodes ?? []).forEach((node) => {
      if (!node || typeof node !== 'object') {
        return;
      }
      (node.inputs ?? []).forEach((input: any) =>
        this.rewriteExpressionBinding(input),
      );
      if (kindOf(node) === 'BoundText') {
        this.rewriteBoundText(node);
      }
      // 子节点 / ng-template 内容 / 延迟块都靠递归覆盖
      this.walk(node.children ?? []);
      if (node.template) {
        this.walk([node.template]);
      }
    });
  }
}

/**
 * 走查并改写一棵解析后的模板。
 *
 * 必须在 builder walk 模板**之前**调用，否则 walk 读到的还是原表达式，
 * 而 emit 用的是改写后的，两边对不上。
 *
 * 声明先行：先把 `<wxs module src>` 摘出来构成识别集合，再改写表达式。
 * 集合就是定义 —— 没声明的名字就是普通 Angular 属性访问，走逻辑层，
 * 不需要（也无法）再查一遗「是否漏声明」。
 */
export async function rewriteWxsTemplates(
  nodes: any[],
  sourceFile?: string,
): Promise<{
  modules: string[];
  declarations: WxsDeclaration[];
  declared: DeclaredWxsModules;
}> {
  const { LiteralArray } = await angularCompilerPromise;
  const declarations = extractWxsDeclarations(nodes);
  assertNoDuplicateModule(declarations);
  const declared = new Set(declarations.map((d) => d.module));
  if (sourceFile) {
    declaredBySourceFile.set(sourceFile, declared);
  }
  const rewriter = new WxsRewriter(LiteralArray, declared);
  rewriter.walk(nodes);

  return { modules: [...rewriter.modules], declarations, declared };
}
