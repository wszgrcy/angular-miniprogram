import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';

export class JdTransform extends WxTransformLike {
  directivePrefix = 'jd';
  override wxsExtname = '.jds';
  override wxsDialect = { tag: 'jds', moduleAttr: 'module', srcAttr: 'src' };
}
