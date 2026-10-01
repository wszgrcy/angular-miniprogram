/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AST } from '@angular/compiler';
import {
  DeclaredWxsModules,
  containsWxsRoot,
  matchWxsCall,
  matchWxsHandler,
} from './wxs-call';

/**
 * 表达式拆分器：把含 wxs 的 Angular 表达式切成「脊柱」和「枝叶」。
 *
 * wxs 活在渲染层。逻辑层看不见它，也无法消费它的返回值。
 * 所以整条表达式必须在 wxml 里求值，逻辑层只负责把表达式里
 * **不含 wxs 的最大子树**算好、物化成数据推上去。
 *
 *   {{ wxs.util.add(a) + b }}
 *
 *   脊柱（进 wxml）   util.add({0}) + {1}
 *   枝叶（进数组）    [a, b]
 *
 * Angular 之后编译的是 `bind(0, [a, b])` —— 一个纯数组，
 * 里面没有任何 wxs 痕迹。这就是「ng 根本看不到 wxs」。
 *
 * 占位符形如 `@@0@@`。**不能**用 `{0}` —— 它会和 wxml 的 `{{ }}`
 * 定界符撞在一起，`{{` + `{1}` + `}}` 拼出 `{{{1}}}` 这种歧义垃圾。
 * 容器把 `@@n@@` 替换成实际路径（`nodeList[i].__w.value[n]` 等），
 * 所以拆分器与平台路径格式解耦。
 */
/** 枝叶占位符前缀，见上方关于 `{{ }}` 撞形的说明 */
const PLACEHOLDER = '@@';

/** 生成第 n 个枝叶占位符 */
export function placeholder(n: number): string {
  return `${PLACEHOLDER}${n}${PLACEHOLDER}`;
}

export interface WxsExprPlan {
  /** 翻译后的 wxml 表达式，动态位置为 `{n}` 占位 */
  wxml: string;
  /** 按出现顺序排列的枝叶 AST，用于把原表达式替换成 LiteralArray */
  freeVars: unknown[];
  /** 表达式触及的 wxs 模块名 */
  modules: string[];
  /**
   * 枝叶数组落在哪个 property 上。
   *
   * 普通 property 就是它自己的名字；`[class]` / `[style]` / 文本插值
   * 不能直接当载体（见 `wxsCarrierKey`），会被改写成合成名。
   */
  carrier?: string;
  /** 原绑定位置，供 walk 阶段归位 */
  origin?: 'class' | 'style' | 'text';
}

/**
 * 合成承载属性名。
 *
 * 为什么需要它：Angular 只有 `ɵɵproperty` → `renderer.setProperty` 这一条
 * 通道能原样递送数组。另外两条都不行：
 *
 *   - 文本插值：`ɵɵtextInterpolate*` → `interpolationV` → `renderStringify`
 *     → `String(v)`，数组被 join（core 里没有能递原始值的文本指令）
 *   - `[class]` / `[style]`：走 `ɵɵclassMap` / `ɵɵstyleMap` → addClass /
 *     setStyle，压根不进 `setProperty`
 *
 * 所以这三处的枝叶数组都得挂到一个**普通 property** 上。
 *
 * key 从 `plan.wxml` 派生，不用源偏移：改写层（模板文本）和生成层
 * （库内解析）对 `preserveWhitespaces` 取值不同，折叠空白会让偏移整体
 * 错位；而 `plan.wxml` 由同一个切分器产出，两边必然一致。
 * 同名只可能出现在同一元素内，而 plan 相同意味着枝叶数组也相同，不冲突。
 */
export function wxsCarrierKey(plan: WxsExprPlan): string {
  /**
   * 只取表达式部分，字面文本不参与。
   *
   * 两侧解析模板时 `preserveWhitespaces` 取值不同（改写层固定 true，生成层
   * 跟组件默认），插值里的字面文本会被折叠掉前后空白。把 `{{ }}` 以外的
   * 内容剔掉，两边就只剩完全一致的表达式串。
   */
  const blocks = [...plan.wxml.matchAll(/\{\{([\s\S]*?)\}\}/g)].map(
    (m) => m[1],
  );
  const key = blocks.length ? blocks.join('|') : plan.wxml;
  let h = 5381;
  for (let i = 0; i < key.length; i++) {
    h = ((h << 5) + h + key.charCodeAt(i)) | 0;
  }
  return `__wx${(h >>> 0).toString(36)}`;
}

