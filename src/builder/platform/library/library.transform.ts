import { Injectable } from 'static-injector';
import {
  EVENT_PREFIX_REGEXP,
  WxTransformLike,
} from '../template-transform-strategy/wx-like/wx-transform.base';

@Injectable()
export class LibraryTransform extends WxTransformLike {
  directivePrefix = '${directivePrefix}';
  templateInterpolation: [string, string] = [
    '${templateInterpolation[0]}',
    '${templateInterpolation[1]}',
  ];
  override eventNameConvert(name: string) {
    let convertName: string;
    if (!EVENT_PREFIX_REGEXP.test(name)) {
      convertName = 'bind' + name;
    } else {
      convertName = name;
    }
    return `\${eventNameConvert("${convertName}")}`;
  }
}
