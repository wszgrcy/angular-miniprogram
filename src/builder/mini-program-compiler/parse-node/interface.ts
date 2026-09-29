import type { WxsHandlerMeta } from '../../wxs/wxs-call';
import type { WxsExprPlan } from '../../wxs/wxs-expr';
import type { MatchedComponent, MatchedDirective } from './type';

export interface ParsedNode<T> {
  kind: NgNodeKind;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parent: ParsedNode<any> | undefined;
  getNodeMeta(): T;
  index: number;
}
export enum NgNodeKind {
  Element,
  BoundText,
  Text,
  Template,
  Content,
}
export interface NgNodeMeta {
  kind: NgNodeKind;
  index: number;
}
export interface NgElementMeta extends NgNodeMeta {
  kind: NgNodeKind.Element;
  tagName: string;
  children: NgNodeMeta[];
  attributes: Record<string, string>;
  /**
   * 模板上写死的 class / style。
   *
   * 普通路径下它们由 `renderer.addClass` 汇入 `nodeList[i].class`，
   * 但 class/style 下推后 `class` 属性整条由 wxs 表达式接管，
   * 静态部分必须显式合并，否则会被抹掉。
   */
  staticClass: string;
  staticStyle: string;
  inputs: string[];
  outputs: string[];
  singleClosedTag: boolean;
  componentMeta: MatchedComponent | undefined;
  directiveMeta: MatchedDirective | undefined;
  /**
   * 绑定名 → 渲染层改写计划。
   *
   * 命中的属性不走 `nodeList[i].property.<key>`，而是把整条表达式
   * 翻译到 wxml，枝叶按 `plan.wxml` 里的 `@@n@@` 占位物化到
   * `property.__w.<key>`。
   */
  wxsProps?: Record<string, WxsExprPlan>;
  /**
   * 事件名 → 渲染层 handler。
   *
   * 命中的事件不走统一的 `bindEvent` 路由，直接绑到 wxs 函数上，
   * 全程不过桥。
   */
  wxsEvents?: Record<string, WxsHandlerMeta>;
}
export interface NgBoundTextMeta extends NgNodeMeta {
  kind: NgNodeKind.BoundText;
  /**
   * 插值含 wxs 时下推。`plan.wxml` 是**完整的 wxml 文本**
   * （已含 `{{ }}` 块与前后缀字面文本），容器直接落盘。
   */
  wxsText?: WxsExprPlan;
}
export interface NgTextMeta extends NgNodeMeta {
  kind: NgNodeKind.Text;
  value: string;
}

export interface NgTemplateMeta extends NgNodeMeta {
  kind: NgNodeKind.Template;
  children: NgNodeMeta[];
  defineTemplateName: string;
}
export interface NgContentMeta extends NgNodeMeta {
  kind: NgNodeKind.Content;
  name: string | undefined;
}
