import {
  WXS_DIALECT_ALIPAY,
  WxTransformLike,
} from '../template-transform-strategy/wx-like/wx-transform.base';

export class DdTransform extends WxTransformLike {
  directivePrefix = 'a';
  override wxsExtname = '.sjs';
  // 钉钉语法承自支付宝，沿用 name/from 形态
  override wxsDialect = WXS_DIALECT_ALIPAY;
}
