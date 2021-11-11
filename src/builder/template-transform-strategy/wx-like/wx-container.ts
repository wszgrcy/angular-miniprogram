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
  private containerName!: string;
  private childContainer: WxContainer[] = [];
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
      .filter(([key]) => key !== 'class' && key !== 'style')
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    const outputStr = node.outputs
      .filter(
        (item) =>
          !node.componentMeta ||
          (node.componentMeta &&
            !(node.componentMeta.outputs || []).some(
              (output) => output === item.name
            ))
      )
      .map(
        (item) =>
          `${item.prefix}:${item.name}="${item.handler.source!.replace(
            /\(.*$/,
            ''
          )}"`
      )
      .join(' ');
    const children = node.children.map((child) => this._compileTemplate(child));
    if (node.singleClosedTag) {
      return `<${node.tagName} ${attributeStr} ${outputStr}>`;
    }
    return `<${
      node.tagName
    } ${attributeStr} ${outputStr} ${this.setComponentIndex(
      node?.nodeIndex
    )} ${this.generateClassAndStyle(node.nodeIndex)}>${children.join('')}</${
      node.tagName
    }>`;
  }
  private ngBoundTextTransform(node: NgBoundTextMeta): string {
    return `{{nodeList[${node.nodeIndex}].value}}`;
  }
  private ngContentTransform(node: NgContentMeta): string {
    return node.name ? `<slot name="${node.name}"></slot>` : `<slot></slot>`;
  }
  private ngTemplateTransform(node: NgTemplateMeta): string {
    let content = '';
    const directiveList = node.directive;
    if (directiveList.some((item) => item.type !== 'none')) {
      this.logic.push(`directive[${node.nodeIndex}]={}`);
    }
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
            node.nodeIndex,
            `0`
          )}></template></block>`;
          this.logic.push(() => {
            return `directive[${
              node.nodeIndex
            }][0]=wxContainer${directive.thenTemplateRef!.value(
              ''
            )}({originVar:{...ctx},componentIndexList:[...(ctx.componentIndexList||[]),'directive',${
              node.nodeIndex
            },0]})`;
          });
        }
        if (directive.falseTemplateRef) {
          content += `<block  ${
            this.directivePrefix
          }:else><template is="${directive.falseTemplateRef.value(
            ''
          )}" ${this.getTemplateDataStr(
            node.nodeIndex,
            `0`
          )}></template></block>`;
          this.logic.push(() => {
            return `directive[${
              node.nodeIndex
            }][0]=wxContainer${directive.falseTemplateRef.value(
              ''
            )}({originVar:{...ctx},componentIndexList:[...(ctx.componentIndexList||[]),'directive',${
              node.nodeIndex
            },0]})`;
          });
        }
      } else if (directive.type === 'for') {
        const forResult = this.computeExpression(directive.for);
        this.logic.push(`varList[${forResult.index}]=${forResult.logic}`);
        content += `<block ${this.directivePrefix}:for="{{${
          forResult.template
        }}}" ${this.directivePrefix}:for-item="${directive.item}" ${
          this.directivePrefix
        }:for-index="${directive.index}">
          <template is="${directive.templateName}" ${this.getTemplateDataStr(
          node.nodeIndex,
          `${directive.index}`
        )}></template>
          </block>`;
        this.logic.push(() => {
          return `for (let ${directive.index} = 0; ${directive.index} < ${forResult.logic}.length; ${directive.index}++) {
              const ${directive.item} = ${forResult.logic}[${directive.index}];
             directive[${node.nodeIndex}][${directive.index}]=wxContainer${directive.templateName}({originVar:{...ctx.originVar,${directive.item}:${directive.item},${directive.index}:${directive.index}},componentIndexList:[...(ctx.componentIndexList||[]),'directive',${node.nodeIndex},${directive.index}]})
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
              node.nodeIndex,
              `0`
            )}></template></block>`;
          } else {
            content += `<block ${this.directivePrefix}:elif="{{${
              switchValueResult.template
            }===${caseResult!.template}}}"> <template is="${
              directive.templateName
            }" ${this.getTemplateDataStr(
              node.nodeIndex,
              `0`
            )}></template></block>`;
          }
        } else if (directive.default) {
          content += `<block ${this.directivePrefix}:else> <template is="${
            directive.templateName
          }" ${this.getTemplateDataStr(
            node.nodeIndex,
            `0`
          )}></template></block>`;
        } else {
          throw new Error('未知的解析指令');
        }
        this.logic.push(() => {
          return `ctx.directive[${node.nodeIndex}][0]=wxContainer${directive.templateName}({originVar:{...ctx},componentIndexList:[...(ctx.componentIndexList||[]),'directive',${node.nodeIndex},0]})`;
        });
      } else {
        throw new Error('未知的解析节点');
      }
    }
    return content;
  }
  private ngTextTransform(node: NgTextMeta): string {
    return `{{nodeList[${node.nodeIndex}].value}}`;
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

  export(): { logic: string; wxmlTemplate: string } {
    return {
      logic: `${this.childContainer
        .map((child) => child.export().logic)
        .join('\n')};\nfunction wxContainer${
        this.containerName
      }(ctx){let varList={};let directive={};${this.logic
        .map((item) => (typeof item === 'string' ? item : item()))
        .join(
          ';\n'
        )};return {varList:varList,directive:directive,componentIndexList:ctx.componentIndexList}}`,
      wxmlTemplate: this.wxmlTemplate,
    };
  }
  setContainerContext(containerName: string) {
    this.containerName = containerName;
  }
  getDeclarationContainerFunction() {
    return this.childContainer.map((child) => child.export().logic);
  }
  private setComponentIndex(cpIndex: number | undefined) {
    if (typeof cpIndex === 'number') {
      return `componentIndexList="{{componentIndexList}}" cpIndex="${cpIndex}"`;
    }
    return ``;
  }
  generateClassAndStyle(index: number) {
    return `class="{{nodeList[${index}].class}}" style="{{nodeList[${index}].style}}"`;
  }
}
