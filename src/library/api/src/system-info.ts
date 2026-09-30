/* eslint-disable @typescript-eslint/no-explicit-any */
import { MpPlatform } from './types';

/**
 * 系统信息增强，参考 uni-mp-core 的 enhanceSystemInfo 族：
 * 各家 getSystemInfo(Sync) 的字段口径不一，这里归一成 uni 同款的
 * device / host / os / platform / safeAreaInsets 字段。
 *
 * 与参考实现的差异：
 * - 平台判断用运行时 MpPlatform 参数，不用编译期常量
 * - 不搬运 uni 身份字段（uniPlatform/uniCompileVersion 等）
 * - deviceId 不做模块级缓存（避免测试串扰），每次读存储
 */

const UUID_KEY = '__AMP_DEVICE_UUID';

export function addSafeAreaInsets(
  fromRes: any,
  toRes: Record<string, any>,
) {
  if (fromRes.safeArea) {
    const safeArea = fromRes.safeArea;
    toRes.safeAreaInsets = {
      top: safeArea.top,
      left: safeArea.left,
      right: fromRes.windowWidth - safeArea.right,
      bottom: fromRes.screenHeight - safeArea.bottom,
    };
  }
}

/** 设备唯一标识：读存储，缺失则生成并异步写入（同 uni 的 __DC_STAT_UUID 策略） */
export function useDeviceId(global: any) {
  return (_fromRes: any, toRes: Record<string, any>): void => {
    let deviceId: string | undefined;
    try {
      deviceId = global?.getStorageSync?.(UUID_KEY) || undefined;
    } catch {
      deviceId = undefined;
    }
    if (!deviceId) {
      deviceId = Date.now() + '' + Math.floor(Math.random() * 1e7);
      try {
        global?.setStorage?.({ key: UUID_KEY, data: deviceId });
      } catch {
        /* 存储失败不影响本次返回 */
      }
    }
    toRes.deviceId = deviceId;
  };
}

/**
 * 解析 osName/osVersion。
 * 各家 system 字段格式不一：微信是「系统 版本」，
 * 支付宝/百度/京东是「版本」需借 platform 字段当 osName。
 */
export function getOSInfo(
  platform: MpPlatform,
  system = '',
  platformField = '',
): { osName: string; osVersion: string; system: string } {
  let osName = '';
  let osVersion = '';

  if (
    platformField &&
    (platform === 'my' || platform === 'swan' || platform === 'jd')
  ) {
    osName = platformField;
    osVersion = system;
    system = `${osName} ${osVersion}`;
  } else {
    if (platform === 'wx') {
      osName = platformField;
    } else {
      osName = system.split(' ')[0] || platformField;
    }
    osVersion = system.split(' ')[1] || '';
  }

  osName = osName.toLowerCase();

  switch (osName) {
    case 'harmony':
    case 'ohos':
    case 'openharmonyos':
    case 'openharmony':
      osName = 'harmonyos';
      break;
    case 'iphone os':
      osName = 'ios';
      break;
    case 'mac':
    case 'darwin':
      osName = 'macos';
      break;
    case 'windows_nt':
      osName = 'windows';
      break;
  }

  return {
    osName: osName.trim(),
    osVersion: osVersion.trim(),
    system: system.trim(),
  };
}

/** platform 字段归一：ohos/harmony/iphone os 等各家写法 → 统一值 */
export function normalizePlatform(
  platform: MpPlatform,
  platformField: string,
) {
  const p = (platformField || '').toLowerCase();
  if (platform === 'wx') {
    if (p === 'ohos') {
      return 'harmonyos';
    }
  } else {
    switch (p) {
      case 'iphone os':
        return 'ios';
      case 'openharmonyos':
      case 'openharmony':
      case 'harmony':
        return 'harmonyos';
    }
  }
  return p;
}

/** 设备类型推断：ipad→pad，windows/mac/linux/pc→pc，微信 ohos_pc→pc */
export function getDeviceType(
  fromRes: any,
  model = '',
  platform: MpPlatform,
) {
  const platformField = fromRes.platform || '';
  let deviceType = fromRes.deviceType || 'phone';
  const deviceTypeMaps: Record<string, string> = {
    ipad: 'pad',
    windows: 'pc',
    mac: 'pc',
    linux: 'pc',
    pc: 'pc',
  };
  const _model = model.toLowerCase();
  for (const key of Object.keys(deviceTypeMaps)) {
    if (_model.indexOf(key) !== -1) {
      deviceType = deviceTypeMaps[key];
      break;
    }
  }
  if (platform === 'wx' && platformField === 'ohos_pc') {
    deviceType = 'pc';
  }
  return deviceType;
}

export function getDeviceBrand(brand: string) {
  return brand ? brand.toLowerCase() : brand;
}

