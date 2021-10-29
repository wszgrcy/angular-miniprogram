import { PlatformType } from './platform';
import { WxPlatformInfo } from './wx-platform-info';

export type PlatformInfo = WxPlatformInfo;

export function getPlatformInfo(platform: PlatformType) {
  switch (platform) {
    case PlatformType.wx:
      return WxPlatformInfo;
    default:
      throw new Error('未能匹配到相关平台');
  }
}
