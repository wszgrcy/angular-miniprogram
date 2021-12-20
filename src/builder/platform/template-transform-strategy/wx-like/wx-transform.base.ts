import type { NgNodeMeta } from '../../../html/node-handle/interface';
import { TemplateTransformBase } from '../transform.base';
import { WxContainer } from './wx-container';

export const EVENT_PREFIX_REGEXP =
  /^(bind|catch|mut-bind|capture-bind|capture-catch)/;
export abstract class WxTransformLike extends TemplateTransformBase {
  seq = ':';
  templateInterpolation: [string, string] = ['{{', '}}'];
  abstract directivePrefix: string;

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
    const container = new WxContainer();

    nodes.forEach((node) => {
      container.compileNode(node);
    });
    const result = container.export();
    const metaCollectionGroup = container.exportMetaCollectionGroup();
    const inlineMetaCollection = metaCollectionGroup.$inline;
    delete metaCollectionGroup.$inline;
    return {
      content: `<block ${this.directivePrefix}${this.seq}if="{{hasLoad}}">${result.wxmlTemplate}</block> `,
      template: inlineMetaCollection.templateList
        .map((item) => item.content)
        .join(''),
      meta: { listeners: inlineMetaCollection.listeners },
      useComponentPath: {
        localPath: [...inlineMetaCollection.localPath],
        libraryPath: [...inlineMetaCollection.libraryPath],
      },
      otherMetaGroup: metaCollectionGroup,
    };
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
