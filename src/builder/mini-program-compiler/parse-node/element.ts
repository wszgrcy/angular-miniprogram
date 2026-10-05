/* eslint-disable @typescript-eslint/no-explicit-any */
import { BindingType } from '@angular/compiler';
import type { Element } from '../../angular-internal/ast.type';
import {
  WxsHandlerMeta,
  containsWxsRoot,
  matchWxsHandler,
} from '../../wxs/wxs-call';
import type { DeclaredWxsModules } from '../../wxs/wxs-call';
import { isWxsCarrier } from '../../wxs/wxs-expr';
import type { WxsExprPlan } from '../../wxs/wxs-expr';
import { getDeclaredWxs, getWxsPlan } from '../../wxs/wxs-rewrite';
import { parseMpEvent } from '../event-name';
import { mapAngularTagToWxml } from '../tag-mapping';
import { ComponentContext } from './component-context';
import { NgElementMeta, NgNodeKind, NgNodeMeta, ParsedNode } from './interface';
import type { MatchedComponent, MatchedDirective } from './type';

export class ParsedNgElement implements ParsedNode<NgElementMeta> {
  private tagName!: string;
  private children: ParsedNode<NgNodeMeta>[] = [];
  attributeObject: Record<string, string> = {};
  /** 模板上写死的 class，下推时参与合并 */
  staticClass = '';
  /** 模板上写死的 style，下推时参与合并 */
  staticStyle = '';
  /**
   * 开始标签上带了 `#xxx`（模板引用变量）。
   *
   * 只有这种节点需要可查询 class，详见 `NgElementMeta.hasRef`。
   */
  hasRef = false;
  kind = NgNodeKind.Element;
  inputs: string[] = [];
  outputs: string[] = [];
  singleClosedTag = false;
  /** `[innerHTML]` 命中：子节点交给 `<rich-text nodes>` 承载 */
  richText = false;
  wxsProps: Record<string, WxsExprPlan> = {};
  /** `[class]` 下推计划（已改挂到合成 property，所以不就在 wxsProps 里） */
  wxsClass?: WxsExprPlan;
  /** `[style]` 下推计划，同上 */
  wxsStyle?: WxsExprPlan;
  wxsEvents: Record<string, WxsHandlerMeta> = {};
  constructor(
    private node: Element,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    private componentMeta: MatchedComponent | undefined,
    public index: number,
    private directiveMeta: MatchedDirective | undefined,
    /**
     * 已声明的 wxs 模块集合。由 TemplateDefinition 注入（它从
     * ComponentContext 拿，能自动穿过嵌套子模板）。
     * 没注入时退回按组件源文件反查。
     */
    private declaredWxs?: DeclaredWxsModules,
    /** 静态 `i18n-<attr>` 的属性名，见 `NgElementMeta.i18nAttrs` */
    private i18nAttrs: string[] = [],
    /**
     * 开始标签上带了裸 `i18n`（不是 `i18n-xxx`）。
     *
     * 子级里的静态文本因此变成运行时文本节点，见 `NgTextMeta.i18n`。
     * 公开是因为 `visitText` 只能从 `parentNode` 读到它。
     */
    public i18nHost = false,
  ) {}
  private analysis() {
    this.getTagName();
    this.hasRef = (this.node.references?.length ?? 0) > 0;
    // 静态 class / style 单独捕获：它们不进 attributeObject（会被
    // 当成普通属性重复输出），但 class/style 下推时需要它们参与
    // 合并——否则 `class="a" [class]="wxs.f()"` 会把静态类抹掉。
    this.staticClass =
      this.node.attributes.find((item) => item.name === 'class')?.value ?? '';
    this.staticStyle =
      this.node.attributes.find((item) => item.name === 'style')?.value ?? '';
    this.node.attributes
      .filter((item) => item.name !== 'class' && item.name !== 'style')
      .forEach((item) => {
        this.attributeObject[item.name] = item.value;
      });

    this.node.inputs.forEach((input) => {
      if (input.type !== BindingType.Property) {
        return;
      }
      this.collectWxsProp(input);
      // 合成承载 property 只是枝叶数组的运输通道，不是业务属性，
      // 落到 wxml 上只会多一条无用的 `__wxXXXX="{{...}}"`
      if (isWxsCarrier(input.name)) {
        return;
      }
      // `innerHTML` 不落到宿主标签上：小程序没有这个属性，值由子级的
      // `<rich-text nodes>` 消费。数据链路不变，仍走 property 通道。
      if (this.isRichTextHost && input.name === 'innerHTML') {
        this.richText = true;
        return;
      }
      this.inputs.push(input.name);
    });
    this.node.outputs.forEach((output) => {
      // `(tap.stop)` 之类的小程序修饰符在这里落地成 `catch:tap`。
      // 修饰符只存在于模板写法，wxml 与逻辑层监听键都得用解析后的名字，
      // 所以解析一次，两边共用。
      const event = parseMpEvent(output.name, {
        isOwnEvent: this.isOwnEvent(output.name),
      });
      this.outputs.push(event.name);
      this.collectWxsEvent(output, event.name);
    });

    if (
      !this.node.endSourceSpan ||
      this.node.startSourceSpan.end.offset ===
        this.node.endSourceSpan.end.offset
    ) {
      this.singleClosedTag = true;
    }
  }
  /**
   * 只有普通元素才把 `[innerHTML]` 当富文本处理。
   *
   * 组件/指令自己声明的 `innerHTML` @Input 是业务属性，不该被劫持。
   */
  private get isRichTextHost() {
    return !this.componentMeta && !this.directiveMeta;
  }

