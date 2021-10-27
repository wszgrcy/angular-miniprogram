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
  isNgContentMeta,
  isNgElementMeta,
  isNgTemplateMeta,
  isNgTextMeta,
} from '../../html/node-handle/node-meta/type-predicate';
import { BindValue, PlainValue } from '../../html/node-handle/value';

export class WxContainer {
  directivePrefix: string;
  private index: number = 0;
  private exportTemplateList: { name: string; content: string }[] = [];
  private wxmlTemplate: string = '';
  private logic: string = '';
  private currentContext: string[] = [];
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
    this.wxmlTemplate += this._compileTemplate(node);
  }

  private ngElementTransform(node: NgElementMeta): string {
    const attributeStr = Object.entries(node.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    const inputStr = Object.entries(node.inputs)
      .map(([key, value]) => {
        const result = this.computeExpression(value);
        this.logic += result.logic;
        return `${key}="{{${result.template}}}"`;
      })
      .join(' ');

    const outputStr = node.outputs
      .map(
        (item) => `${item.name}="${item.handler.source!.replace(/\(.*$/, '')}"`
      )
      .join(' ');
    const children = node.children.map((child) => this._compileTemplate(child));
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
    return node.values
      .map((item) => {
        const result = this.computeExpression(item);
        this.logic += result.logic;
        return result.template;
      })
      .join('');
  }
  private ngContentTransform(node: NgContentMeta): string {
    return node.name ? `<slot name="${node.name}"></slot>` : `<slot></slot>`;
  }
  private ngTemplateTransform(node: NgTemplateMeta): string {
    const container = new WxContainer(this);
    container.directivePrefix = this.directivePrefix;
    node.children.forEach((childNode) => {
      container.compileNode(childNode);
    });
    let content = '';
    const directiveList = node.directive;
    for (let i = 0; i < directiveList.length; i++) {
      const directive = directiveList[i];
      if (directive.type === 'none') {
        this.exportTemplateList.push({
          name: directive.name[0].name,
          content: `<template name="${directive.name[0].name}">${container.wxmlTemplate}</template>`,
        });
      } else if (directive.type === 'if') {
        if (directive.thenTemplateRef) {
          const ifResult = this.computeExpression(directive.assert);
          this.logic += ifResult.logic;
          content += `<block ${this.directivePrefix}:if="{{${
            ifResult.template
          }}}"><template is="${directive.thenTemplateRef.value()}" ${this.getTemplateDataStr(
            directive.thenTemplateRef.value()
          )}></template></block>`;
        }
        if (directive.falseTemplateRef) {
          content += `<block  ${
            this.directivePrefix
          }:else><template is="${directive.falseTemplateRef.value()}" ${this.getTemplateDataStr(
            directive.falseTemplateRef.value()
          )}></template></block>`;
        }
      } else if (directive.type === 'for') {
        const forResult = this.computeExpression(directive.for);
        this.logic += forResult;
        content += `<block ${this.directivePrefix}:for="{{${
          forResult.template
        }}}" ${this.directivePrefix}:for-item="${directive.item}" ${
          this.directivePrefix
        }:for-index="${directive.index}">
          <template is="${directive.templateName}" ${this.getTemplateDataStr(
          directive.templateName
        )}></template>
          </block>`;
      } else if (directive.type === 'switch') {
        const switchValueResult = this.computeExpression(directive.switchValue);
        const caseResult = this.computeExpression(directive.case);
        if (directive.case) {
          if (directive.first) {
            content += `<block ${this.directivePrefix}:if="{{${
              switchValueResult.template
            }===${caseResult.template}}}"> <template is="${
              directive.templateName
            }" ${this.getTemplateDataStr(
              directive.templateName
            )}></template></block>`;
          } else {
            content += `<block ${this.directivePrefix}:elif="{{${
              switchValueResult.template
            }===${caseResult.template}}}"> <template is="${
              directive.templateName
            }" ${this.getTemplateDataStr(
              directive.templateName
            )}></template></block>`;
          }
        } else if (directive.default) {
          content += `<block ${this.directivePrefix}:else> <template is="${
            directive.templateName
          }" ${this.getTemplateDataStr(
            directive.templateName
          )}></template></block>`;
        } else {
          throw new Error('未知的解析指令');
        }
      } else {
        throw new Error('未知的解析节点');
      }
    }
    return content;
  }
  private ngTextTransform(node: NgTextMeta): string {
    return node.value;
  }

  private getTemplateDataStr(name: string) {
    return `data="{{ctx:{originVar:{${this.getCurrentContext()
      .map((item) => item + ':' + item)
      .join(',')}} } }}"`;
  }

  getExportTemplate() {
    return this.exportTemplateList.map((item) => `${item.content}`).join(',');
  }

  computeExpression(expression: PlainValue | BindValue) {
    return {
      template: `varList[${this.index++}]`,
      logic: `computeExpression(${
        expression instanceof PlainValue
          ? expression
          : expression.toString('ctx.originVar.')
      });`,
    };
  }
  private getCurrentContext(): string[] {
    return [
      ...this.currentContext,
      ...(this.parent ? this.parent.currentContext : []),
    ];
  }
  export() {
    return {
      logic: this.logic,
      wxmlTemplate: this.wxmlTemplate,
    };
  }
}
