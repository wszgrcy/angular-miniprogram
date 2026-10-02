import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';

export class XhsTransform extends WxTransformLike {
  directivePrefix = 'xhs';
  override wxsExtname = '.sjs';
  override wxsDialect = { tag: 'sjs', moduleAttr: 'module', srcAttr: 'src' };
}
