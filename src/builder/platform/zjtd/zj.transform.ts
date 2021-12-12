import { Injectable } from 'static-injector';
import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';
import { ZjBuildPlatform } from './zj-platform';

@Injectable()
export class ZjTransform extends WxTransformLike {
  directivePrefix = 'tt';
  constructor(protected buildPlatform:ZjBuildPlatform) {
    super(buildPlatform);
  }
}
