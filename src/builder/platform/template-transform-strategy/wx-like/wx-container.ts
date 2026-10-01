import type {
  NgBoundTextMeta,
  NgContentMeta,
  NgElementMeta,
  NgNodeMeta,
  NgTemplateMeta,
  NgTextMeta,
} from '../../../mini-program-compiler';
import { MetaCollection } from '../../../mini-program-compiler';
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
}

/**
 * 把翻译计划里的 `@@n@@` 占位换成实际物化路径。
 *
 * 逻辑层只负责把枝叶数组写到 `base` 上，wxs 在渲染层按下标取。
 * 这是「逻辑层→渲染层」单向数据通道的具体形态：
 * 渲染层拿得到枝叶，但它的返回值逻辑层永远拿不到。
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
   * `[innerHTML]` 的 wxml 承载体。
   *
   * 对齐 uni-app 的 `v-html`：原元素保留，子级整段换成
   * `<rich-text nodes="{{...}}"/>`。取值仍走宿主元素的
   * `property.innerHTML`（`renderer.setProperty` 天然写在那里），
   * 所以运行时不需要任何特例。
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
      // plan.wxml 已是完整 wxml 文本（含 {{}} 块与前后缀字面文本），
      // 只需把占位换成路径，不再走框架默认的 {{nodeList[i].value}}。
      // 枝叶挂在宿主元素的合成 property 上，不是本文本节点的 value。
      return wxsSubstitute(
        plan.wxml,
        `nodeList[${node.wxsHost ?? node.index}].property.${plan.carrier ?? 'value'}`,
      );
    }
    return this.interp(`nodeList[${node.index}].value`);
  }
  private ngContentTransform(node: NgContentMeta): string {
    return node.name ? `<slot name="${node.name}"></slot>` : `<slot></slot>`;
  }
  private ngTemplateTransform(node: NgTemplateMeta): string {
    let content = '';
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

    content += `<block ${WxContainer.globalConfig.directivePrefix}${
      WxContainer.globalConfig.seq
    }for="${this.interp(`nodeList[${node.index}]`)}" ${
      WxContainer.globalConfig.directivePrefix
    }${WxContainer.globalConfig.seq}key="index">
      <template is="${this.interp(
        `item.__templateName||'${defineTemplateName}'`,
      )}" ${this.getTemplateDataStr(node.index, `index`)}></template>
      </block>`;

    return content;
  }
  private ngTextTransform(node: NgTextMeta): string {
    return `${node.value}`;
  }

  private getTemplateDataStr(directiveIndex: number, indexName: string) {
    return `data="${this.interp(
      `...nodeList[${directiveIndex}][${indexName}] `,
    )}"`;
  }

  /**
   * 包一层 wxml 插值。
   *
   * **所有 wxml 插值必须走这里**，不要直接写 `{{ }}` 字面量。
   *
   * 目的是把「wxml 插值长什么样」收收拢到一个出口：将来无论换分隔符、
   * 还是库构建需要特殊处理，只改 `templateInterpolation` 一处就行。
   *
   * 注：库模板用 `${}` 作插槽分隔符，与 wxml 的 `{{ }}` 不撞，所以
   * `LibraryTransform` **不需要**覆盖 `templateInterpolation`。
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
     *
     * 下推后 `property.<key>` 存的是**枝叶数组**而不是最终值
     * （最终值在渲染层算），所以同一个 key 只会走一条路，不冲突。
     * 框架的 `diffNodeData` 对数组做结构化比较，数组未变则不重发。
     */
    const propExpr = (key: string): string => {
      const plan = wxsProps[key];
      if (plan) {
        useWxsPlanModules(plan, (m) => this.useWxsModule(m));
        // 只返回裸表达式，`{{ }}` 由容器统一包，与普通路径一致。
        return wxsSubstitute(plan.wxml, `nodeList[${index}].property.${key}`);
      }
      return `nodeList[${index}].property.${key}`;
    };

    /**
     * class / style 下推。
     *
     * `[class]` / `[style]` 整体绑定在 Angular 里本来就是 type=0 Property
     * （name 就是 `class`/`style`），走的是和 `foo` 完全相同的
     * `setProperty` 通道——所以改写层根本不需要为它们特事特办，
     * 只是容器原先把这两个 key 硬编码成了 AgentNode 的聚合串。
     *
     * 静态部分按 uni-app 的方式合并：class 进数组，style 用 `+ ';' +` 串。
     */
    const classPlan = node.wxsClass ?? wxsProps['class'];
    if (classPlan) {
      useWxsPlanModules(classPlan, (m) => this.useWxsModule(m));
      const expr = wxsSubstitute(
        classPlan.wxml,
        `nodeList[${index}].property.${classPlan.carrier ?? 'class'}`,
      );
      propertyMap.set(
        'class',
        node.staticClass ? `[${expr}, ${wxmlLiteral(node.staticClass)}]` : expr,
      );
    } else {
      propertyMap.set('class', `nodeList[${index}].class`);
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
    } else {
      propertyMap.set('style', `nodeList[${index}].style`);
    }
    Object.entries(node.attributes)
      .filter(([key, value]) => value !== '')
      .forEach(([key, value]) => {
        attributeMap.set(key, value);
      });
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
     * 下推到渲染层的事件：直接绑 wxs 函数，不生成 `data-node-*`，
     * 也就不进 `bindEvent` 的反查链路。整条事件在视图层闭环。
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
      ...Array.from(propertyMap.entries()).map(
        ([key, value]) => `${key}="${this.interp(value)}"`,
      ),
      result,
      wxsEventAttrs,
    ];
  }
  /**
   * 本模板用到的 wxs 模块名。
   *
   * 由产出过程收集，最后由 transform 负贡在 wxml 头部补
   * `<wxs module="x" src="./x.wxs"/>`，并驱动资源产出。
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
