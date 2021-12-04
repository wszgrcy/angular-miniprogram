import type {
  NgBoundTextMeta,
  NgContentMeta,
  NgElementMeta,
  NgNodeMeta,
  NgTemplateMeta,
  NgTextMeta,
} from '../../../html/node-handle/interface';
import type { MatchedDirective } from '../../../html/node-handle/type';
import {
  isNgBoundTextMeta,
  isNgContentMeta,
  isNgElementMeta,
  isNgTemplateMeta,
  isNgTextMeta,
} from '../../util/type-predicate';
import type { MetaCollection } from './type';

export class WxContainer {
  directivePrefix!: string;
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
    const directiveList = node.directive;

    for (let i = 0; i < directiveList.length; i++) {
      const directive = directiveList[i];
      if (directive.type === 'none') {
        const container = new WxContainer(
          this.metaCollection,
          `${this.containerName}_${this.level++}`,
          this
        );
        this.childContainer.push(container);
        container.directivePrefix = this.directivePrefix;
        node.children.forEach((childNode) => {
          container.compileNode(childNode);
        });
        this.exportTemplateList.push({
          name: directive.name[0].name,
          content: `<template name="${directive.name[0].name}">${container.wxmlTemplate}</template>`,
        });
      } else if (directive.type === 'if') {
        if (directive.thenTemplateRef) {
          content += `<block ${this.directivePrefix}:if="{{nodeList[${
            node.index
          }][0].context.$implicit}}"><template is="${
            directive.thenTemplateRef
          }" ${this.getTemplateDataStr(node.index, `0`)}></template></block>`;
        }
        if (directive.falseTemplateRef) {
          content += `<block ${this.directivePrefix}:if="{{!nodeList[${
            node.index
          }][0].context.$implicit}}"><template is="${
            directive.falseTemplateRef
          }" ${this.getTemplateDataStr(node.index, `0`)}></template></block>`;
        }
      } else if (directive.type === 'for') {
        content += `<block ${this.directivePrefix}:for="{{nodeList[${
          node.index
        }]}}" >
          <template is="${directive.templateName}" ${this.getTemplateDataStr(
          node.index,
          `index`
        )}></template>
          </block>`;
      } else if (directive.type === 'switch') {
        if (directive.case) {
          if (directive.first) {
            content += `<block ${this.directivePrefix}:if="{{nodeList[${
              node.index
            }]}}"> <template is="${
              directive.templateName
            }" ${this.getTemplateDataStr(node.index, `0`)}></template></block>`;
          } else {
            content += `<block ${this.directivePrefix}:elif="{{nodeList[${
              node.index
            }]}}"> <template is="${
              directive.templateName
            }" ${this.getTemplateDataStr(node.index, `0`)}></template></block>`;
          }
        } else if (directive.default) {
          content += `<block ${this.directivePrefix}:else> <template is="${
            directive.templateName
          }" ${this.getTemplateDataStr(node.index, `0`)}></template></block>`;
        } else {
          throw new Error('未知的解析指令');
        }
      } else if (directive.type === 'ngTemplateOutlet') {
        content += `<block ${this.directivePrefix}:if="{{nodeList[${
          node.index
        }][0]}}" >
          <template is="${directive.name}" ${this.getTemplateDataStr(
          node.index,
          `0`
        )}></template>
          </block>`;
      } else if (directive.type === 'custom') {
        content += `<block ${this.directivePrefix}:for="{{nodeList[${
          node.index
        }]}}" >
          <template is="{{item.context.template}}" ${this.getTemplateDataStr(
            node.index,
            `index`
          )}></template>
          </block>`;
      } else {
        throw new Error('未知的解析节点');
      }
    }
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
    if (!node.componentMeta?.isComponent) {
      propertyMap.set('class', `nodeList[${index}].class`);
      propertyMap.set('style', `nodeList[${index}].style`);
    }
    Object.entries(node.attributes)
      .filter(([key]) => key !== 'class' && key !== 'style')
      .forEach(([value, key]) => {
        propertyMap.set(key, value);
      });
    node.property
      .filter(
        (property) =>
          !node.componentMeta?.inputs.some((input) => input === property)
      )
      .forEach((key) => {
        propertyMap.set(key, `nodeList[${index!}].property.${key}`);
      });
    node.directiveMeta?.properties.forEach((key) => {
      propertyMap.set(key, `nodeList[${index!}].property.${key}`);
    });
    const eventMap = new Map();
    const eventList: string[] = [
      ...node.outputs
        .filter(
          (item) =>
            !node.componentMeta?.outputs.some((output) => output === item.name)
        )
        .map((item) => item.name),
      ...(node.directiveMeta?.listeners || []),
      ...(node.componentMeta?.isComponent ? node.componentMeta?.listeners : []),
    ];

    const mergeEventMap = new Map<string, string[]>();
    eventList
      // .filter((eventName) => !eventMap.has(eventName))
      .forEach((eventName) => {
        const convertName = convertToEventName(eventName);
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
    return Array.from(propertyMap.entries())
      .map(([key, value]) => `${key}="{{${value}}}"`)
      .concat(
        Array.from(eventMap.entries()).map(
          ([key, value]) => `${key}="${value}"`
        )
      );
  }
}
const EVENT_PREFIX_REGEXP = /^(bind|catch|mut-bind|capture-bind|capture-catch)/;
function convertToEventName(tagEventMeta: string): string {
  if (EVENT_PREFIX_REGEXP.test(tagEventMeta)) {
    return tagEventMeta;
  } else if (tagEventMeta.includes(':')) {
    return tagEventMeta.replace(':', '');
  } else {
    return `bind${tagEventMeta}`;
  }
}
