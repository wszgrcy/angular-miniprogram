import { BdZnBuildPlatform } from './bd/bdzn-platform';
import { BdZnTransform } from './bd/bdzn.transform';
import { DdBuildPlatform } from './dd/dd-platform';
import { DdTransform } from './dd/dd.transform';
import { JdBuildPlatform } from './jd/jd-platform';
import { JdTransform } from './jd/jd.transform';
import { LibraryBuildPlatform } from './library/library-platform';
import { LibraryTransform } from './library/library.transform';
import { BuildPlatform, PlatformType } from './platform';
import { QqBuildPlatform } from './qq/qq-platform';
import { QqTransform } from './qq/qq.transform';
import { WxBuildPlatform } from './wx/wx-platform';
import { WxTransform } from './wx/wx.transform';
import { ZfbBuildPlatform } from './zfb/zfb-platform';
import { ZfbTransform } from './zfb/zfb.transform';
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
    case PlatformType.jd:
      return [
        { provide: JdTransform },
        { provide: JdBuildPlatform },
        { provide: BuildPlatform, useClass: JdBuildPlatform },
      ];
    case PlatformType.bdzn:
      return [
        { provide: BdZnTransform },
        { provide: BdZnBuildPlatform },
        { provide: BuildPlatform, useClass: BdZnBuildPlatform },
      ];
    case PlatformType.zfb:
      return [
        { provide: ZfbTransform },
        { provide: ZfbBuildPlatform },
        { provide: BuildPlatform, useClass: ZfbBuildPlatform },
      ];
    case PlatformType.qq:
      return [
        { provide: QqTransform },
        { provide: QqBuildPlatform },
        { provide: BuildPlatform, useClass: QqBuildPlatform },
      ];
    case PlatformType.dd:
      return [
        { provide: DdTransform },
        { provide: DdBuildPlatform },
        { provide: BuildPlatform, useClass: DdBuildPlatform },
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
