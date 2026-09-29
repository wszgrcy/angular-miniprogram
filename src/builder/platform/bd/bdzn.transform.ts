import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';

export class BdZnTransform extends WxTransformLike {
  override directivePrefix = 's';
  override seq = '-';
  override templateInterpolation: [string, string] = ['{{{', '}}}'];
}
