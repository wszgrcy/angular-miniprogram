import type {
  NgBoundTextMeta,
  NgContentMeta,
  NgElementMeta,
  NgNodeMeta,
  NgTemplateMeta,
  NgTextMeta,
} from '../../../mini-program-compiler';
import { MetaCollection } from '../../../mini-program-compiler';
import { tagNameClassOf } from '../../../mini-program-compiler/tag-mapping';
import type { TagNameClassMode } from '../../../mini-program-compiler/tag-mapping';
import { type WxsExprPlan, wxmlLiteral } from '../../../wxs/wxs-expr';
import {
  isNgBoundTextMeta,
  isNgContentMeta,
  isNgElementMeta,
  isNgTemplateMeta,
  isNgTextMeta,
} from '../../util/type-predicate';

export interface WxContainerGlobalConfig {
  seq: string;
  directivePrefix: string;
  eventListConvert: (name: string[]) => string;
  templateInterpolation: [string, string];
  /**
   * 把模板事件名（`tap` / `catch:tap`）映射成小程序属性名（`bind:tap`）。
   * wxs 事件旁路需要自己拼属性值，但属性名必须与普通事件一致。
   */
  eventAttrName: (name: string) => string;
  /** `tag-name-*` 标记的输出策略，见 `tagNameClassOf()` */
  tagNameClass: TagNameClassMode;
}

/**
 * 把翻译计划里的 `@@n@@` 占位换成实际物化路径。
 * 逻辑层只把枝叶数组写到 `base` 上，wxs 在渲染层按下标取。
 */
function wxsSubstitute(wxml: string, base: string): string {
  return wxml.replace(/@@(\d+)@@/g, (_, n) => `${base}[${n}]`);
}

function useWxsPlanModules(plan: WxsExprPlan, use: (m: string) => void): void {
  plan.modules.forEach(use);
}
export class WxContainer {
  private templateStr: string = '';
  private childContainerList: WxContainer[] = [];
  fromTemplate!: string;
  defineTemplateName!: string;
  private metaCollection: MetaCollection = new MetaCollection();
  constructor(private parent?: WxContainer) {}

  private _compileTemplate(node: NgNodeMeta): string {
    if (isNgElementMeta(node)) {
      return this.ngElementTransform(node);
    } else if (isNgBoundTextMeta(node)) {
      return this.ngBoundTextTransform(node);
    } else if (isNgTextMeta(node)) {
      return this.ngTextTransform(node);
    } else if (isNgContentMeta(node)) {
      return this.ngContentTransform(node);
    } else if (isNgTemplateMeta(node)) {
      return this.ngTemplateTransform(node);
    } else {
      throw new Error('未知的ng节点元数据');
    }
  }

  compileNode(node: NgNodeMeta) {
    this.templateStr += this._compileTemplate(node);
  }

  private ngElementTransform(node: NgElementMeta): string {
    if (node.componentMeta) {
      if (node.componentMeta.exportPath) {
        this.metaCollection.libraryPath.add({
          selector: node.componentMeta.selector,
          path: node.componentMeta.exportPath,
          className: node.componentMeta.className,
        });
      } else {
        this.metaCollection.localPath.add({
          path: node.componentMeta.filePath,
          selector: node.componentMeta.selector,
          className: node.componentMeta.className,
        });
      }
    }

    const children = node.richText
      ? [this.richTextChild(node)]
      : node.children.map((child) => this._compileTemplate(child));
    const commonTagProperty = `${this.setComponentIdentification(
      node.componentMeta?.isComponent,
      node.index,
    )} ${this.elementPropertyAndEvent(node, node.index).join(' ')}`;
    if (node.singleClosedTag) {
      return `<${node.tagName} ${commonTagProperty}/>`;
    }
    return `<${node.tagName} ${
      node.tagName === 'block' ? '' : commonTagProperty
    }>${children.join('')}</${node.tagName}>`;
  }
  /**
   * `[innerHTML]` 的 wxml 承载体：原元素保留，子级整段换成
   * `<rich-text nodes="{{...}}"/>`。取值仍走宿主元素的 `property.innerHTML`。
   */
  private richTextChild(node: NgElementMeta): string {
    const base = `nodeList[${node.index}].property.innerHTML`;
    const plan = node.wxsProps?.['innerHTML'];
    if (plan) {
      useWxsPlanModules(plan, (m) => this.useWxsModule(m));
      return `<rich-text nodes="${this.interp(
        wxsSubstitute(plan.wxml, base),
      )}"/>`;
    }
    return `<rich-text nodes="${this.interp(base)}"/>`;
  }

