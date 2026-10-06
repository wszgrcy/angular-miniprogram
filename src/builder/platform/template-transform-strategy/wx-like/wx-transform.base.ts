import { strings } from '@angular-devkit/core';
import type { NgNodeMeta } from '../../../mini-program-compiler';
import { TemplateTransformBase } from '../transform.base';
import { WxContainer } from './wx-container';

/**
 * 事件名上的 wx 系绑定前缀。`:?` 不可省：前缀与事件名之间用冒号分隔（`catch:tap`），
 * 少了它 `(.*)` 会把冒号当成事件名的一部分，拼出 `catch::tap`。
 */
export const EVENT_PREFIX_REGEXP =
  /^(bind|catch|mut-bind|capture-bind|capture-catch):?(.*)$/;

/**
 * 渲染层脚本引入标签的平台方言。各家差异不只在扩展名，标签名和属性名也不同：
 * 微信 `<wxs module src>`，支付宝却是 `<import-sjs name from>`。作者统一写微信形态，这里描述目标平台该长什么样。
 */
export interface WxsDialect {
  tag: string;
  moduleAttr: string;
  srcAttr: string;
}

/** 微信形态，也是作者书写形态 */
export const WXS_DIALECT_WX: WxsDialect = {
  tag: 'wxs',
  moduleAttr: 'module',
  srcAttr: 'src',
};

/** 支付宝形态：属性名换了，这是最容易踩的一个 */
export const WXS_DIALECT_ALIPAY: WxsDialect = {
  tag: 'import-sjs',
  moduleAttr: 'name',
  srcAttr: 'from',
};

export abstract class WxTransformLike extends TemplateTransformBase {
  seq = ':';
  templateInterpolation: [string, string] = ['{{', '}}'];
  abstract directivePrefix: string;
  /** wxs 产物的扩展名，各平台不同（.wxs / .sjs / .jds / .qs） */
  wxsExtname = '.wxs';
  /** 引入标签方言 */
  wxsDialect: WxsDialect = WXS_DIALECT_WX;
  /**
   * 共享渲染层脚本的输出目录（相对产物根）。
   *
   * **必须共享，不能每个组件各存一份** —— 副本会导致：包体重复、
   * 改一处要同步多处、多实例下模块状态不唯一。
   * 集中到一处后，所有 wxml 用应用根绝对路径引用，
   * 连相对路径都不用算。
   */
  wxsSharedDir = 'common';
  /**
   * 该平台是否支持渲染层脚本。
   * 不支持的平台上模板写了 wxs 应该直接报错，而不是静默产出错误代码。
   */
  supportsWxs = true;

  constructor() {
    super();
  }
  init() {
    WxContainer.initWxContainerFactory({
      seq: this.seq,
      directivePrefix: this.directivePrefix,
      eventListConvert: this.eventListConvert,
      templateInterpolation: this.templateInterpolation,
      eventAttrName: (name: string) => this.eventNameConvert(name).name,
      tagNameClass: this.tagNameClass,
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

    const wxsModules = [...container.collectWxsModules()];
    wxsModules.forEach((m) => inlineMetaCollection.wxsModules.add(m));

    return {
      content: `${this.genWxsHeader(wxsModules)}${inlineMetaCollection.templateList
        .map((item) => item.content)
        .join('')}<block ${this.directivePrefix}${this.seq}if="${
        this.templateInterpolation[0]
      }hasLoad${this.templateInterpolation[1]}">${result.wxmlTemplate}</block>`,
      useComponentPath: {
        localPath: [...inlineMetaCollection.localPath],
        libraryPath: [...inlineMetaCollection.libraryPath],
      },
      otherMetaGroup: metaCollectionGroup,
    };
  }

  /**
   * wxml 头部的渲染层脚本引入。
   *
   * 必须放在文件最顶部：小程序要求导入先于使用，
   * 且放在 `<block>` 内部会导致作用域仅局部可见。
   *
   * **作者只写微信一种写法**（`<wxs module src>`），这里按平台转译。
   * 微信是大头，其他家基本是对着它实现的；让开发者学多套写法
   * 不如把差异吃在编译期。
   */
  protected genWxsHeader(modules: string[]): string {
    if (!modules.length) {
      return '';
    }
    if (!this.supportsWxs) {
      throw new Error(
        `当前平台不支持渲染层脚本(wxs)，但模板使用了 ${modules.join(', ')}。`,
      );
    }
    return (
      modules
        .map(
          (m) =>
            `<${this.wxsDialect.tag} ${this.wxsDialect.moduleAttr}="${m}" ` +
            `${this.wxsDialect.srcAttr}="/${this.wxsSharedDir}/${m}${this.wxsExtname}"/>`,
        )
        .join('\n') + '\n'
    );
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
              result.name,
            )},现绑定${bindEventName}`,
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
