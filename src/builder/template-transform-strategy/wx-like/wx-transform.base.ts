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
  private logic!: string;
  compile(nodes: NgNodeMeta[]) {
    const container = new WxContainer();
    container.setContainerContext('Main');
    container.directivePrefix = this.directivePrefix;
    nodes.forEach((node) => {
      container.compileNode(node);
    });
    this.exportTemplateList = container.getExportTemplate();
    const result = container.export();
    this.logic = `${result.logic};`;
    const templateImport = this.exportTemplateList.length
      ? `<import src="./template.wxml"/>`
      : '';
    return `${templateImport}<template name="main-template">${result.wxmlTemplate}</template><template is="main-template" data="{{...${this.viewContextName}}}"></template>`;
  }

  getExportTemplate() {
    return this.exportTemplateList.map((item) => `${item.content}`).join(',');
  }
  getLogic() {
    return this.logic;
  }
}
