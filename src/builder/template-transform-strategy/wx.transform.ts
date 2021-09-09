import { WxTransformLike } from './wx-like/wx-transform.base';

export class WxTransform extends WxTransformLike {
  directivePrefix = 'wx';
  viewContextName = '__wxView';
}