/** 是否合成承载属性名 */
export function isWxsCarrier(name: string): boolean {
  return name.startsWith('__wx');
}

/**
 * 取表达式的绝对起始偏移。
 *
 * Angular 22 里表达式节点带的是 `AbsoluteSourceSpan`（`start` 是数字），
 * 而模板节点带的是 `ParseSourceSpan`（偏移在 `.start.offset`），两种都接。
 */
export function wxsAbsoluteOffset(node: any): number {
  const span = node?.sourceSpan ?? node?.span;
  if (span && typeof span.start === 'number') {
    return span.start;
  }
  const off = span?.start?.offset;
  return typeof off === 'number' ? off : 0;
}

/**
 * wxml 表达式引擎支持的二元运算符。
 *
 * 刻意不含位运算 / `in` / `instanceof` / 赋值 —— wxml 的 `{{}}`
 * 表达式语言比 WXS 函数体更窄，写了会在小程序端静默失效。
 */
const WXML_BINARY_OPS = new Set([
  '+',
  '-',
  '*',
  '/',
  '%',
  '&&',
  '||',
  '===',
  '!==',
  '==',
  '!=',
  '<',
  '<=',
  '>',
  '>=',
]);

function kindOf(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return '';
  }
  return (node as any).constructor?.name ?? '';
}

/**
 * 字面量转 wxml。
 *
 * `undefined` 归一成 `null`：各端 wxml 对 `undefined` 的处理不一致，
 * 而 `null` 在所有目标平台都稳定渲染为空。
 */
