import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';

export class KsTransform extends WxTransformLike {
  directivePrefix = 'ks';
  override wxsExtname = '.sjs';
  override wxsDialect = { tag: 'sjs', moduleAttr: 'module', srcAttr: 'src' };
}