  private ngBoundTextTransform(node: NgBoundTextMeta): string {
    const plan = node.wxsText;
    if (plan) {
      useWxsPlanModules(plan, (m) => this.useWxsModule(m));
      // plan.wxml 已是完整 wxml 文本，只需把占位换成路径；枝叶挂在宿主元素的合成 property 上
      return wxsSubstitute(
        plan.wxml,
        `nodeList[${node.wxsHost ?? node.index}].property.${plan.carrier ?? 'value'}`,
      );
    }
    return this.interp(`nodeList[${node.index}].value`);
  }
  /**
   * 内容投影。无兜底内容时就是一个 `<slot>`。
   * 小程序没有兜底能力，带兜底时改成「兜底容器有没有视图」二选一：
   * Angular 只在插槽空着时才往兜底容器里塞视图，所以 `nodeList[兜底槽].length`
   * 为真就等价于「没投影到东西」。
   * 兜底容器里最多一份视图，直接取 `[0]`，不需要 `wx:for`。
   */
  private ngContentTransform(node: NgContentMeta): string {
    const slot = node.name
      ? `<slot name="${node.name}"></slot>`
      : `<slot></slot>`;
    if (!node.fallback) {
      return slot;
    }
    const { directivePrefix, seq } = WxContainer.globalConfig;
    const templateName = this.defineTemplate(node.fallback);
    return (
      `<block ${directivePrefix}${seq}if="${this.interp(
        `nodeList[${node.fallback.index}].length`,
      )}">` +
      `<template is="${templateName}" ${this.getTemplateDataStr(
        node.fallback.index,
        `0`,
      )}></template>` +
      `</block>` +
      `<block ${directivePrefix}${seq}else>${slot}</block>`
    );
  }
  /**
   * 把嵌入视图的内容编成 `<template name="…">` 定义并登记，返回模板名。
   * 只管定义，实例化形状由调用方决定。
   */
  private defineTemplate(node: NgTemplateMeta): string {
    const defineTemplateName = node.defineTemplateName;
    const childContainer = new WxContainer(this);
    const globalTemplate = this.isGlobalTemplate(node.defineTemplateName);
    if (globalTemplate) {
      if (this.fromTemplate && this.fromTemplate !== globalTemplate) {
        throw new Error(
          `全局ng-template中不可包含其他位置的ng-template,当前为${this.fromTemplate},包含${globalTemplate}`,
        );
      } else if (globalTemplate) {
        childContainer.fromTemplate = globalTemplate;
        childContainer.defineTemplateName = defineTemplateName;
      }
    } else {
      childContainer.fromTemplate = this.fromTemplate;
      childContainer.defineTemplateName = defineTemplateName;
    }
    this.childContainerList.push(childContainer);
    node.children.forEach((childNode) => {
      childContainer.compileNode(childNode);
    });
    if (this.fromTemplate === childContainer.fromTemplate) {
      this.metaCollection.templateList.push({
        name: defineTemplateName,
        content: `<template name="${defineTemplateName}">${childContainer.templateStr}</template>`,
      });
    }
    return defineTemplateName;
  }
  private ngTemplateTransform(node: NgTemplateMeta): string {
    const defineTemplateName = this.defineTemplate(node);
    return `<block ${WxContainer.globalConfig.directivePrefix}${
      WxContainer.globalConfig.seq
    }for="${this.interp(`nodeList[${node.index}]`)}" ${
      WxContainer.globalConfig.directivePrefix
    }${WxContainer.globalConfig.seq}key="index">
      <template is="${this.interp(
        `item.__templateName||'${defineTemplateName}'`,
      )}" ${this.getTemplateDataStr(node.index, `index`)}></template>
      </block>`;
  }
  /**
   * 静态文本节点。不带 `i18n` 时烘成字面量；带 `i18n` 时必须改成绑定，
   * 因为译文在 `nodeList[i].value` 上。
   */
  private ngTextTransform(node: NgTextMeta): string {
    return node.i18n
      ? this.interp(`nodeList[${node.index}].value`)
      : `${node.value}`;
  }

  private getTemplateDataStr(directiveIndex: number, indexName: string) {
    return `data="${this.interp(
      `...nodeList[${directiveIndex}][${indexName}] `,
    )}"`;
  }

  /**
   * 包一层 wxml 插值。所有 wxml 插值都走这里，把「插值长什么样」收拢到一个出口，
   * 库构建需要特殊处理时只改 `templateInterpolation` 一处。
   */
  private interp(text: string): string {
    const [open, close] = WxContainer.globalConfig.templateInterpolation;
    return `${open}${text}${close}`;
  }

