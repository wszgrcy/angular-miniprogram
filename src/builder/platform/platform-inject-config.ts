import { BdZnBuildPlatform } from './bd/bdzn-platform';
import { BdZnTransform } from './bd/bdzn.transform';
import { DdBuildPlatform } from './dd/dd-platform';
import { DdTransform } from './dd/dd.transform';
import { FsBuildPlatform } from './fs/fs-platform';
import { FsTransform } from './fs/fs.transform';
import { JdBuildPlatform } from './jd/jd-platform';
import { JdTransform } from './jd/jd.transform';
import { KsBuildPlatform } from './ks/ks-platform';
import { KsTransform } from './ks/ks.transform';
import { LibraryBuildPlatform } from './library/library-platform';
import { LibraryTransform } from './library/library.transform';
import { BuildPlatform, PlatformType } from './platform';
import { QqBuildPlatform } from './qq/qq-platform';
import { QqTransform } from './qq/qq.transform';
import { TemplateTransformBase } from './template-transform-strategy/transform.base';
import { WxBuildPlatform } from './wx/wx-platform';
import { WxTransform } from './wx/wx.transform';
import { XhsBuildPlatform } from './xhs/xhs-platform';
import { XhsTransform } from './xhs/xhs.transform';
import { ZfbBuildPlatform } from './zfb/zfb-platform';
import { ZfbTransform } from './zfb/zfb.transform';
import { ZjBuildPlatform } from './zjtd/zj-platform';
import { ZjTransform } from './zjtd/zj.transform';

/**
 * `TemplateTransformBase` 用 `useExisting` 而不是 `useClass`：
 * 保证 `XxxTransform` 在同一个 injector 里只有一个实例，
 * 不会因为两个 provider 各 new 一份而状态不一致。
 */
export function getBuildPlatformInjectConfig(platform: PlatformType) {
  switch (platform) {
    case PlatformType.wx:
      return [
        { provide: WxTransform },
        { provide: TemplateTransformBase, useExisting: WxTransform },
        { provide: WxBuildPlatform },
        { provide: BuildPlatform, useClass: WxBuildPlatform },
      ];
    case PlatformType.zj:
      return [
        { provide: ZjTransform },
        { provide: TemplateTransformBase, useExisting: ZjTransform },
        { provide: ZjBuildPlatform },
        { provide: BuildPlatform, useClass: ZjBuildPlatform },
      ];
    case PlatformType.jd:
      return [
        { provide: JdTransform },
        { provide: TemplateTransformBase, useExisting: JdTransform },
        { provide: JdBuildPlatform },
        { provide: BuildPlatform, useClass: JdBuildPlatform },
      ];
    case PlatformType.bdzn:
      return [
        { provide: BdZnTransform },
        { provide: TemplateTransformBase, useExisting: BdZnTransform },
        { provide: BdZnBuildPlatform },
        { provide: BuildPlatform, useClass: BdZnBuildPlatform },
      ];
    case PlatformType.zfb:
      return [
        { provide: ZfbTransform },
        { provide: TemplateTransformBase, useExisting: ZfbTransform },
        { provide: ZfbBuildPlatform },
        { provide: BuildPlatform, useClass: ZfbBuildPlatform },
      ];
    case PlatformType.qq:
      return [
        { provide: QqTransform },
        { provide: TemplateTransformBase, useExisting: QqTransform },
        { provide: QqBuildPlatform },
        { provide: BuildPlatform, useClass: QqBuildPlatform },
      ];
    case PlatformType.dd:
      return [
        { provide: DdTransform },
        { provide: TemplateTransformBase, useExisting: DdTransform },
        { provide: DdBuildPlatform },
        { provide: BuildPlatform, useClass: DdBuildPlatform },
      ];
    case PlatformType.ks:
      return [
        { provide: KsTransform },
        { provide: TemplateTransformBase, useExisting: KsTransform },
        { provide: KsBuildPlatform },
        { provide: BuildPlatform, useClass: KsBuildPlatform },
      ];
    case PlatformType.xhs:
      return [
        { provide: XhsTransform },
        { provide: TemplateTransformBase, useExisting: XhsTransform },
        { provide: XhsBuildPlatform },
        { provide: BuildPlatform, useClass: XhsBuildPlatform },
      ];
    case PlatformType.fs:
      return [
        { provide: FsTransform },
        { provide: TemplateTransformBase, useExisting: FsTransform },
        { provide: FsBuildPlatform },
        { provide: BuildPlatform, useClass: FsBuildPlatform },
      ];
    case PlatformType.library:
      return [
        { provide: LibraryTransform },
        { provide: TemplateTransformBase, useExisting: LibraryTransform },
        { provide: LibraryBuildPlatform },
        { provide: BuildPlatform, useClass: LibraryBuildPlatform },
      ];
    default:
      throw new Error('未能匹配到相关平台');
  }
}
