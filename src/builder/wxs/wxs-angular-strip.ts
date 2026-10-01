/* eslint-disable @typescript-eslint/no-explicit-any */
import { getWxsPlan, syntheticCarrierInputs } from './wxs-rewrite';
import { isWxsCarrier } from './wxs-expr';

/**
 * 从**已改写的 AST** 产出「Angular 可见模板」。
 *
 * 只走一遍：分析层 `rewriteWxsTemplates` 已把表达式换成枝叶数组并存下计划，
 * 本模块复用同一份 AST 去切原文，不再有第二次解析。
 *
 * ## 坐标系（这块最容易踩坑，务必照做）
 *
 * Angular 里有三套位置，语义完全不同，**不能互为兜底**：
 *
 * | 字段 | 坐标系 | 用途 |
 * | --- | --- | --- |
 * | TmplAst 节点 `.sourceSpan` | 原始文件 | 替换区间 |
 * | 表达式 `.sourceSpan` | **交给解析器的那段文本**（`preserveWhitespaces:false` 下是折叠后的） | 只能配合 `carrier.source` 用 |
 * | 表达式 `.span` | 相对父表达式节点 | 不单独使用 |
 *
 * 所以：
 * - **替换区间**一律取 TmplAst 节点的 `sourceSpan`（原始文件坐标，折叠与否都对）
 * - **枝叶文本**一律在 `carrier` 自己的坐标系里切：
 *   `carrier.source.slice(v.sourceSpan.start - carrier.sourceSpan.start, ...)`
 * - 属性绑定不走插值重解析那条路，`sourceSpan` 本来就是原始文件坐标
 */
interface Edit {
  start: number;
  end: number;
  text: string;
}

/**
 * 剥离结果注册表，供 vite 侧 fileReplacements 消费。
 *
 * **只能按内容建钥匙**：实测 `meta.template.file.fileName` 是 `null`，分析层
 * 拿不到模板文件路径；而 `meta.template.content` 与磁盘原文逐字节相同。
 */
const strippedByContent = new Map<string, string>();

export function recordStrippedTemplate(
  content: string,
  stripped: string,
): void {
  strippedByContent.set(content, stripped);
}

export function lookupStrippedByContent(content: string): string | undefined {
  return strippedByContent.get(content);
}

function kindOf(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return '';
  }
  return (node as any).constructor?.name ?? '';
}

/** ParseSourceSpan 的偏移在 `.start.offset`；表达式节点的是纯数字 */
function tmplOffset(span: any, end = false): number {
  const v = end ? span?.end?.offset : span?.start?.offset;
  if (typeof v !== 'number') {
    throw new Error('TmplAst 节点缺少字符偏移，无法定位替换区间');
  }
  return v;
}

/**
 * 在 carrier 自己的坐标系里取一段表达式文本。
 *
 * `carrier.source` 是交给解析器的那段文本，`carrier.sourceSpan.start` 是它的
 * 锚点（源码里 `span=[0,source.length]` 经 `toAbsolute` 的产物）。两者相减
 * 就是表达式在 `source` 里的下标 —— 与是否折叠空白无关。
 */
function leafText(carrier: any, node: any, what: string): string {
  const src: unknown = carrier?.source;
  const base = carrier?.sourceSpan?.start;
  const s = node?.sourceSpan;
  if (typeof src !== 'string' || typeof base !== 'number') {
    throw new Error(`carrier 缺少 source/锚点，无法取枝叶文本：${what}`);
  }
  if (!s || typeof s.start !== 'number' || typeof s.end !== 'number') {
    throw new Error(`枝叶表达式缺少字符偏移：${what}`);
  }
  return (src as string).slice(s.start - base, s.end - base);
}

function leafArray(carrier: any, freeVars: unknown[], what: string): string {
  return `[${freeVars.map((v) => leafText(carrier, v, what)).join(', ')}]`;
}

/** 按 start 倒序应用，前面的偏移不会被后面的替换冲掉 */
function applyEdits(source: string, edits: Edit[]): string {
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  let out = source;
  for (const e of sorted) {
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
  }
  return out;
}

