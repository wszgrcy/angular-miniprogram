import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';

export class BdZnTransform extends WxTransformLike {
  override directivePrefix = 's';
  override seq = '-';
  override templateInterpolation: [string, string] = ['{{{', '}}}'];
  override wxsExtname = '.sjs';
  // 百度是 <import-sjs module src>，与支付宝的 name/from 不同
  override wxsDialect = {
    tag: 'import-sjs',
    moduleAttr: 'module',
    srcAttr: 'src',
  };
}
