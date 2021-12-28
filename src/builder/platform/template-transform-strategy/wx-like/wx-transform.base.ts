import { strings } from '@angular-devkit/core';
import type { NgNodeMeta } from '../../../mini-program-compiler';
import { TemplateTransformBase } from '../transform.base';
import { WxContainer } from './wx-container';

export const EVENT_PREFIX_REGEXP =
  /^(bind|catch|mut-bind|capture-bind|capture-catch)(.*)$/;
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
      eventListConvert: this.eventListConvert,
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
      content: `${inlineMetaCollection.templateList
        .map((item) => item.content)
        .join('')}<block ${this.directivePrefix}${this.seq}if="{{hasLoad}}">${
        result.wxmlTemplate
      }</block>`,
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
    const result = tagEventMeta.match(EVENT_PREFIX_REGEXP);
    let prefix: string = 'bind';
    let type: string = tagEventMeta;
    if (result) {
      prefix = result[1];
      type = result[2];
    }
    return {
      prefix,
      type,
      name: `${prefix}:${type}`,
    };
  }
  eventListConvert = (list: string[]) => {
    const eventMap = new Map();
    list.forEach((eventName) => {
      const result = this.eventNameConvert(eventName);
      const prefix = strings.camelize(result.prefix);
      const bindEventName = `${prefix}Event`;
      if (eventMap.has(result.name)) {
        if (eventMap.get(result.name) === bindEventName) {
          return;
        } else {
          throw new Error(
            `事件名[${result.name}]解析异常,原绑定${eventMap.get(
              result.name
            )},现绑定${bindEventName}`
          );
        }
      }
      eventMap.set(result.name, bindEventName);
    });

    return Array.from(eventMap.entries())
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  };
}
