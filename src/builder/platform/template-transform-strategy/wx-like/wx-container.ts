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
import type { MetaCollection } from './type';

export interface WxContainerGlobalConfig {
  seq: string;
  directivePrefix: string;
  eventNameConvert: (name: string) => string;
}
export class WxContainer {
  private exportTemplateList: { name: string; content: string }[] = [];
  private wxmlTemplate: string = '';
  private childContainer: WxContainer[] = [];
  private level: number = 0;
  constructor(
    private metaCollection: MetaCollection,
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
    return `<${node.tagName} ${commonTagProperty}>${children.join('')}</${
      node.tagName
    }>`;
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

    const container = new WxContainer(
      this.metaCollection,
      `${this.containerName}_${this.level++}`,
      this
    );
    this.childContainer.push(container);
    node.children.forEach((childNode) => {
      container.compileNode(childNode);
    });
    this.exportTemplateList.push({
      name: defineTemplateName,
      content: `<template name="${defineTemplateName}">${container.wxmlTemplate}</template>`,
    });

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
    return `data="{{...nodeList[${directiveIndex}][${indexName}] }}"`;
  }
  getExportTemplate(): {
    name: string;
    content: string;
  }[] {
    return [
      ...this.exportTemplateList,
      ...this.childContainer.map((child) => child.getExportTemplate()).flat(),
    ];
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
            node.componentMeta?.inputs.some((input) => input === property) ||
            node.directiveMeta?.inputs.some((input) => input === property)
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
    const eventMap = new Map();
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

    const mergeEventMap = new Map<string, string[]>();
    eventList
      // .filter((eventName) => !eventMap.has(eventName))
      .forEach((eventName) => {
        const convertName =
          WxContainer.globalConfig.eventNameConvert(eventName);
        if (
          eventMap.has(convertName) &&
          !mergeEventMap.get(convertName)!.includes(eventName)
        ) {
          mergeEventMap.get(convertName)!.push(eventName);
          return;
        }
        const methodName = `${this.containerName}_${index}_${eventName}`;
        eventMap.set(convertName, methodName);

        const eventList = [eventName];
        mergeEventMap.set(convertName, eventList);
        this.metaCollection.listeners.push({
          methodName: methodName,
          eventName: eventList,
          index: index,
        });
        propertyMap.set(`data-node-path`, `componentPath`);
        propertyMap.set(`data-node-index`, `${index}`);
      });
    return [
      ...Array.from(attributeMap.entries()).map(
        ([key, value]) => `${key}="${value}"`
      ),
      ...Array.from(propertyMap.entries()).map(
        ([key, value]) => `${key}="{{${value}}}"`
      ),
      ...Array.from(eventMap.entries()).map(
        ([key, value]) => `${key}="${value}"`
      ),
    ];
  }
  static globalConfig: WxContainerGlobalConfig;
  static initWxContainerFactory(globalConfig: WxContainerGlobalConfig) {
    this.globalConfig = globalConfig;
  }
}
