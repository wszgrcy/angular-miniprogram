import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';

export class ZjTransform extends WxTransformLike {
  directivePrefix = 'tt';
  override wxsExtname = '.sjs';
  override wxsDialect = { tag: 'sjs', moduleAttr: 'module', srcAttr: 'src' };
}
