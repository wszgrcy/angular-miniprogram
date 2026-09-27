import { PlatformType } from '../platform/platform';
import {
  PLATFORM_FLAG_NAMES,
  platformConditionDefine,
} from './platform-flags';

describe('platform-flags: define 生成', () => {
  it('wx 平台：__MP_WX__ 为 true，其余为 false', () => {
    const define = platformConditionDefine(PlatformType.wx);
    expect(define.__MP_WX__).toBe('true');
    expect(define.__MP_ZFB__).toBe('false');
    expect(define.__MP_ZJ__).toBe('false');
    expect(define.__MP_BDZN__).toBe('false');
    expect(define.__MP_QQ__).toBe('false');
    expect(define.__MP_DD__).toBe('false');
    expect(define.__MP_JD__).toBe('false');
  });

  it('__MP_PLATFORM__ 是带引号的平台字符串', () => {
    expect(platformConditionDefine(PlatformType.zfb).__MP_PLATFORM__).toBe(
      '"zfb"'
    );
    expect(platformConditionDefine(PlatformType.wx).__MP_PLATFORM__).toBe(
      '"wx"'
    );
  });

  it('每个 PlatformType 都有对应 flag，且恰好一个为 true', () => {
    for (const platform of Object.values(PlatformType)) {
      const define = platformConditionDefine(platform);
      const trues = Object.values(PLATFORM_FLAG_NAMES).filter(
        (flag) => define[flag] === 'true'
      );
      expect(trues.length).toBe(1);
      expect(trues[0]).toBe(PLATFORM_FLAG_NAMES[platform]);
    }
  });
});