  /**
   * 这个事件名是不是宿主自己声明的。
   *
   * 自定义组件（以及声明了同名 `@Output` 的指令）上的 `click` 是它自己的
   * 输出，不是原生 tap，映射成 tap 就把这条绑定解掉了。
   */
  private isOwnEvent(name: string): boolean {
    return (
      !!this.componentMeta ||
      this.directiveMeta?.outputs.includes(name) === true
    );
  }

  private getTagName() {
    // 映射规则抽到 tag-mapping.ts 作为唯一真相源，
    // 等价性测试要用同一套规则交叉校验两端标签。
    this.tagName = mapAngularTagToWxml(this.node.name);
  }

  /**
   * 属性绑定下推。
   *
   * 表达式已由 `rewriteWxsTemplates` 换成枝叶数组，这里只是把
   * 当时存下的翻译计划取回来交给容器生成 wxml。
   */
  private collectWxsProp(input: Element['inputs'][number]): void {
    const plan = getWxsPlan((input as any).value);
    if (!plan) {
      return;
    }
    // class / style 在改写层已被改名为合成 property，这里归位
    if (plan.origin === 'class') {
      this.wxsClass = plan;
      return;
    }
    if (plan.origin === 'style') {
      this.wxsStyle = plan;
      return;
    }
    // 文本插值的枝叶挂在宿主元素上，归 bound-text 自己负贵，这里不重复登记
    if (plan.origin === 'text') {
      return;
    }
    this.wxsProps[input.name] = plan;
  }

  /**
   * 事件下推到渲染层。
   *
   * 命中后 wxml 直接 `bind:tap="{{mod.fn}}"`，不再输出
   * `data-node-index` + `bindEvent`，整条事件链路不过桥。
   */
  private collectWxsEvent(
    output: Element['outputs'][number],
    eventName: string,
  ): void {
    const declared =
      this.declaredWxs ?? getDeclaredWxs(this.componentMeta?.filePath);
    if (!declared.size) {
      return;
    }
    const ast = (output as any).handler?.ast;
    const handler = matchWxsHandler(ast, declared);
    if (handler) {
      this.wxsEvents[eventName] = handler;
      return;
    }
    if (containsWxsRoot(ast, declared)) {
      throw new Error(
        `wxs 事件处理器必须是不带调用的成员引用：` +
          `(${output.name})="mod.fn"，不能写 (${output.name})="mod.fn(...)"。` +
          `位置: ${spanOf(output)}`,
      );
    }
  }

  appendNgNodeChild(child: ParsedNode<NgNodeMeta>) {
    this.children.push(child);
  }
  getNodeMeta(): NgElementMeta {
    this.analysis();

    return {
      kind: NgNodeKind.Element,
      tagName: this.tagName,
      // 命中富文本时子节点整段丢弃：声明槽位已由 TemplateDefinition 计过，
      // 这里只是不再为它们产出 wxml，后续节点的下标不受影响。
      children: this.richText ? [] : this.children.map((c) => c.getNodeMeta()),
      inputs: this.inputs,
      i18nAttrs: this.i18nAttrs,
      outputs: this.outputs,
      attributes: this.attributeObject,
      staticClass: this.staticClass,
      staticStyle: this.staticStyle,
      hasRef: this.hasRef,
      singleClosedTag: this.richText ? false : this.singleClosedTag,
      richText: this.richText,
      componentMeta: this.componentMeta,
      index: this.index,
      directiveMeta: this.directiveMeta,
      ...(Object.keys(this.wxsProps).length
        ? { wxsProps: this.wxsProps }
        : null),
      ...(this.wxsClass ? { wxsClass: this.wxsClass } : null),
      ...(this.wxsStyle ? { wxsStyle: this.wxsStyle } : null),
      ...(Object.keys(this.wxsEvents).length
        ? { wxsEvents: this.wxsEvents }
        : null),
    };
  }
}

function spanOf(node: any): string {
  return (
    node?.sourceSpan?.toString?.() ??
    node?.value?.sourceSpan?.toString?.() ??
    '未知'
  );
}
