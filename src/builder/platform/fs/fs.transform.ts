import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';

export class FsTransform extends WxTransformLike {
  directivePrefix = 'tt';
  override wxsExtname = '.sjs';
  override wxsDialect = { tag: 'sjs', moduleAttr: 'module', srcAttr: 'src' };
}
