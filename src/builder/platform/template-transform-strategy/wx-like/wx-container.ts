import { strings } from '@angular-devkit/core';
import { MetaCollection } from '../../../html/meta-collection';
import type {
  NgBoundTextMeta,
  NgContentMeta,
  NgElementMeta,
  NgNodeMeta,
  NgTemplateMeta,
  NgTextMeta,
} from '../../../html/node-handle/interface';
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
}
export class WxContainer {
  private wxmlTemplate: string = '';
  private childContainer: WxContainer[] = [];
  private level: number = 0;
  // todo 如果是全局模板,声明来自哪个,并且追加
  // todo 声明位置默认先不加,如果有两用再追加
  // todo 需要暴露组件
  fromTemplate!: string;
  defineTemplateName!: string;
  private metaCollection: MetaCollection = new MetaCollection();
  constructor(
    private containerName = 'container',
    private parent?: WxContainer
  ) {}

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
    this.wxmlTemplate += this._compileTemplate(node);
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

    const children = node.children.map((child) => this._compileTemplate(child));
    const commonTagProperty = `${this.setComponentIdentification(
      node.componentMeta?.isComponent,
      node.index
    )} ${this.elementPropertyAndEvent(node, node.index).join(' ')}`;
    if (node.singleClosedTag) {
      return `<${node.tagName} ${commonTagProperty}/>`;
    }
    return `<${node.tagName} ${
      node.tagName === 'block' ? '' : commonTagProperty
    }>${children.join('')}</${node.tagName}>`;
  }
  private ngBoundTextTransform(node: NgBoundTextMeta): string {
    return `{{nodeList[${node.index}].value}}`;
  }
  private ngContentTransform(node: NgContentMeta): string {
    return node.name ? `<slot name="${node.name}"></slot>` : `<slot></slot>`;
  }
  private ngTemplateTransform(node: NgTemplateMeta): string {
    let content = '';
    const defineTemplateName = node.defineTemplateName;
    // todo这里追加
    const container = new WxContainer(
      `${this.containerName}_${this.level++}`,
      this
    );
    const globalTemplate = this.isGlobalTemplate(node.defineTemplateName);
    if (globalTemplate) {
      if (this.fromTemplate && this.fromTemplate !== globalTemplate) {
        throw new Error('全局ng-template中不可包含其他位置的ng-template');
      } else if (globalTemplate) {
        container.fromTemplate = globalTemplate;
        container.defineTemplateName = defineTemplateName;
      }
    } else {
      container.fromTemplate = this.fromTemplate;
      container.defineTemplateName = defineTemplateName;
    }
    this.childContainer.push(container);
    node.children.forEach((childNode) => {
      container.compileNode(childNode);
    });
    if (this.fromTemplate === container.fromTemplate) {
      this.metaCollection.templateList.push({
        name: defineTemplateName,
        content: `<template name="${defineTemplateName}">${container.wxmlTemplate}</template>`,
      });
    }

    content += `<block ${WxContainer.globalConfig.directivePrefix}${
      WxContainer.globalConfig.seq
    }for="{{nodeList[${node.index}]}}" ${
      WxContainer.globalConfig.directivePrefix
    }${WxContainer.globalConfig.seq}key="index">
      <template is="{{item.__templateName||'${defineTemplateName}'}}" ${this.getTemplateDataStr(
      node.index,
      `index`
    )}></template>
      </block>`;

    return content;
  }
  private ngTextTransform(node: NgTextMeta): string {
    return `{{nodeList[${node.index}].value}}`;
  }

  private getTemplateDataStr(directiveIndex: number, indexName: string) {
    return `data="${WxContainer.globalConfig.templateInterpolation[0]}...nodeList[${directiveIndex}][${indexName}] ${WxContainer.globalConfig.templateInterpolation[1]}"`;
  }

  export(): { wxmlTemplate: string } {
    return {
      wxmlTemplate: this.wxmlTemplate,
    };
  }

  private setComponentIdentification(
    isComponent: boolean | undefined,
    nodeIndex: number | undefined
  ) {
    if (isComponent) {
      return `componentPath="{{componentPath}}" nodeIndex="${nodeIndex}"`;
    }
    return ``;
  }

  private elementPropertyAndEvent(node: NgElementMeta, index: number) {
    const propertyMap = new Map<string, string>();
    const attributeMap = new Map<string, string>();
    propertyMap.set('class', `nodeList[${index}].class`);
    propertyMap.set('style', `nodeList[${index}].style`);
    Object.entries(node.attributes)
      .filter(([key]) => key !== 'class' && key !== 'style')
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
          )
      )
      .forEach((key) => {
        propertyMap.set(key, `nodeList[${index!}].property.${key}`);
      });
    [
      ...(node.directiveMeta?.properties || []),
      ...(node.componentMeta?.properties || []),
    ]
      .filter((key) => !/^(class\.|style\.)/.test(key))
      .forEach((key) => {
        propertyMap.set(key, `nodeList[${index!}].property.${key}`);
      });
    // const eventMap = new Map();
    const eventList: string[] = [
      ...node.outputs
        .filter(
          (item) =>
            !(
              node.componentMeta?.outputs.some(
                (output) => output === item.name
              ) ||
              node.directiveMeta?.outputs.some((output) => output === item.name)
            )
        )
        .map((item) => item.name),
      ...(node.directiveMeta?.listeners || []),
      ...(node.componentMeta?.isComponent ? node.componentMeta?.listeners : []),
    ];

    const result = WxContainer.globalConfig.eventListConvert(eventList);
    if (result) {
      propertyMap.set(`data-node-path`, `componentPath`);
      propertyMap.set(`data-node-index`, `${index}`);
    }
    return [
      ...Array.from(attributeMap.entries()).map(
        ([key, value]) => `${key}="${value}"`
      ),
      ...Array.from(propertyMap.entries()).map(
        ([key, value]) => `${key}="{{${value}}}"`
      ),
      result,
    ];
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
        content: `<template name="${this.defineTemplateName}">${this.wxmlTemplate}</template>`,
      });
    } else {
      obj[this.fromTemplate] = obj[this.fromTemplate] || new MetaCollection();
      obj[this.fromTemplate].merge(this.metaCollection);
      obj[this.fromTemplate].templateList.push({
        name: this.defineTemplateName,
        content: `<template name="${this.defineTemplateName}">${this.wxmlTemplate}</template>`,
      });
    }
    this.childContainer.forEach((container) => {
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
