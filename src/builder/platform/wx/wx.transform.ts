import { Injectable } from 'static-injector';
import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';
import { WxBuildPlatform } from './wx-platform';

@Injectable()
export class WxTransform extends WxTransformLike {
  directivePrefix = 'wx';
  constructor(protected buildPlatform: WxBuildPlatform) {
    super(buildPlatform);
  }
}
