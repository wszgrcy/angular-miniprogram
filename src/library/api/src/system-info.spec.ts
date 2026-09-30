/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  buildAppBaseInfo,
  buildDeviceInfo,
  buildWindowInfo,
  enhanceSystemInfo,
  getDeviceType,
  getHostName,
  getOSInfo,
  normalizePlatform,
} from './system-info';

describe('系统信息族（参考 enhanceSystemInfo 移植）', () => {
  describe('getOSInfo', () => {
    it('微信：system=「iOS 16.6」拆 osName/osVersion', () => {
      const r = getOSInfo('wx', 'iOS 16.6', 'ios');
      expect(r.osName).toBe('ios');
      expect(r.osVersion).toBe('16.6');
    });

    it('支付宝：osName 取 platform 字段，osVersion 取 system', () => {
      const r = getOSInfo('my', '16.6', 'iOS');
      expect(r.osName).toBe('ios');
      expect(r.osVersion).toBe('16.6');
      expect(r.system).toBe('iOS 16.6');
    });

    it('osName 归一：iphone os/ohos/mac/darwin/windows_nt', () => {
      expect(getOSInfo('my', '1', 'iPhone OS').osName).toBe('ios');
      expect(getOSInfo('wx', 'OpenHarmonyOS 1.0', 'OpenHarmonyOS').osName).toBe(
        'harmonyos',
      );
      expect(getOSInfo('wx', 'mac OS X 14', 'mac').osName).toBe('macos');
      expect(getOSInfo('tt', 'Darwin 23', 'darwin').osName).toBe('macos');
    });
  });

  describe('normalizePlatform', () => {
    it('微信 ohos -> harmonyos', () => {
      expect(normalizePlatform('wx', 'ohos')).toBe('harmonyos');
      expect(normalizePlatform('wx', 'devtools')).toBe('devtools');
    });
    it('其他家 iphone os -> ios, harmony -> harmonyos', () => {
      expect(normalizePlatform('my', 'iPhone OS')).toBe('ios');
      expect(normalizePlatform('my', 'Harmony')).toBe('harmonyos');
    });
  });

  describe('getDeviceType', () => {
    it('ipad -> pad, mac -> pc', () => {
      expect(getDeviceType({}, 'iPad Pro', 'wx')).toBe('pad');
      expect(getDeviceType({}, 'MacBook Pro', 'wx')).toBe('pc');
    });
    it('微信 ohos_pc -> pc', () => {
      expect(getDeviceType({ platform: 'ohos_pc' }, 'HUAWEI', 'wx')).toBe('pc');
    });
    it('默认 phone', () => {
      expect(getDeviceType({}, 'MI 14', 'wx')).toBe('phone');
    });
  });

  describe('getHostName 逐家映射', () => {
    it('wx: environment > host.env > WeChat', () => {
      expect(getHostName({ environment: 'devtools' }, 'wx')).toBe('devtools');
      expect(getHostName({ host: { env: 'ide' } }, 'wx')).toBe('ide');
      expect(getHostName({}, 'wx')).toBe('WeChat');
    });
    it('my/tt/swan/qq 各自字段', () => {
      expect(getHostName({ app: 'alipay' }, 'my')).toBe('alipay');
      expect(getHostName({ appName: '抖音' }, 'tt')).toBe('抖音');
      expect(getHostName({ host: 'baidu' }, 'swan')).toBe('baidu');
      expect(getHostName({ AppPlatform: 'qq' }, 'qq')).toBe('qq');
    });
  });

  describe('enhanceSystemInfo', () => {
    const global: any = {
      SDKVersion: '10.5.0',
      getStorageSync: () => 'cached-device',
      setStorage: () => undefined,
    };

    it('合并原始字段 + 归一字段', () => {
      const res = enhanceSystemInfo('wx', global, {
        brand: 'Apple',
        model: 'iPhone 14',
        system: 'iOS 16.6',
        platform: 'ios',
        language: 'zh_CN',
        SDKVersion: '8.0.30',
        pixelRatio: 3,
        windowWidth: 390,
        screenHeight: 844,
        safeArea: { top: 47, left: 0, right: 390, bottom: 810 },
      });
      expect(res.deviceBrand).toBe('apple');
      expect(res.osName).toBe('ios');
      expect(res.osVersion).toBe('16.6');
      expect(res.hostLanguage).toBe('zh-CN');
      expect(res.hostName).toBe('WeChat');
      expect(res.hostSDKVersion).toBe('8.0.30');
      expect(res.windowTop).toBe(0);
      expect(res.safeAreaInsets).toEqual({ top: 47, left: 0, right: 0, bottom: 34 });
      expect(res.deviceId).toBe('cached-device');
      // 原始字段保留
      expect(res.model).toBe('iPhone 14');
    });

    it('支付宝 SDKVersion 从全局取', () => {
      const res = enhanceSystemInfo('my', global, { language: 'zh-Hans' });
      expect(res.hostSDKVersion).toBe('10.5.0');
    });

    it('百度 hostVersion/devicePixelRatio 用专属字段', () => {
      const res = enhanceSystemInfo('swan', global, {
        swanNativeVersion: '3.20',
        devicePixelRatio: 2.5,
        orientation: 'portrait',
      });
      expect(res.hostVersion).toBe('3.20');
      expect(res.devicePixelRatio).toBe(2.5);
      expect(res.deviceOrientation).toBe('portrait');
    });

    it('deviceId 缺失时生成并写存储', () => {
      const writes: any[] = [];
      const g: any = {
        getStorageSync: () => '',
        setStorage: (opts: any) => writes.push(opts),
      };
      const res = enhanceSystemInfo('wx', g, {});
      expect(typeof res.deviceId).toBe('string');
      expect(writes[0].key).toBe('__AMP_DEVICE_UUID');
      expect(writes[0].data).toBe(res.deviceId);
    });
  });

  describe('拆分口径', () => {
    const global: any = {
      SDKVersion: '10.5.0',
      getStorageSync: () => 'd1',
      setStorage: () => undefined,
    };

    it('buildDeviceInfo: 支付宝 system 取版本段', () => {
      const res = buildDeviceInfo('my', global, {
        brand: 'Apple',
        model: 'iPhone',
        system: 'iOS 16.6',
        platform: 'iOS',
      });
      expect(res.osVersion).toBe('16.6');
      expect(res.osName).toBe('ios');
      expect(res.deviceId).toBe('d1');
      expect(res.platform).toBe('ios');
    });

    it('buildAppBaseInfo: host 字段族', () => {
      const res = buildAppBaseInfo('wx', global, {
        version: '8.0.30',
        language: 'zh_CN',
        fontSizeSetting: 16,
        SDKVersion: '8.0.30',
      });
      expect(res.hostName).toBe('WeChat');
      expect(res.hostVersion).toBe('8.0.30');
      expect(res.appLanguage).toBe('zh-CN');
      expect(res.hostFontSizeSetting).toBe(16);
    });

    it('buildWindowInfo: 补 safeAreaInsets 与 windowTop/Bottom', () => {
      const res = buildWindowInfo('wx', global, {
        windowWidth: 375,
        windowHeight: 667,
        statusBarHeight: 20,
        pixelRatio: 2,
        safeArea: { top: 20, left: 0, right: 375, bottom: 667 },
        screenHeight: 667,
      });
      expect(res.windowTop).toBe(0);
      expect(res.windowBottom).toBe(0);
      expect(res.safeAreaInsets).toEqual({ top: 20, left: 0, right: 0, bottom: 0 });
      expect(res.statusBarHeight).toBe(20);
    });
  });
});
