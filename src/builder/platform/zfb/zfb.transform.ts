import { capitalize } from '@angular-devkit/core/src/utils/strings';
import {
  WXS_DIALECT_ALIPAY,
  WxTransformLike,
} from '../template-transform-strategy/wx-like/wx-transform.base';
import { alipayEventName } from './zfb-event-name';

const BIND_PREFIX_REGEXP = /^(bind|mut-bind|capture-bind):?(.*)/;
const CATCH_PREFIX_REGEXP = /^(catch|capture-catch):?(.*)/;
export class ZfbTransform extends WxTransformLike {
  directivePrefix = 'a';
  override wxsExtname = '.sjs';
  // 支付宝属性名不同：name/from 而非 module/src
  override wxsDialect = WXS_DIALECT_ALIPAY;
  /**
   * 支付宝事件属性：`on` / `catch` + 驼峰事件名。
   *
   * 事件名先过映射表再首字母大写：`touchstart` → `touchStart` → `onTouchStart`。
   * 直接 capitalize 只能对上单词事件（`tap`/`input`），断词事件全部对不上。
   */
  override eventNameConvert(name: string) {
    const matchedCatch = name.match(CATCH_PREFIX_REGEXP);
    const matchedBind = matchedCatch ? null : name.match(BIND_PREFIX_REGEXP);
    const raw = matchedCatch
      ? matchedCatch[2]
      : matchedBind
        ? matchedBind[2]
        : name;
    const type = alipayEventName(raw);
    const prefix = matchedCatch ? 'catch' : 'on';
    return {
      prefix,
      type,
      name: `${prefix}${capitalize(type)}`,
    };
  }
}
