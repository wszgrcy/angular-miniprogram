import { PlatformType } from './platform';
import { WxBuildPlatform } from './wx/wx-platform';

export function getBuildPlatform(platform: PlatformType) {
  switch (platform) {
    case PlatformType.wx:
      return WxBuildPlatform;
    default:
      throw new Error('未能匹配到相关平台');
  }
}
