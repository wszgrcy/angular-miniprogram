import { NgNodeMeta } from '../../html/node-handle/interface';

import { TemplateTransformBase } from '../transform.base';
import { WxContainer } from './wx-container';

export abstract class WxTransformLike extends TemplateTransformBase {
  abstract directivePrefix: string;
  abstract viewContextName: string;
  private exportTemplateList: { name: string; content: string }[] = [];
  private metaCollection = {
    method: new Set<string>(),
    listeners: [],
  };
  constructor() {
    super();
  }
  compile(nodes: NgNodeMeta[]) {
    const container = new WxContainer(this.metaCollection);
    container.directivePrefix = this.directivePrefix;
    nodes.forEach((node) => {
      container.compileNode(node);
    });
    this.exportTemplateList = container.getExportTemplate();
    const result = container.export();
    const templateImport = this.exportTemplateList.length
      ? `<import src="./template.wxml"/>`
      : '';
    return {
      content: `${templateImport}<template name="main-template">${result.wxmlTemplate}</template><block wx:if="{{${this.viewContextName}}}"><template is="main-template" data="{{...${this.viewContextName}}}"></template></block> `,
      template: this.getExportTemplate(),
      meta: this.getExportMeta(),
    };
  }

  private getExportTemplate() {
    return this.exportTemplateList.map((item) => item.content).join('');
  }

  private getExportMeta() {
    return `{method:${JSON.stringify([
      ...this.metaCollection.method,
    ])},listeners:${JSON.stringify(this.metaCollection.listeners)}}`;
  }
}
