import { WxTransform } from '../template-transform-strategy/wx.transform';

export class WxPlatformInfo {
  globalObject = 'wx';
  templateTransform = new WxTransform();
}
