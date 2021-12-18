import { Injectable } from 'static-injector';
import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';

@Injectable()
export class BdZnTransform extends WxTransformLike {
  override directivePrefix = 's';
  override seq = '-';
  override templateInterpolation: [string, string] = ['{{{', '}}}'];
}
