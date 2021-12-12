import type { NgNodeMeta } from '../../../html/node-handle/interface';
import { BuildPlatform } from '../../platform';
import { TemplateTransformBase } from '../transform.base';
import { MetaCollection } from './type';
import { WxContainer } from './wx-container';

export abstract class WxTransformLike extends TemplateTransformBase {
  abstract directivePrefix: string;
  viewContextName: string = '__wxView';
  private exportTemplateList: { name: string; content: string }[] = [];

  constructor(protected buildPlatform:BuildPlatform) {
    super();
  }
  compile(nodes: NgNodeMeta[]) {
    const metaCollection: MetaCollection = {
      listeners: [],
      localPath: new Set(),
      libraryPath: new Set(),
    };
    const container = new WxContainer(metaCollection);
    container.directivePrefix = this.directivePrefix;
    nodes.forEach((node) => {
      container.compileNode(node);
    });
    this.exportTemplateList = container.getExportTemplate();
    const result = container.export();
    const templateImport = this.exportTemplateList.length
      ? `<import src="./template${this.buildPlatform.fileExtname.contentTemplate}"/>`
      : '';
    return {
      content: `${templateImport}<template name="main-template">${result.wxmlTemplate}</template><block ${this.directivePrefix}:if="{{${this.viewContextName}}}"><template is="main-template" data="{{...${this.viewContextName}}}"></template></block> `,
      template: this.getExportTemplate(),
      meta: this.getExportMeta(metaCollection),
      useComponentPath: {
        localPath: [...metaCollection.localPath],
        libraryPath: [...metaCollection.libraryPath],
      },
    };
  }

  private getExportTemplate() {
    return this.exportTemplateList.map((item) => item.content).join('');
  }

  private getExportMeta(metaCollection: MetaCollection) {
    return `{listeners:${JSON.stringify(metaCollection.listeners)}}`;
  }

  getData() {
    return { directivePrefix: this.directivePrefix };
  }
}