  export(): { wxmlTemplate: string } {
    return {
      wxmlTemplate: this.templateStr,
    };
  }

  private setComponentIdentification(
    isComponent: boolean | undefined,
    nodeIndex: number | undefined,
  ) {
    if (isComponent) {
      return `nodePath="${this.interp('nodePath')}" nodeIndex="${nodeIndex}"`;
    }
    return ``;
  }

  private elementPropertyAndEvent(node: NgElementMeta, index: number) {
    const propertyMap = new Map<string, string>();
    const attributeMap = new Map<string, string>();
    const wxsProps = node.wxsProps || {};

    /**
     * 属性值表达式：命中下推时走渲染层翻译结果，否则走物化路径。
     * 下推后 `property.<key>` 存的是枝叶数组而不是最终值，同一个 key 只会走一条路。
     */
    const propExpr = (key: string): string => {
      const plan = wxsProps[key];
      if (plan) {
        useWxsPlanModules(plan, (m) => this.useWxsModule(m));
        // 只返回裸表达式，`{{ }}` 由容器统一包
        return wxsSubstitute(plan.wxml, `nodeList[${index}].property.${key}`);
      }
      return `nodeList[${index}].property.${key}`;
    };

    /**
     * class / style 下推。`[class]` / `[style]` 整体绑定本来就是普通 property，
     * 走同一套 `setProperty` 通道。静态部分用字符串相加合并：class 用 `' '`，style 用 `';'`。
     * 没用到这个通道的元素整个属性都不输出。
     */
    const tagClass = tagNameClassOf(
      node.sourceTag,
      node.tagName,
      WxContainer.globalConfig.tagNameClass,
    );
    const classPlan = node.wxsClass ?? wxsProps['class'];
    if (classPlan) {
      useWxsPlanModules(classPlan, (m) => this.useWxsModule(m));
      const expr = wxsSubstitute(
        classPlan.wxml,
        `nodeList[${index}].property.${classPlan.carrier ?? 'class'}`,
      );
      propertyMap.set(
        'class',
        node.staticClass
          ? `${expr} + ' ' + ${wxmlLiteral(node.staticClass)}`
          : expr,
      );
    } else if (node.needsClass) {
      propertyMap.set('class', `nodeList[${index}].class`);
    }

    /**
     * 可查询 class。只给带 `#` 的元素拼，数据侧也只在那种节点上发这个字段。
     * 拼在末尾、单独一个 `|| ''` 兜底：数据没送到时丢的只是一个查询能力，
     * 不会把 `undefined` 拼成假 class。
     */
    if (node.hasRef) {
      propertyMap.set(
        'class',
        `(${propertyMap.get('class')} || '') + ' ' + (nodeList[${index}].refClass || '')`,
      );
    }

    const stylePlan = node.wxsStyle ?? wxsProps['style'];
    if (stylePlan) {
      useWxsPlanModules(stylePlan, (m) => this.useWxsModule(m));
      const expr = wxsSubstitute(
        stylePlan.wxml,
        `nodeList[${index}].property.${stylePlan.carrier ?? 'style'}`,
      );
      propertyMap.set(
        'style',
        node.staticStyle
          ? `${expr} + ';' + ${wxmlLiteral(node.staticStyle)}`
          : expr,
      );
    } else if (node.needsStyle) {
      propertyMap.set('style', `nodeList[${index}].style`);
    }
    Object.entries(node.attributes)
      .filter(([key, value]) => value !== '')
      .forEach(([key, value]) => {
        attributeMap.set(key, value);
      });
    /**
     * 静态 `i18n-<attr>` 的属性必须从字面量改成绑定：译文只有运行时知道，
     * Angular 把它 `setAttribute` 到 `attribute` 上，这里改读那个通道。
     * 值含插值的不在列，那条已经走 `property`。
     */
    for (const name of node.i18nAttrs ?? []) {
      if (attributeMap.has(name)) {
        attributeMap.delete(name);
        propertyMap.set(name, `nodeList[${index}].attribute.${name}`);
      }
    }
    node.inputs
      .filter(
        (property) =>
          !(
            (node.componentMeta?.inputs?.includes(property) ||
              node.directiveMeta?.inputs?.includes(property)) &&
            !(
              node.directiveMeta?.properties?.includes(property) ||
              node.componentMeta?.properties?.includes(property)
            )
          ),
      )
      .filter((key) => !/^(class\.?|style\.?)/.test(key))
      .forEach((key) => {
        propertyMap.set(key, propExpr(key));
      });
    [
      ...(node.directiveMeta?.properties || []),
      ...(node.componentMeta?.properties || []),
    ]
      .filter((key) => !/^(class\.?|style\.?)/.test(key))
      .forEach((key) => {
        propertyMap.set(key, propExpr(key));
      });
    /**
     * `tag-name-*` 标记。有 class 绑定时拼在绑定前面，没绑定时直接是字面量 class。
     */
    if (tagClass && !propertyMap.has('class')) {
      attributeMap.set('class', tagClass);
    }

    const wxsEvents = node.wxsEvents || {};
    const eventList: string[] = [
      ...node.outputs.filter(
        (item) =>
          !(
            node.componentMeta?.outputs.some((output) => output === item) ||
            node.directiveMeta?.outputs.some((output) => output === item)
          ),
      ),
      ...(node.directiveMeta?.listeners || []),
      ...(node.componentMeta?.isComponent ? node.componentMeta.listeners : []),
    ].filter((item) => !wxsEvents[item]);

    const result = WxContainer.globalConfig.eventListConvert(eventList);
    if (result) {
      propertyMap.set(`data-node-path`, `nodePath`);
      propertyMap.set(`data-node-index`, `${index}`);
    }

    /**
     * 下推到渲染层的事件：直接绑 wxs 函数，不生成 `data-node-*`，整条事件在视图层闭环。
     */
    const wxsEventAttrs = Object.keys(wxsEvents)
      .map((eventName) => {
        const handler = wxsEvents[eventName];
        this.useWxsModule(handler.module);
        return `${WxContainer.globalConfig.eventAttrName(
          eventName,
        )}="{{${handler.module}.${handler.fn}}}"`;
      })
      .join(' ');

    return [
      ...Array.from(attributeMap.entries()).map(
        ([key, value]) => `${key}="${value}"`,
      ),
      ...Array.from(propertyMap.entries()).map(([key, value]) =>
        key === 'class' && tagClass
          ? `class="${tagClass} ${this.interp(value)}"`
          : `${key}="${this.interp(value)}"`,
      ),
      result,
      wxsEventAttrs,
    ];
  }
  /**
   * 本模板用到的 wxs 模块名，由产出过程收集，最后由 transform 在 wxml 头部补
   * `<wxs module="x" src="./x.wxs"/>`。
   */
  usedWxsModules = new Set<string>();