export function wxmlLiteral(value: unknown): string {
  if (value === undefined || value === null) {
    return 'null';
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  const escaped = String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
  return `'${escaped}'`;
}

/**
 * 节点位置描述。
 *
 * Angular 22 的表达式节点只带 `AbsoluteSourceSpan`（纯字符偏移），
 * 拿不到文件名 / 行号。文件上下文由调用方（持有 BoundText /
 * BoundAttribute 的那一层）补上。
 */
function spanText(node: any): string {
  for (const key of ['sourceSpan', 'span']) {
    const s = node?.[key];
    if (s && typeof s.start === 'number') {
      return `字符 ${s.start}-${s.end}`;
    }
  }
  return '位置未知';
}

class WxsExprSplitter {
  private readonly freeVars: unknown[] = [];
  private readonly modules = new Set<string>();

  constructor(private readonly declared: DeclaredWxsModules) {}

  run(root: AST): WxsExprPlan {
    const wxml = this.visit(root, root);
    return { wxml, freeVars: this.freeVars, modules: [...this.modules] };
  }

  private leaf(node: any): string {
    const index = this.freeVars.length;
    this.freeVars.push(node);
    return placeholder(index);
  }

  private bail(node: any, why: string): never {
    const kind = kindOf(node) || 'unknown';
    throw new Error(
      `wxs 表达式无法下推到渲染层：${why}（节点 ${kind}，位置 ${spanText(
        node,
      )}）`,
    );
  }

  private visit(node: any, root: AST): string {
    if (!node || typeof node !== 'object') {
      this.bail(node, '不是表达式节点');
    }
    const kind = kindOf(node);

    // 字面量内联，省掉一次无谓的物化
    if (kind === 'LiteralPrimitive') {
      return wxmlLiteral(node.value);
    }
    if (kind === 'LiteralArray') {
      const items = (node.expressions ?? []).map((item: any) =>
        this.visit(item, root),
      );
      return `[${items.join(', ')}]`;
    }
    if (kind === 'LiteralMap') {
      const entries = (node.keys ?? []).map((key: any, i: number) => {
        if (key.kind === 'spread') {
          this.bail(node, 'wxml 不支持对象展开（...）');
        }
        return `'${key.key}': ${this.visit(node.values[i], root)}`;
      });
      return `{${entries.join(', ')}}`;
    }

    // 不含 wxs 的最大子树：整棵交给逻辑层算，整体物化成一个占位符。
    // 管道、?.、任意方法调用都在这棵子树里被 Angular 消化掉。
    if (!containsWxsRoot(node, this.declared)) {
      return this.leaf(node);
    }

    // wxs 函数调用
    const call = matchWxsCall(node, this.declared);
    if (call) {
      this.modules.add(call.module);
      const args = (node.args ?? []).map((arg: any) => this.visit(arg, root));
      return `${call.module}.${call.fn}(${args.join(', ')})`;
    }

    // wxs 模块成员引用（常量 / 非函数导出）
    const member = matchWxsHandler(node, this.declared);
    if (member) {
      this.modules.add(member.module);
      return `${member.module}.${member.fn}`;
    }

    // 脊柱上的运算符
    if (kind === 'Binary') {
      if (!WXML_BINARY_OPS.has(node.operation)) {
        this.bail(node, `wxml 不支持运算符 "${node.operation}"`);
      }
      return `( ${this.visit(node.left, root)} ${node.operation} ${this.visit(
        node.right,
        root,
      )} )`;
    }
    if (kind === 'Conditional') {
      return `( ${this.visit(
        node.condition,
        root,
      )} ? ${this.visit(node.trueExp, root)} : ${this.visit(node.falseExp, root)} )`;
    }
    if (kind === 'PrefixNot') {
      return `!${this.visit(node.expression, root)}`;
    }
    if (kind === 'ParenthesizedExpression') {
      // 不额外加括号：Binary / Conditional 的输出已自带括号，
      // 再套一层只会让 wxml 越来越难读。
      return this.visit(node.expression, root);
    }
    if (kind === 'KeyedRead' || kind === 'SafeKeyedRead') {
      return `( ${this.visit(node.receiver, root)} )[ ${this.visit(
        node.key,
        root,
      )} ]`;
    }
    // 对 wxs 结果取成员：`wxs.f(a).len` 在 wxml 里是合法的
    // （渲染层自己访问自己拿到的值），不该误报。
    // 不含 wxs 的 `a.b` 在上面已经被当枝叶物化了，走不到这里。
    if (kind === 'PropertyRead') {
      return `( ${this.visit(node.receiver, root)} ).${node.name}`;
    }

    this.bail(
      node,
      kind === 'BindingPipe'
        ? 'wxs 的返回值不能交给管道处理（管道在逻辑层，拿不到渲染层的值）'
        : `不支持的节点类型`,
    );
  }
}

/** 拆分一条含 wxs 的表达式 */
export function splitWxsExpression(
  ast: AST,
  declared: DeclaredWxsModules,
): WxsExprPlan {
  return new WxsExprSplitter(declared).run(ast);
}

/**
 * 拆分一条插值（`{{ }}` 混合文本）。
 *
 * 返回的 `wxml` 是**完整的文本节点内容**，`{{ }}` 块由本函数负责生成，
 * 容器直接落盘即可，不再走框架默认的 `{{nodeList[i].value}}`。
 *
 * 所有表达式的枝叶按出现顺序摊平进同一个 `freeVars`，
 * 供替换成单个 LiteralArray（一次 bind 带一个数组）。
 */
export type WxsInterpolationPlan = WxsExprPlan;

export function planWxsInterpolation(
  ast: AST,
  renderBlock: (exprWxml: string) => string,
  declared: DeclaredWxsModules,
): WxsInterpolationPlan {
  const node = ast as any;
  const strings: string[] = node.strings ?? [];
  const expressions: AST[] = node.expressions ?? [];

  const freeVars: unknown[] = [];
  const modules = new Set<string>();
  let wxml = '';

  expressions.forEach((expr, i) => {
    wxml += strings[i] ?? '';
    if (containsWxsRoot(expr, declared)) {
      const plan = new WxsExprSplitter(declared).run(expr);
      const offset = freeVars.length;
      // 子计划里的 {n} 要按已累积的枝叶数重新编号
      const reindexed = plan.wxml.replace(/@@(\d+)@@/g, (_, n) =>
        placeholder(Number(n) + offset),
      );
      freeVars.push(...plan.freeVars);
      plan.modules.forEach((m) => modules.add(m));
      wxml += renderBlock(reindexed);
    } else {
      const index = freeVars.length;
      freeVars.push(expr);
      wxml += renderBlock(placeholder(index));
    }
  });
  wxml += strings[strings.length - 1] ?? '';

  return { wxml, freeVars, modules: [...modules] };
}
