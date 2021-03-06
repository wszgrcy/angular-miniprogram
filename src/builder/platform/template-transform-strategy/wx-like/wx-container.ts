import type {
  NgBoundTextMeta,
  NgContentMeta,
  NgElementMeta,
  NgNodeMeta,
  NgTemplateMeta,
  NgTextMeta,
} from '../../../mini-program-compiler';
import { MetaCollection } from '../../../mini-program-compiler';
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
    const childContainer = new WxContainer(this);
    const globalTemplate = this.isGlobalTemplate(node.defineTemplateName);
    if (globalTemplate) {
      if (this.fromTemplate && this.fromTemplate !== globalTemplate) {
        throw new Error(
          `全局ng-template中不可包含其他位置的ng-template,当前为${this.fromTemplate},包含${globalTemplate}`
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
    return `${node.value}`;
  }

  private getTemplateDataStr(directiveIndex: number, indexName: string) {
    return `data="${WxContainer.globalConfig.templateInterpolation[0]}...nodeList[${directiveIndex}][${indexName}] ${WxContainer.globalConfig.templateInterpolation[1]}"`;
  }

  export(): { wxmlTemplate: string } {
    return {
      wxmlTemplate: this.templateStr,
    };
  }

  private setComponentIdentification(
    isComponent: boolean | undefined,
    nodeIndex: number | undefined
  ) {
    if (isComponent) {
      return `nodePath="{{nodePath}}" nodeIndex="${nodeIndex}"`;
    }
    return ``;
  }

  private elementPropertyAndEvent(node: NgElementMeta, index: number) {
    const propertyMap = new Map<string, string>();
    const attributeMap = new Map<string, string>();
    propertyMap.set('class', `nodeList[${index}].class`);
    propertyMap.set('style', `nodeList[${index}].style`);
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
          )
      )
      .filter((key) => !/^(class\.?|style\.?)/.test(key))
      .forEach((key) => {
        propertyMap.set(key, `nodeList[${index!}].property.${key}`);
      });
    [
      ...(node.directiveMeta?.properties || []),
      ...(node.componentMeta?.properties || []),
    ]
      .filter((key) => !/^(class\.?|style\.?)/.test(key))
      .forEach((key) => {
        propertyMap.set(key, `nodeList[${index!}].property.${key}`);
      });
    const eventList: string[] = [
      ...node.outputs.filter(
        (item) =>
          !(
            node.componentMeta?.outputs.some((output) => output === item) ||
            node.directiveMeta?.outputs.some((output) => output === item)
          )
      ),
      ...(node.directiveMeta?.listeners || []),
      ...(node.componentMeta?.isComponent ? node.componentMeta.listeners : []),
    ];

    const result = WxContainer.globalConfig.eventListConvert(eventList);
    if (result) {
      propertyMap.set(`data-node-path`, `nodePath`);
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
