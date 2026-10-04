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
  /**
   * 带 `i18n-<attr>` 且**值为静态**的属性名。
   *
   * 这类属性的译文由 Angular 在建元素时 `setAttribute` 写进 `attribute`，
   * wxml 若照旧内联源文案就永远翻不了，所以必须改成读
   * `nodeList[i].attribute.<name>` 的绑定。
   *
   * 值含插的那种不在这里——那条走 `ɵɵi18nAttributes` + `setProperty`，
   * 绑定本来就指着 `property`。
   */
  i18nAttrs: string[];
  singleClosedTag: boolean;
  /**
   * `[innerHTML]` 富文本承载。
   *
   * 小程序没有 innerHTML，等价物是 `<rich-text nodes>`，所以容器会把
   * 子节点整段换成一个 `<rich-text nodes="{{...}}"/>`，取值仍走宿主
   * 元素的 `property.innerHTML`（运行时 `setProperty` 天然写在那里）。
   */
  richText: boolean;
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
  /** `[class]` 下推：枝叶挂在 `plan.carrier` 上，不是 `class` */
  wxsClass?: WxsExprPlan;
  /** `[style]` 下推，同上 */
  wxsStyle?: WxsExprPlan;
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
  /**
   * 枝叶数组所在宿主元素的下标。
   *
   * 文本节点带不了数组（`renderStringify` 会把它 join），枝叶由改写层
   * 挂到了宿主元素的合成 property 上，所以取值得用宿主下标。
   */
  wxsHost?: number;
}
export interface NgTextMeta extends NgNodeMeta {
  kind: NgNodeKind.Text;
  value: string;
  /**
   * 这段静态文本属于宿主元素的 `i18n` 消息。
   *
   * 译文只有运行时知道（`$localize` 查表），wxml 里内联源文案就等于
   * **永远翻不了**——不是翻错，是根本不翻。Angular 会为其发一条
   * `ɵɵtext` + `ɵɵi18nApply`，译文落在 `nodeList[i].value` 上，所以这里
   * 必须改成绑定。与 {@link NgElementMeta.i18nAttrs} 是同一个道理。
   *
   * 带插值的消息不在这里：那条在 i18n pass 后已经是 `BoundText`，
   * 绑定本来就指着 `value`。
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
}
