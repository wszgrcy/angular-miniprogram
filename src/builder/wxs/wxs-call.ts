/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AST } from '@angular/compiler';

/**
 * 模板里 wxs 调用的识别。
 *
 * 模块名来自模板声明：
 *
 *   <wxs module="format" src="./format.wxs"></wxs>
 *   {{ format.money(cents) }}
 *
 * 识别靠**已声明模块集合**查表，与 uni-app 的
 * `filters.includes(node.callee.object.name)` 同一套路。
 * 没有固定前缀 —— `module="format"` 已经给了名字，再加 `wxs.` 是冗余。
 *
 * 实测 AST 形状（二级链）：
 *
 *   Call
 *   └─ PropertyRead  money
 *      └─ PropertyRead  format     ← 必须在 declared 集合里
 *         └─ ImplicitReceiver
 *
 * 之所以走「声明集合 + 结构判定」而不是类型系统：编译器不在 Angular
 * 编译管线内部，拿不到符号解析结果，只能吃 AST。
 *
 * 节点判别用 `constructor.name` 而非 `instanceof`：
 * `@angular/compiler` 是 ESM，本仓库通过 `load_esm.ts` 动态加载，
 * 静态值导入会与它抢同一模块导致 ERR_REQUIRE_ESM_RACE_CONDITION。
 */

/** 已声明的 wxs 模块名集合，识别的唯一依据 */
export type DeclaredWxsModules = ReadonlySet<string>;

export interface WxsCallMeta {
  module: string;
  fn: string;
  /** 实参个数，决定 wxml 里展开成几个位置参数 */
  arity: number;
}

export interface WxsHandlerMeta {
  module: string;
  fn: string;
}

function nodeKind(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return '';
  }
  return (node as any).constructor?.name ?? '';
}

function isCall(node: unknown): boolean {
  const k = nodeKind(node);
  return k === 'Call' || k === 'SafeCall';
}

/** 只认非安全读取：`format?.money` 不是合法的渲染层调用形态 */
function isPropertyRead(node: unknown): boolean {
  return nodeKind(node) === 'PropertyRead';
}

function isImplicitReceiver(node: unknown): boolean {
  const k = nodeKind(node);
  return k === 'ImplicitReceiver' || k === 'ThisReceiver';
}

/**
 * 解析 `<module>.<fn>` 这条属性链。
 *
 * 不检查最外层是 Call 还是引用，由调用方决定。
 * `module` 必须在 declared 里，否则就是普通的组件属性访问。
 */
function readWxsChain(
  node: unknown,
  declared: DeclaredWxsModules,
): { module: string; fn: string } | null {
  if (!isPropertyRead(node)) {
    return null;
  }
  const outer = node as any;
  const mid = outer.receiver;
  if (!isPropertyRead(mid)) {
    return null;
  }
  if (!isImplicitReceiver(mid.receiver)) {
    return null;
  }
  if (!declared.has(mid.name)) {
    return null;
  }
  return { module: mid.name, fn: outer.name };
}

/** 精确匹配 `<module>.<fn>(...)` 调用 */
export function matchWxsCall(
  ast: AST | undefined | null,
  declared: DeclaredWxsModules,
): WxsCallMeta | null {
  if (!ast || !isCall(ast)) {
    return null;
  }
  const chain = readWxsChain((ast as any).receiver, declared);
  if (!chain) {
    return null;
  }
  return { ...chain, arity: ((ast as any).args ?? []).length };
}

/**
 * 精确匹配 `<module>.<fn>`（**不带调用**）形态，用于事件 handler
 * 以及模块常量引用（`{{ format.MSG }}`）。
 *
 * 与 uni-app 一致：wxs 事件处理器是成员引用而非调用。
 */
export function matchWxsHandler(
  ast: AST | undefined | null,
  declared: DeclaredWxsModules,
): WxsHandlerMeta | null {
  if (!ast) {
    return null;
  }
  return readWxsChain(ast, declared);
}

const CHILD_KEYS = [
  'receiver',
  'args',
  'left',
  'right',
  'expr',
  'expression',
  'expressions',
  'condition',
  'trueExp',
  'falseExp',
  'obj',
  'key',
  'keys',
  'values',
  'entries',
  'texts',
  'spans',
  'tag',
  'template',
  'exp',
] as const;

/**
 * 子树里是否引用了任一已声明的 wxs 模块。
 *
 * 判据：存在 `PropertyRead(name=M, receiver=ImplicitReceiver)` 且 M 已声明。
 *
 * CHILD_KEYS 漏一个字段 = 漏一类节点。漏检的后果是「写了 wxs 但被
 * 当成普通表达式」，静默产出错误代码，比报错糟糕得多。
 */
export function containsWxsRoot(
  node: unknown,
  declared: DeclaredWxsModules,
): boolean {
  if (!node || typeof node !== 'object') {
    return false;
  }
  if (!declared.size) {
    return false;
  }
  if (
    isPropertyRead(node) &&
    isImplicitReceiver((node as any).receiver) &&
    declared.has((node as any).name)
  ) {
    return true;
  }
  for (const key of CHILD_KEYS) {
    const child = (node as any)[key];
    if (!child) {
      continue;
    }
    if (Array.isArray(child)) {
      for (const item of child) {
        if (containsWxsRoot(item, declared)) {
          return true;
        }
      }
    } else if (containsWxsRoot(child, declared)) {
      return true;
    }
  }
  return false;
}