/** 表达式区间（属性绑定用；那条路不走重解析，本来就是原始文件坐标） */
function exprSpan(value: any): { start: number; end: number } {
  const s = value?.ast?.sourceSpan;
  if (!s || typeof s.start !== 'number' || typeof s.end !== 'number') {
    throw new Error('绑定表达式缺少字符偏移');
  }
  return s;
}

export function stripWxsFromAst(
  nodes: any[],
  source: string,
  fileName: string,
): string {
  const edits: Edit[] = [];
  /**
   * 宿主上已经写过的承载位 key。
   *
   * `[class]` 被改名成承载位、同宿主又有一个同表达式的插值时，两边算出的
   * key 相同（key 只由表达式决定）。不去重就会产出重复属性。
   */
  const carrierWritten = new Map<any, Set<string>>();

  const rewrite = (list: any[], host: any): void => {
    for (const node of list ?? []) {
      if (!node || typeof node !== 'object') {
        continue;
      }
      const scope = kindOf(node) === 'Element' ? node : host;

      for (const input of node.inputs ?? []) {
        // 合成承载 input 在原文里没有对应片段，跳过
        if (syntheticCarrierInputs.has(input)) {
          continue;
        }
        const plan = getWxsPlan(input.value);
        if (!plan) {
          continue;
        }
        if (!plan.freeVars.length) {
          const span = exprSpan(input.value);
          edits.push({ start: span.start, end: span.end, text: '[]' });
          continue;
        }
        if (isWxsCarrier(input.name)) {
          edits.push({
            start: tmplOffset(input.sourceSpan),
            end: tmplOffset(input.sourceSpan, true),
            text: `[${plan.carrier}]="${leafArray(input.value, plan.freeVars, `[${input.name}]`)}"`,
          });
          if (plan.carrier) {
            const set = carrierWritten.get(scope) ?? new Set<string>();
            set.add(plan.carrier);
            carrierWritten.set(scope, set);
          }
          continue;
        }
        const span = exprSpan(input.value);
        edits.push({
          start: span.start,
          end: span.end,
          text: leafArray(input.value, plan.freeVars, `[${input.name}]`),
        });
      }

      if (kindOf(node) === 'BoundText') {
        const plan = getWxsPlan(node.value);
        if (plan) {
          /**
           * 替换区间用 TmplAst 节点自己的 sourceSpan（原始文件坐标）。
           *
           * 必须是**非空白**文本：组件默认 `preserveWhitespaces:false` 会把
           * 全空白文本节点丢掉，而分析层节点还在，两边下标整体错一位。
           * 零宽空格不在 `\s` 里，两种设置下都留得住，又不占位。
           */
          const literal: string = (plan as any).literal ?? '';
          edits.push({
            start: tmplOffset(node.sourceSpan),
            end: tmplOffset(node.sourceSpan, true),
            text: /^\s*$/.test(literal) ? '\u200b' : literal,
          });
          if (plan.carrier && !carrierWritten.get(scope)?.has(plan.carrier)) {
            const open = tmplOffset(scope?.startSourceSpan);
            if (!scope?.name) {
              throw new Error(`wxs 插值找不到宿主元素: ${fileName}`);
            }
            const at = open + 1 + String(scope.name).length;
            edits.push({
              start: at,
              end: at,
              text: ` [${plan.carrier}]="${leafArray(node.value, plan.freeVars, '插值')}"`,
            });
          }
        }
      }

      rewrite(node.children ?? [], scope);
      if (node.template) {
        rewrite([node.template], scope);
      }
    }
  };
  rewrite(nodes, null);

  /**
   * `<wxs>` 元素整段删掉。
   *
   * 不能靠走 AST：分析层自己的走树早就把 `<wxs>` 从 `meta.template.nodes`
   * 里摘了，再走一遍什么都取不到，结果就是 `<wxs>` 留在 Angular 可见模板里
   * —— 多出一个元素节点，`data-node-index` 整体错位。直接扫源文本最稳。
   */
  const wxsTag = /<wxs\b[^>]*>(?:[\s\S]*?<\/wxs\s*>)?|<wxs\b[^>]*\/>/g;
  for (let m = wxsTag.exec(source); m; m = wxsTag.exec(source)) {
    edits.push({ start: m.index, end: m.index + m[0].length, text: '' });
  }

  return applyEdits(source, edits);
}
