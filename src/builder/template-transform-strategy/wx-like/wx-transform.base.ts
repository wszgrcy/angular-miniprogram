import {
  NgBoundTextMeta,
  NgContentMeta,
  NgElementMeta,
  NgNodeMeta,
  NgTemplateMeta,
  NgTextMeta,
} from '../../html/node-handle/interface';
import {
  isNgBoundTextMeta,
  isNgConetentMeta,
  isNgElementMeta,
  isNgTemplateMeta,
  isNgTextMeta,
} from '../../html/node-handle/node-meta/type-predicate';
import { BindValue, PlainValue } from '../../html/node-handle/value';
import { TemplateTransformBase } from '../transform.base';

export abstract class WxTransformLike extends TemplateTransformBase {
  abstract directivePrefix: string;
  abstract viewContextName: string;
  private exportTemplateList: { name: string; content: string }[] = [];
  constructor() {
    super();
  }
  private _compileTemplate(node: NgNodeMeta): string {
    if (isNgElementMeta(node)) {
      return this.ngElementTransform(node);
    } else if (isNgBoundTextMeta(node)) {
      return this.ngBoundTextTransform(node);
    } else if (isNgTextMeta(node)) {
      return this.ngTextTransform(node);
    } else if (isNgConetentMeta(node)) {
      return this.ngConetentTransform(node);
    } else if (isNgTemplateMeta(node)) {
      return this.ngTemplateTransform(node);
    } else {
      throw '未知的ng节点元数据';
    }
  }
  compileTemplate(node: NgNodeMeta) {
    return this._compileTemplate(node);
  }
  compile(nodes: NgNodeMeta[]) {
    let result = nodes
      .map((ngModeMeta) => this.compileTemplate(ngModeMeta))
      .join('');
    let templateImport = this.exportTemplateList.length
      ? `<import src="./template.wxml"/>`
      : '';
    return `${templateImport}<template name="main-template">${result}</template><template is="main-template" data="{{...${this.viewContextName}}}"></template>`;
  }
  private ngElementTransform(node: NgElementMeta): string {
    let children = node.children.map((child) => this._compileTemplate(child));
    let attributeStr = Object.entries(node.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    let inputStr = Object.entries(node.inputs)
      .map(([key, value]) => `${key}="{{${value}}}"`)
      .join(' ');
    let outputStr = node.outputs
      .map(
        (item) => `${item.name}="${item.handler.source!.replace(/\(.*$/, '')}"`
      )
      .join(' ');
    if (node.singleClosedTag) {
      return `<${node.tagName} ${attributeStr} ${inputStr} ${outputStr}>`;
    }
    return `<${
      node.tagName
    } ${attributeStr} ${inputStr} ${outputStr}>${children.join('')}</${
      node.tagName
    }>`;
  }
  private ngBoundTextTransform(node: NgBoundTextMeta): string {
    return node.values.map((item) => this.insertValue(item)).join('');
  }
  private ngConetentTransform(node: NgContentMeta): string {
    return node.name ? `<slot name="${node.name}"></slot>` : `<slot></slot>`;
  }
  private ngTemplateTransform(node: NgTemplateMeta): string {
    let children = node.children.map((child) => this._compileTemplate(child));
    let content = '';
    if (node.directive.type === 'none') {
      this.exportTemplateList.push({
        name: node.directive.name[0].name,
        content: `<template name="${
          node.directive.name[0].name
        }">${children.join('')}</template>`,
      });
      return content;
    } else if (node.directive.type === 'if') {
      if (node.directive.thenTemplateRef) {
        content += `<block ${this.directivePrefix}:if="${this.insertValue(
          node.directive.assert
        )}"><template is="${
          node.directive.thenTemplateRef.value
        }" ${this.getTemplateDataStr(
          node.directive.thenTemplateRef.value
        )}></template></block>`;
      } else {
        content += `<block ${this.directivePrefix}:if="${this.insertValue(
          node.directive.assert
        )}">${children.join('')}</block>`;
      }
      if (node.directive.falseTemplateRef) {
        content += `<block  ${this.directivePrefix}:else><template is="${
          node.directive.falseTemplateRef
        }" ${this.getTemplateDataStr(
          node.directive.falseTemplateRef.value
        )}></template></block>`;
      }
      return content;
    } else if (node.directive.type === 'for') {
      return `<block ${this.directivePrefix}:for="{{${node.directive.for}}}" ${
        this.directivePrefix
      }:for-item="${node.directive.item}" ${this.directivePrefix}:for-index="${
        node.directive.index
      }">${children.join('')}</block>`;
    } else if (node.directive.type === 'switch') {
      if (node.directive.case) {
        if (node.directive.first) {
          return `<block ${this.directivePrefix}:if="{{${
            node.directive.switchValue
          }===${node.directive.case}}}">${children.join('')}</block>`;
        } else {
          return `<block ${this.directivePrefix}:elif="{{${
            node.directive.switchValue
          }===${node.directive.case}}}">${children.join('')}</block>`;
        }
      } else if (node.directive.default) {
        return `<block ${this.directivePrefix}:else>${children.join(
          ''
        )}</block>`;
      } else {
        throw '未知的解析指令';
      }
    } else {
      throw '未知的解析节点';
    }
  }
  private ngTextTransform(node: NgTextMeta): string {
    return node.value;
  }
  private insertValue(value: BindValue | PlainValue) {
    if (value instanceof BindValue) {
      return `{{${value.value}}}`;
    } else {
      return value.value;
    }
  }
  private getTemplateData(name: string) {
    return this.globalContext.findTemplate(name)!.data.join(',');
  }
  private getTemplateDataStr(name: string) {
    let templateData = this.getTemplateData(name);
    if (templateData) {
      return `data="{{${templateData}}}"`;
    }
    return '';
  }
  private generateTag(
    singleClosedTag: boolean,
    name: string,
    attr: string,
    children?: string[]
  ) {}
  getExportTemplate() {
    return this.exportTemplateList.map((item) => `${item.content}`).join(',');
  }
}
