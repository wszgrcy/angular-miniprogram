import { capitalize } from '@angular-devkit/core/src/utils/strings';
import {
  WXS_DIALECT_ALIPAY,
  WxTransformLike,
} from '../template-transform-strategy/wx-like/wx-transform.base';

const BIND_PREFIX_REGEXP = /^(bind|mut-bind|capture-bind)(.*)/;
const CATCH_PREFIX_REGEXP = /^(catch|capture-catch)(.*)/;
export class ZfbTransform extends WxTransformLike {
  directivePrefix = 'a';
  override wxsExtname = '.sjs';
  // 支付宝属性名不同：name/from 而非 module/src
  override wxsDialect = WXS_DIALECT_ALIPAY;
  override eventNameConvert(name: string) {
    let result = name.match(BIND_PREFIX_REGEXP);
    if (result) {
      return {
        prefix: 'on',
        type: result[2],
        name: `on${capitalize(result[2])}`,
      };
    }
    result = name.match(CATCH_PREFIX_REGEXP);
    if (result) {
      return {
        prefix: 'catch',
        type: result[2],
        name: `catch${capitalize(result[2])}`,
      };
    }
    return {
      prefix: 'on',
      type: name,
      name: `on${capitalize(name)}`,
    };
  }
}
