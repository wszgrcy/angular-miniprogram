import { LibraryBuildPlatform } from './library/library-platform';
import { LibraryTransform } from './library/library.transform';
import { BuildPlatform, PlatformType } from './platform';
import { WxBuildPlatform } from './wx/wx-platform';
import { WxTransform } from './wx/wx.transform';
import { ZjBuildPlatform } from './zjtd/zj-platform';
import { ZjTransform } from './zjtd/zj.transform';

export function getBuildPlatformInjectConfig(platform: PlatformType) {
  switch (platform) {
    case PlatformType.wx:
      return [
        { provide: WxTransform },
        { provide: WxBuildPlatform },
        { provide: BuildPlatform, useClass: WxBuildPlatform },
      ];
    case PlatformType.zj:
      return [
        { provide: ZjTransform },
        { provide: ZjBuildPlatform },
        { provide: BuildPlatform, useClass: ZjBuildPlatform },
      ];
    case PlatformType.library:
      return [
        { provide: LibraryTransform },
        { provide: LibraryBuildPlatform },
        { provide: BuildPlatform, useClass: LibraryBuildPlatform },
      ];
    default:
      throw new Error('未能匹配到相关平台');
  }
}
