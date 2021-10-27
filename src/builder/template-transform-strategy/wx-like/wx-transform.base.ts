import { NgNodeMeta } from '../../html/node-handle/interface';

import { TemplateTransformBase } from '../transform.base';
import { WxContainer } from './wx-container';

export abstract class WxTransformLike extends TemplateTransformBase {
  abstract directivePrefix: string;
  abstract viewContextName: string;
  private exportTemplateList: { name: string; content: string }[] = [];
  constructor() {
    super();
  }

  compile(nodes: NgNodeMeta[]) {
    const container = new WxContainer();
    container.directivePrefix = this.directivePrefix;
    nodes.forEach((node) => {
      container.compileNode(node);
    });
    const result = container.export();
    const templateImport = this.exportTemplateList.length
      ? `<import src="./template.wxml"/>`
      : '';
    return `${templateImport}<template name="main-template">${result.wxmlTemplate}</template><template is="main-template" data="{{...${this.viewContextName}}}"></template>`;
  }

  getExportTemplate() {
    return this.exportTemplateList.map((item) => `${item.content}`).join(',');
  }
}
