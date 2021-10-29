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
import {
  BindValue,
  PlainValue,
  isPlainValue,
} from '../../html/node-handle/value';

export class WxContainer {
  directivePrefix!: string;
  private index: number = 0;
  private exportTemplateList: { name: string; content: string }[] = [];
  private wxmlTemplate: string = '';
  private logic: (string | (() => string))[] = [];
  private currentContext: string[] = [];
  private containerName!: string;
  private childContainer: WxContainer[] = [];
  private directiveIndex = 0;
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
        this.logic.push(`varList[${result.index}]=${result.logic}`);
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
        this.logic.push(`varList[${result.index}]=${result.logic}`);
        return `{{${result.template}}}`;
      })
      .join('');
  }
  private ngContentTransform(node: NgContentMeta): string {
    return node.name ? `<slot name="${node.name}"></slot>` : `<slot></slot>`;
  }
  private ngTemplateTransform(node: NgTemplateMeta): string {
    let content = '';
    const directiveList = node.directive;
    const directiveIndex = this.directiveIndex++;
    this.logic.push(`directive[${directiveIndex}]={}`);
    for (let i = 0; i < directiveList.length; i++) {
      const directive = directiveList[i];
      if (directive.type === 'none') {
        const container = new WxContainer(this);
        this.childContainer.push(container);
        container.directivePrefix = this.directivePrefix;
        node.children.forEach((childNode) => {
          container.compileNode(childNode);
        });
        this.exportTemplateList.push({
          name: directive.name[0].name,
          content: `<template name="${directive.name[0].name}">${container.wxmlTemplate}</template>`,
        });
        container.setContainerContext(directive.name[0].name);
      } else if (directive.type === 'if') {
        if (directive.thenTemplateRef) {
          const ifResult = this.computeExpression(directive.assert);
          this.logic.push(`varList[${ifResult.index}]=${ifResult.logic}`);
          content += `<block ${this.directivePrefix}:if="{{${
            ifResult.template
          }}}"><template is="${directive.thenTemplateRef.value(
            ''
          )}" ${this.getTemplateDataStr(
            directiveIndex,
            `'then'`
          )}></template></block>`;
          this.logic.push(() => {
            return `directive[${directiveIndex}]['then']=wxContainer${directive.thenTemplateRef!.value(
              ''
            )}({originVar:{...ctx,${this.getCurrentContext()
              .map((item) => item + ':' + item)
              .join(',')}}})`;
          });
        }
        if (directive.falseTemplateRef) {
          content += `<block  ${
            this.directivePrefix
          }:else><template is="${directive.falseTemplateRef.value(
            ''
          )}" ${this.getTemplateDataStr(
            directiveIndex,
            `'else'`
          )}></template></block>`;
          this.logic.push(() => {
            return `directive[${directiveIndex}]['else']=wxContainer${directive.falseTemplateRef.value(
              ''
            )}({originVar:{...ctx,${this.getCurrentContext()
              .map((item) => item + ':' + item)
              .join(',')}}})`;
          });
        }
      } else if (directive.type === 'for') {
        const forResult = this.computeExpression(directive.for);
        this.logic.push(`varList[${forResult.index}]=${forResult.logic}`);
        this.currentContext.push(directive.item, directive.index);
        content += `<block ${this.directivePrefix}:for="{{${
          forResult.template
        }}}" ${this.directivePrefix}:for-item="${directive.item}" ${
          this.directivePrefix
        }:for-index="${directive.index}">
          <template is="${directive.templateName}" ${this.getTemplateDataStr(
          directiveIndex,
          'index'
        )}></template>
          </block>`;
        this.logic.push(() => {
          return `for (let ${directive.index} = 0; ${directive.index} < ${
            forResult.logic
          }.length; ${directive.index}++) {
              const ${directive.item} = ${forResult.logic}[${directive.index}];
             directive[${directiveIndex}][${directive.index}]=wxContainer${
            directive.templateName
          }({originVar:{...ctx.originVar,${this.getCurrentContext()
            .map((item) => item + ':' + item)
            .join(',')}}})
            }`;
        });
      } else if (directive.type === 'switch') {
        const switchValueResult = this.computeExpression(directive.switchValue);
        const caseResult =
          directive.case && this.computeExpression(directive.case!);
        if (directive.case) {
          if (directive.first) {
            content += `<block ${this.directivePrefix}:if="{{${
              switchValueResult.template
            }===${caseResult!.template}}}"> <template is="${
              directive.templateName
            }" ${this.getTemplateDataStr(
              directiveIndex,
              `0`
            )}></template></block>`;
          } else {
            content += `<block ${this.directivePrefix}:elif="{{${
              switchValueResult.template
            }===${caseResult!.template}}}"> <template is="${
              directive.templateName
            }" ${this.getTemplateDataStr(
              directiveIndex,
              `0`
            )}></template></block>`;
          }
        } else if (directive.default) {
          content += `<block ${this.directivePrefix}:else> <template is="${
            directive.templateName
          }" ${this.getTemplateDataStr(
            directiveIndex,
            `0`
          )}></template></block>`;
        } else {
          throw new Error('未知的解析指令');
        }
        this.logic.push(() => {
          return `ctx.directive[${directiveIndex}][0]=wxContainer${
            directive.templateName
          }({originVar:{...ctx,${this.getCurrentContext()
            .map((item) => item + ':' + item)
            .join(',')}})`;
        });
      } else {
        throw new Error('未知的解析节点');
      }
    }
    return content;
  }
  private ngTextTransform(node: NgTextMeta): string {
    return node.value;
  }

  private getTemplateDataStr(directiveIndex: number, indexName: string) {
    return `data="{{...directive[${directiveIndex}][${indexName}] }}"`;
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

  private computeExpression(expression: PlainValue | BindValue) {
    const index = this.index++;
    return {
      template: `varList[${index}]`,
      logic: `wx.__window.__computeExpression(${
        isPlainValue(expression)
          ? expression.toString()
          : expression.toString('ctx.originVar.')
      })`,
      index: index,
    };
  }
  private getCurrentContext(otherList: string[] = []): string[] {
    return Array.from(new Set([...this.currentContext, ...otherList]));
  }
  export(): { logic: string; wxmlTemplate: string } {
    return {
      logic: `${this.childContainer
        .map((child) => child.export().logic)
        .join('\n')};\nfunction wxContainer${
        this.containerName
      }(ctx){let varList={};let directive={};${this.logic
        .map((item) => (typeof item === 'string' ? item : item()))
        .join(';\n')};return {varList:varList,directive:directive}}`,
      wxmlTemplate: this.wxmlTemplate,
    };
  }
  setContainerContext(containerName: string) {
    this.containerName = containerName;
  }
  getDeclarationContainerFunction() {
    return this.childContainer.map((child) => child.export().logic);
  }
}
