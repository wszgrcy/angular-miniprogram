import { Injectable } from 'static-injector';
import { WxTransformLike } from './wx-like/wx-transform.base';

@Injectable()
export class WxTransform extends WxTransformLike {
  directivePrefix = 'wx';
  viewContextName = '__wxView';
}
