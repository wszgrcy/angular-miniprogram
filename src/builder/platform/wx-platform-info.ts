import { Injectable } from 'static-injector';
import { WxTransform } from '../template-transform-strategy/wx.transform';
import { BuildPlatform } from './platform';

@Injectable()
export class WxPlatformInfo extends BuildPlatform {
  globalObject = 'wx';
  globalVariablePrefix = 'wx.__window';
  constructor(public templateTransform: WxTransform) {
    super(templateTransform);
  }
}
