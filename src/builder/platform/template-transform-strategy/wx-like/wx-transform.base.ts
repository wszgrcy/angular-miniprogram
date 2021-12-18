import type { NgNodeMeta } from '../../../html/node-handle/interface';
import { TemplateTransformBase } from '../transform.base';
import { MetaCollection } from './type';
import { WxContainer } from './wx-container';

export const EVENT_PREFIX_REGEXP =
  /^(bind|catch|mut-bind|capture-bind|capture-catch)/;
export abstract class WxTransformLike extends TemplateTransformBase {
  seq = ':';
  templateInterpolation: [string, string] = ['{{', '}}'];
  abstract directivePrefix: string;
  viewContextName: string = '__wxView';
  private exportTemplateList: { name: string; content: string }[] = [];

  constructor() {
    super();
  }
  init() {
    WxContainer.initWxContainerFactory({
      seq: this.seq,
      directivePrefix: this.directivePrefix,
      eventNameConvert: this.eventNameConvert,
      templateInterpolation: this.templateInterpolation,
    });
  }
  compile(nodes: NgNodeMeta[]) {
    const metaCollection: MetaCollection = {
      listeners: [],
      localPath: new Set(),
      libraryPath: new Set(),
    };
    const container = new WxContainer(metaCollection);

    nodes.forEach((node) => {
      container.compileNode(node);
    });
    this.exportTemplateList = container.getExportTemplate();
    const result = container.export();
    return {
      content: `<template name="main-template">${result.wxmlTemplate}</template><block ${this.directivePrefix}${this.seq}if="{{${this.viewContextName}}}"><template is="main-template" data="${this.templateInterpolation[0]}...${this.viewContextName}${this.templateInterpolation[1]}"></template></block> `,
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
  eventNameConvert(tagEventMeta: string) {
    if (EVENT_PREFIX_REGEXP.test(tagEventMeta)) {
      return tagEventMeta.replace(EVENT_PREFIX_REGEXP, '$1:');
    } else {
      return `bind:${tagEventMeta}`;
    }
  }
}
