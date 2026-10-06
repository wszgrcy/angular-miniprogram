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
  /** 模板上写的原标签名（`tagName` 是映射后的 wxml 标签），`tag-name-*` 标记要用它判断有没有改写。 */
  sourceTag: string;
  children: NgNodeMeta[];
  attributes: Record<string, string>;
  /**
   * 模板上写死的 class / style。class/style 下推后 `class` 属性整条由 wxs 表达式接管，
   * 静态部分必须显式合并，否则会被抹掉。
   */
  staticClass: string;
  staticStyle: string;
  /**
   * 开始标签上带了 `#xxx`（模板引用变量）。只有这种节点会被 `AgentNode.find()` 查询得到，
   * 运行时侧的同一条件在 `refClassOf()`。
   */
  hasRef: boolean;
  /**
   * 本元素的 class 通道是否被用到。没用到的元素不输出 class 绑定，数据侧也不发这个字段。
   * 判据必须盖住 class 的全部来源，漏一条就是静默丢样式，见 `ParsedNgElement.usesChannel()`。
   */
  needsClass: boolean;
  /** 同 {@link needsClass}，对应 style 通道 */
  needsStyle: boolean;
  inputs: string[];
  outputs: string[];
  /**
   * 带 `i18n-<attr>` 且值为静态的属性名。译文由 Angular 在建元素时 `setAttribute` 写进
   * `attribute`，wxml 必须改成读 `nodeList[i].attribute.<name>` 的绑定。
   * 值含插值的不在这里，那条绑定本来就指着 `property`。
   */
  i18nAttrs: string[];
  singleClosedTag: boolean;
  /**
   * `[innerHTML]` 富文本承载。小程序没有 innerHTML，容器会把子节点整段换成
   * `<rich-text nodes="{{...}}"/>`，取值仍走宿主元素的 `property.innerHTML`。
   */
  richText: boolean;
  componentMeta: MatchedComponent | undefined;
  directiveMeta: MatchedDirective | undefined;
  /**
   * 绑定名 → 渲染层改写计划。命中的属性不走 `property.<key>`，而是把整条表达式翻译到 wxml，
   * 枝叶按 `plan.wxml` 里的 `@@n@@` 占位物化到 `property.__w.<key>`。
   */
  wxsProps?: Record<string, WxsExprPlan>;
  /** `[class]` 下推：枝叶挂在 `plan.carrier` 上，不是 `class` */
  wxsClass?: WxsExprPlan;
  /** `[style]` 下推，同上 */
  wxsStyle?: WxsExprPlan;
  /** 事件名 → 渲染层 handler。命中的事件不走统一的 `bindEvent` 路由，直接绑到 wxs 函数上。 */
  wxsEvents?: Record<string, WxsHandlerMeta>;
}
export interface NgBoundTextMeta extends NgNodeMeta {
  kind: NgNodeKind.BoundText;
  /** 插值含 wxs 时下推。`plan.wxml` 是完整的 wxml 文本（已含 `{{ }}` 与前后缀字面文本）。 */
  wxsText?: WxsExprPlan;
  /**
   * 枝叶数组所在宿主元素的下标。文本节点带不了数组，枝叶由改写层挂到了宿主元素的合成 property 上。
   */
  wxsHost?: number;
}
export interface NgTextMeta extends NgNodeMeta {
  kind: NgNodeKind.Text;
  value: string;
  /**
   * 这段静态文本属于宿主元素的 `i18n` 消息。译文只有运行时知道，译文落在 `nodeList[i].value` 上，
   * 所以 wxml 必须改成绑定。带插值的消息不在这里，那条本来就是 `BoundText`。
   */
  i18n: boolean;
}

export interface NgTemplateMeta extends NgNodeMeta {
  kind: NgNodeKind.Template;
  children: NgNodeMeta[];
  defineTemplateName: string;
}
export interface NgContentMeta extends NgNodeMeta {
  kind: NgNodeKind.Content;
  name: string | undefined;
  /**
   * 兜底内容（`<ng-content>写点东西</ng-content>`）。Angular 把它编成投影节点紧后面的一个
   * embedded view，于是带兜底时要占两个声明槽，兜底视图自己的节点重新从 0 编号。
   */
  fallback?: NgTemplateMeta;
}
