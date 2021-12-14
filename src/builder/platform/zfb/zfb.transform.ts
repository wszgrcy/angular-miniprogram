import { capitalize } from '@angular-devkit/core/src/utils/strings';
import { Injectable } from 'static-injector';
import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';

const BIND_PREFIX_REGEXP = /^(bind|mut-bind|capture-bind)(.*)/;
const CATCH_PREFIX_REGEXP = /^(catch|capture-catch)(.*)/;
@Injectable()
export class ZfbTransform extends WxTransformLike {
  directivePrefix = 'a';
  eventNameConvert(name: string) {
    let result = name.match(BIND_PREFIX_REGEXP);
    if (result) {
      return `on${capitalize(result[2])}`;
    }
    result = name.match(CATCH_PREFIX_REGEXP);
    if (result) {
      return `catch${capitalize(result[2])}`;
    }
    return `on${capitalize(name)}`;
  }
}
