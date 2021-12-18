import { Injectable } from 'static-injector';
import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';

@Injectable()
export class ZjTransform extends WxTransformLike {
  directivePrefix = 'tt';
}
