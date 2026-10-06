import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';

export class QqTransform extends WxTransformLike {
  directivePrefix = 'qq';
  override wxsExtname = '.qs';
  override wxsDialect = { tag: 'qs', moduleAttr: 'module', srcAttr: 'src' };
}