/** 宿主名：各家字段名完全不同，逐家映射 */
export function getHostName(fromRes: any, platform: MpPlatform) {
  switch (platform) {
    case 'wx':
      if (fromRes.environment) {
        return fromRes.environment;
      }
      if (fromRes.host && fromRes.host.env) {
        return fromRes.host.env;
      }
      return 'WeChat';
    case 'my':
      return fromRes.app || 'Alipay';
    case 'tt':
      return fromRes.appName || 'Douyin';
    case 'swan':
      return fromRes.host || 'Baidu';
    case 'qq':
      return fromRes.AppPlatform || 'QQ';
    case 'dd':
      return fromRes.hostName || 'DingTalk';
    case 'jd':
      return fromRes.hostName || 'JD';
  }
}

function getHostVersion(fromRes: any, platform: MpPlatform) {
  if (platform === 'swan') {
    return fromRes.swanNativeVersion;
  }
  if (platform === 'jd') {
    return fromRes.hostVersionName;
  }
  return fromRes.version;
}

/** 全量增强：raw getSystemInfo(Sync) 结果 + 归一字段 */
export function enhanceSystemInfo(
  platform: MpPlatform,
  global: any,
  fromRes: any,
  toRes: Record<string, any> = {},
) {
  const {
    brand = '',
    model = '',
    system = '',
    language = '',
    theme,
    platform: platformField = '',
    fontSizeSetting,
    SDKVersion,
    pixelRatio,
    deviceOrientation,
  } = fromRes;

  const { osName, osVersion, system: updatedSystem } = getOSInfo(
    platform,
    system,
    platformField,
  );
  const hostLanguage = (language || '').replace(/_/g, '-');

  Object.assign(toRes, fromRes, {
    deviceBrand: getDeviceBrand(brand),
    deviceModel: model,
    deviceType: getDeviceType(fromRes, model, platform),
    devicePixelRatio: platform === 'swan' ? fromRes.devicePixelRatio : pixelRatio,
    deviceOrientation:
      platform === 'swan' ? fromRes.orientation : deviceOrientation,
    osName,
    osVersion,
    hostTheme: theme,
    hostVersion: getHostVersion(fromRes, platform),
    hostLanguage,
    hostName: getHostName(fromRes, platform),
    // 支付宝的 SDKVersion 不在 getSystemInfo 结果里，挂在全局
    hostSDKVersion: platform === 'my' ? global?.SDKVersion : SDKVersion,
    hostFontSizeSetting: fontSizeSetting,
    windowTop: 0,
    windowBottom: 0,
    platform: normalizePlatform(platform, platformField),
    system: updatedSystem,
  });

  addSafeAreaInsets(fromRes, toRes);
  useDeviceId(global)(fromRes, toRes);
  return toRes;
}

/** getDeviceInfo 口径（uni：同步 API） */
export function buildDeviceInfo(
  platform: MpPlatform,
  global: any,
  fromRes: any,
) {
  const to: Record<string, any> = {};
  useDeviceId(global)(fromRes, to);
  const { brand, model, platform: platformField = '' } = fromRes;
  let { system = '' } = fromRes;
  // 支付宝 system 格式与文档不一致：「iPhone iOS 16.6」取版本段
  if (platform === 'my') {
    system = String(system).split(' ')[1] ?? '';
  }
  const { osName, osVersion } = getOSInfo(platform, system, platformField);
  Object.assign(to, {
    deviceType: getDeviceType(fromRes, model, platform),
    deviceBrand: getDeviceBrand(brand),
    deviceModel: model,
    osName,
    osVersion,
    platform: normalizePlatform(platform, platformField),
  });
  return to;
}

/** getAppBaseInfo 口径 */
export function buildAppBaseInfo(
  platform: MpPlatform,
  global: any,
  fromRes: any,
) {
  const { language = '', fontSizeSetting } = fromRes;
  const hostLanguage = (language || '').replace(/_/g, '-');
  return {
    hostName: getHostName(fromRes, platform),
    hostVersion: getHostVersion(fromRes, platform),
    hostLanguage,
    hostSDKVersion: platform === 'my' ? global?.SDKVersion : fromRes.SDKVersion,
    hostFontSizeSetting: fontSizeSetting,
    language: fromRes.language,
    appLanguage: hostLanguage,
  };
}

/** getWindowInfo 口径 */
export function buildWindowInfo(
  _platform: MpPlatform,
  _global: any,
  fromRes: any,
) {
  const to: Record<string, any> = {
    windowWidth: fromRes.windowWidth,
    windowHeight: fromRes.windowHeight,
    statusBarHeight: fromRes.statusBarHeight,
    safeArea: fromRes.safeArea,
    pixelRatio: fromRes.pixelRatio,
    windowTop: 0,
    windowBottom: 0,
  };
  addSafeAreaInsets(fromRes, to);
  return to;
}