  private useWxsModule(name: string): void {
    this.usedWxsModules.add(name);
    this.childContainerList.forEach((c) => c.usedWxsModules.add(name));
  }

  /** 含子容器汇总，供头部注入使用 */
  collectWxsModules(into: Set<string> = new Set<string>()): Set<string> {
    this.usedWxsModules.forEach((m) => into.add(m));
    this.childContainerList.forEach((c) => c.collectWxsModules(into));
    return into;
  }

  static globalConfig: WxContainerGlobalConfig;
  static initWxContainerFactory(globalConfig: WxContainerGlobalConfig) {
    this.globalConfig = globalConfig;
  }
  private isGlobalTemplate(name: string) {
    const result = name.match(/^\$\$mp\$\$([^$]+)\$\$(.*)/);
    if (!result) {
      return undefined;
    }
    return result[1];
  }
  exportMetaCollectionGroup() {
    const obj: Record<string, MetaCollection> = {};
    if (!this.fromTemplate) {
      obj.$inline = obj.$inline || new MetaCollection();
      obj.$inline.merge(this.metaCollection);
    } else if (this.fromTemplate == '__self__') {
      obj.$self = obj.$self || new MetaCollection();
      obj.$self.merge(this.metaCollection);
      obj.$self.templateList.push({
        name: this.defineTemplateName,
        content: `<template name="${this.defineTemplateName}">${this.templateStr}</template>`,
      });
    } else {
      obj[this.fromTemplate] = obj[this.fromTemplate] || new MetaCollection();
      obj[this.fromTemplate].merge(this.metaCollection);
      obj[this.fromTemplate].templateList.push({
        name: this.defineTemplateName,
        content: `<template name="${this.defineTemplateName}">${this.templateStr}</template>`,
      });
    }
    this.childContainerList.forEach((container) => {
      const result = container.exportMetaCollectionGroup();
      for (const key in result) {
        if (Object.prototype.hasOwnProperty.call(result, key)) {
          const element = result[key];
          obj[key] = obj[key] || new MetaCollection();
          obj[key].merge(element);
        }
      }
    });
    return obj;
  }
}
