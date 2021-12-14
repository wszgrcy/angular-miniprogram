import { Injectable } from 'static-injector';
import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';

@Injectable()
export class BdZnTransform extends WxTransformLike {
  directivePrefix = 's';
  sep = '-';
}
