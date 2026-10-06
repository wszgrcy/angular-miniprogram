/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectionToken } from '@angular/core';
import { MpFieldMap, MpMapFn } from './protocol-engine';
import { MpCallbackOptions, MpPlatform } from './types';

/** 自定义协议直接接管目标调用（如 showModal 需按参数选 alert/confirm） */
export type MpCustomCall = (
  targetName: string,
  targetArgs: MpCallbackOptions,
) => any;

/**
 * 单个 API 在某个平台上的差异协议（声明式）。
 * args / returnValue 共用 key 级引擎（protocol-engine），
 * 表格内容可对照 uni 的 protocols 逐条搬运。
 */
export interface MpApiProtocol {
  /** 目标平台 API 名，默认为统一名本身 */
  name?: string;
  /** 统一参数 -> 平台参数 */
  args?: MpFieldMap | MpMapFn;
  /** 结果整体替换（如支付宝 getStorageSync 的 {data} 拆封） */
  transformResult?: (res: any) => any;
  /** 平台结果 -> 统一结果（成功结果） */
  returnValue?: MpFieldMap | MpMapFn;
  /** 完全自定义：拿到已包装好回调的 options，自行选择目标 API */
  custom?: (args: MpCallbackOptions, call: MpCustomCall) => any;
  /**
   * canIUse 探测用的平台 API 名。`custom` 协议由多个平台 API 合成，
   * 无法从统一名直接推知，需显式声明；全部存在才算支持。
   */
  probe?: string[];
}

export type MpProtocolTable = Record<string, MpApiProtocol>;

const MODAL_OK = 'showModal:ok';

/** 微信口径 showModal -> alert/confirm 口径 */
function modalCustom(
  alertName: string,
  confirmName: string,
  confirmButtonText: string,
  cancelButtonText: string,
) {
  return (options: MpCallbackOptions, call: MpCustomCall) => {
    const {
      title,
      content,
      showCancel,
      confirmText,
      cancelText,
      success,
      fail,
      complete,
    } = options;
    if (showCancel === false) {
      return call(alertName, {
        title,
        content,
        success: () =>
          success?.({ confirm: true, cancel: false, errMsg: MODAL_OK }),
        fail,
        complete,
      });
    }
    return call(confirmName, {
      title,
      content,
      confirmButtonText: confirmText ?? confirmButtonText,
      cancelButtonText: cancelText ?? cancelButtonText,
      success: (res: any) =>
        success?.({
          confirm: !!res.confirm,
          cancel: !res.confirm,
          errMsg: MODAL_OK,
        }),
      fail,
      complete,
    });
  };
}

const NETWORK_VALUE_MAP: Record<string, string> = {
  NOTREACHABLE: 'none',
  WWAN: '3g',
};

/**
 * 支付宝系统信息归一（对照 uni-mp-alipay 的 handleSystemInfo）：
 * screen 对象修正屏幕尺寸、safeArea 补 insets、platform 小写化（IDE 归 devtools）。
 */
function normalizeAlipaySystemInfo(res: any) {
  if (!res || typeof res !== 'object') {
    return res;
  }
  const out: any = { ...res };
  if (res.screen) {
    out.screenWidth = res.screen.width;
    out.screenHeight = res.screen.height;
  }
  if (res.safeArea && !out.safeAreaInsets) {
    const { top, left, right, bottom } = res.safeArea;
    out.safeAreaInsets = { top, left, right, bottom };
  }
  const g: any = globalThis;
  out.platform = g.my?.isIDE
    ? 'devtools'
    : res.platform
      ? String(res.platform).toLowerCase()
      : 'devtools';
  return out;
}

/** getFileSystemManager 补丁防重复包装 */
const normalizedFsManagers = new WeakSet<object>();

/** 微信 icon 值域 -> 支付宝 type 值域 */
function toastType(v: string) {
  return v === 'error' ? 'fail' : v;
}

/** 支付宝/钉钉同步存储返回 { data }，需拆封；无存储时归一为空串 */
function unwrapSyncStorage(res: any) {
  return res && res.data !== null && res.data !== undefined ? res.data : '';
}

/** 微信口径网络枚举 <- 支付宝口径（对照 uni-mp-alipay handleNetworkInfo） */
function normalizeNetworkType(v: string) {
  return NETWORK_VALUE_MAP[v] ?? String(v).toLowerCase();
}

/**
 * 支付宝系协议表（my / dd 共用，对照 uni-mp-alipay/src/api/protocols.ts 搬运）。
 * 钉钉差异在 DINGTALK 表里叠加覆盖。
 */
const ALIPAY: MpProtocolTable = {
  // ---------------------------------------------------------- 网络
  request: {
    // wx 用 header，支付宝系用 headers 且 content-type 小写
    args: (from, to) => {
      const headers: Record<string, string> = {
        'content-type': 'application/json',
      };
      Object.keys(from.header ?? {}).forEach((key) => {
        headers[key.toLowerCase()] = from.header[key];
      });
      to.headers = headers;
      return { header: false, responseType: false };
    },
    returnValue: { status: 'statusCode', headers: 'header' },
  },
  downloadFile: {
    returnValue: { apFilePath: 'tempFilePath' },
  },
  uploadFile: {
    args: { name: 'fileName' },
  },
  connectSocket: {
    args: { method: false },
  },

  // ---------------------------------------------------------- 交互
  showModal: {
    custom: modalCustom('alert', 'confirm', '确定', '取消'),
    probe: ['alert', 'confirm'],
  },
  showToast: {
    // icon -> type 且值域转换，需表级函数形态（字段级函数只能改值不能换 key）
    args: (from, to) => {
      if (from.icon !== undefined) {
        to.type = toastType(from.icon);
      }
      return { title: 'content', icon: false };
    },
  },
  showLoading: {
    args: { title: 'content' },
  },
  showActionSheet: {
    // my 收 items（纯字符串数组），回 index；wx 是 itemList + tapIndex
    args: (from, to) => {
      to.items = (from.itemList ?? []).map((item: any) =>
        typeof item === 'string' ? item : item.name,
      );
      return { itemList: false, itemColor: false };
    },
    returnValue: { index: 'tapIndex' },
  },

  // ---------------------------------------------------------- 导航栏 / 页面
  setNavigationBarTitle: { name: 'setNavigationBar' },
  setNavigationBarColor: {
    name: 'setNavigationBar',
    args: { frontColor: false, animation: false },
  },
  pageScrollTo: {
    // my 默认无动画，补齐 wx 默认值
    args: (from, to) => {
      if (from.duration === undefined) {
        to.duration = 300;
      }
    },
  },

  // ---------------------------------------------------------- 剪贴板 / 系统
  setClipboardData: {
    name: 'setClipboard',
    args: { data: 'text' },
  },
  getClipboardData: {
    name: 'getClipboard',
    returnValue: { text: 'data' },
  },
  getStorageSync: { transformResult: unwrapSyncStorage },
  onAccelerometerChange: {
    name: 'onAccelerometer',
    transformResult: ({ x, y, z }: any) => ({ x, y, z }),
  },
  offAccelerometerChange: { name: 'offAccelerometer' },
  onCompassChange: {
    name: 'onCompass',
    transformResult: ({ direction }: any) => ({ direction }),
  },
  offCompassChange: { name: 'offCompass' },
  getNetworkType: {
    returnValue: { networkType: normalizeNetworkType },
  },
  onNetworkStatusChange: {
    returnValue: { networkType: normalizeNetworkType },
  },
  getSetting: { name: 'getAuthSetting' },
  openSetting: { name: 'openAuthSetting' },
  authorize: {
    args: { scope: 'scopeName' },
  },
  makePhoneCall: {
    args: { phoneNumber: 'number' },
  },
  setScreenBrightness: { args: { value: 'brightness' } },
  getScreenBrightness: { returnValue: { brightness: 'value' } },

  // ---------------------------------------------------------- 媒体 / 文件
  previewImage: {
    // 微信 current 是 url，支付宝是下标；下标可能是 0（假值），走函数形态直写
    args: (from, to) => {
      const urls: string[] = from.urls ?? [];
      to.current =
        typeof from.current === 'number'
          ? from.current
          : Math.max(0, urls.indexOf(String(from.current)));
    },
  },
  chooseImage: {
    // my 返回 apFilePaths，补齐 wx 的 tempFilePaths / tempFiles
    transformResult: (res: any) => {
      if (!res || typeof res !== 'object') {
        return res;
      }
      const out = { ...res };
      if (!out.tempFilePaths && out.apFilePaths) {
        out.tempFilePaths = [...out.apFilePaths];
      }
      if (!out.tempFiles && out.tempFilePaths) {
        out.tempFiles = out.tempFilePaths.map((path: string) => ({ path }));
      }
      return out;
    },
  },
  chooseVideo: {
    returnValue: { apFilePath: 'tempFilePath' },
  },
  compressImage: {
    // wx quality(0-100) -> my compressLevel(0-4)；src -> apFilePaths[0]
    args: (from, to) => {
      to.compressLevel = 4;
      if (from.quality) {
        to.compressLevel = Math.floor(from.quality / 26);
      }
      if (from.src) {
        to.apFilePaths = [from.src];
      }
      return { src: false, quality: false };
    },
    transformResult: (res: any) =>
      res?.apFilePaths?.length
        ? { ...res, tempFilePath: res.apFilePaths[0] }
        : res,
  },
  saveFile: {
    args: { tempFilePath: 'apFilePath' },
    returnValue: { apFilePath: 'savedFilePath' },
  },
  getFileInfo: { args: { filePath: 'apFilePath' } },
  getSavedFileInfo: { args: { filePath: 'apFilePath' } },
  removeSavedFile: { args: { filePath: 'apFilePath' } },
  getSavedFileList: {
    transformResult: (res: any) =>
      res?.fileList
        ? {
            ...res,
            fileList: res.fileList.map((f: any) => ({
              filePath: f.apFilePath ?? f.filePath,
              createTime: f.createTime,
              size: f.size,
            })),
          }
        : res,
  },
  saveVideoToPhotosAlbum: { args: { filePath: 'src' } },
  openDocument: {
    // my 的 showMenu 是字符串
    args: (from, to) => {
      if (typeof from.showMenu === 'boolean') {
        to.showMenu = String(from.showMenu);
      }
    },
  },
  canvasToTempFilePath: {
    // 真机可能直接给 tempFilePath，有 apFilePath 才改写
    transformResult: (res: any) =>
      res?.apFilePath ? { ...res, tempFilePath: res.apFilePath } : res,
  },
  getFileSystemManager: {
    // 对照 uni：支付宝 stat({recursive:true}) 返回的 stats 是对象而非数组
    transformResult: (manager: any) => {
      if (
        !manager ||
        typeof manager.stat !== 'function' ||
        normalizedFsManagers.has(manager)
      ) {
        return manager;
      }
      const stat = manager.stat;
      manager.stat = function (options: any) {
        if (
          options &&
          typeof options === 'object' &&
          options.recursive === true
        ) {
          (['success', 'complete'] as const).forEach((name) => {
            const cb = options[name];
            if (typeof cb === 'function') {
              options[name] = (res: any) => {
                if (res && res.stats && !Array.isArray(res.stats)) {
                  res.stats = Object.values(res.stats);
                }
                return cb.call(this, res);
              };
            }
          });
        }
        return stat.call(this, options);
      };
      normalizedFsManagers.add(manager);
      return manager;
    },
  },

  // ---------------------------------------------------------- 位置
  getLocation: { args: { type: false, altitude: false } },
  openLocation: {
    args: (from, to) => {
      if (from.scale === undefined) {
        to.scale = 18;
      }
    },
  },

  // ---------------------------------------------------------- 扫码 / 登录 / 支付
  scanCode: {
    name: 'scan',
    args: { onlyFromCamera: 'hideAlbum' },
    returnValue: { code: 'result' },
  },
  login: {
    name: 'getAuthCode',
    returnValue: { authCode: 'code' },
  },
  getUserInfo: {
    // 对照 uni：新版支付宝走 getOpenUserInfo（结果包在 response JSON 里），
    // 旧版走 getAuthUserInfo（avatar -> avatarUrl）
    custom: (opts, call) => {
      const g: any = globalThis;
      const oldSuccess = opts.success;
      if (g.my?.canIUse?.('getOpenUserInfo')) {
        return call('getOpenUserInfo', {
          ...opts,
          success: (res: any) => {
            let parsed: any;
            try {
              parsed = JSON.parse(res?.response).response;
            } catch {
              /* 解析失败保持原样 */
            }
            oldSuccess?.({
              ...res,
              userInfo: parsed
                ? { ...parsed, avatarUrl: parsed.avatar }
                : undefined,
            });
          },
        });
      }
      return call('getAuthUserInfo', {
        ...opts,
        success: (res: any) =>
          oldSuccess?.({
            ...res,
            userInfo: {
              openId: '',
              nickName: res?.nickName,
              avatarUrl: res?.avatar,
            },
          }),
      });
    },
  },
  chooseAddress: {
    name: 'getAddress',
    transformResult: (res: any) => {
      const info = res?.result ?? {};
      return {
        ...res,
        userName: info.fullname,
        countyName: info.area,
        provinceName: info.prov,
        cityName: info.city,
        detailInfo: info.address,
        telNumber: info.mobilePhone,
      };
    },
  },
  hideHomeButton: { name: 'hideBackHome' },
  showShareMenu: { name: 'showSharePanel' },
  stopGyroscope: { name: 'offGyroscopeChange' },
  getDeviceInfo: { name: 'getDeviceBaseInfo' },
  saveImageToPhotosAlbum: {
    // 新版支付宝同名；旧版只有 saveImage(filePath -> url)
    custom: (opts, call) => {
      const g: any = globalThis;
      if (g.my?.canIUse?.('saveImageToPhotosAlbum')) {
        return call('saveImageToPhotosAlbum', opts);
      }
      const { filePath, ...rest } = opts;
      return call('saveImage', { ...rest, url: filePath });
    },
  },
  getSystemInfo: { transformResult: normalizeAlipaySystemInfo },
  getSystemInfoSync: { transformResult: normalizeAlipaySystemInfo },
  requestPayment: {
    name: 'tradePay',
    args: { orderInfo: 'tradeNO' },
  },

  // ---------------------------------------------------------- 传感器 / 蓝牙
  stopAccelerometer: { name: 'offAccelerometerChange' },
  stopCompass: { name: 'offCompassChange' },
  createBLEConnection: { name: 'connectBLEDevice', args: { timeout: false } },
  closeBLEConnection: { name: 'disconnectBLEDevice' },
  onBLEConnectionStateChange: { name: 'onBLEConnectionStateChanged' },
  getBLEDeviceServices: {
    transformResult: (res: any) =>
      res?.services
        ? {
            ...res,
            services: res.services.map((s: any) => ({
              uuid: s.serviceId ?? s.uuid,
              isPrimary: s.isPrimary,
            })),
          }
        : res,
  },
};

/** 钉钉：支付宝系底子 + 自有差异（对照 uni：dd 的 request 叫 httpRequest） */
const DINGTALK: MpProtocolTable = {
  ...ALIPAY,
  request: { name: 'httpRequest' },
};

/**
 * 微信(wx)协议表：对照 uni-mp-weixin/src/api/shims.ts。
 */
const WX: MpProtocolTable = {
  shareVideoMessage: {
    // SAAASDK 宿主里分享视频要走 wx.miniapp 命名空间
    custom: (opts, call) => {
      const g: any = globalThis;
      let hostEnv = '';
      try {
        const base = g.wx?.getAppBaseInfo?.() ?? g.wx?.getSystemInfoSync?.();
        hostEnv = base?.host?.env ?? '';
      } catch {
        /* 取不到宿主信息时按普通 wx 处理 */
      }
      if (
        hostEnv === 'SAAASDK' &&
        typeof g.wx?.miniapp?.shareVideoMessage === 'function'
      ) {
        return g.wx.miniapp.shareVideoMessage(opts);
      }
      return call('shareVideoMessage', opts);
    },
  },
};

/**
 * 核心协议（对照 uni-mp-core，全平台生效）。
 */
const CORE: MpProtocolTable = {
  previewImage: {
    // uni 允许 current 传数字串索引：钳位后重排 urls 使原生从目标图开始
    args: (from: any, to: any) => {
      const parsed = parseInt(from?.current, 10);
      if (isNaN(parsed)) {
        return;
      }
      const urls = from.urls;
      if (!Array.isArray(urls) || !urls.length) {
        return;
      }
      const currentIndex = Math.min(Math.max(parsed, 0), urls.length - 1);
      if (currentIndex > 0) {
        to.current = urls[currentIndex];
        to.urls = urls.filter((item: string, i: number) =>
          i < currentIndex ? item !== urls[currentIndex] : true,
        );
      } else {
        to.current = urls[0];
      }
      return { indicator: false, loop: false };
    },
  },
};

/**
 * 百度(swan)协议表，搬运自 uni-mp-baidu/src/api/protocols.ts。
 */
const BAIDU: MpProtocolTable = {
  request: {
    // 百度默认按 json 解析，uni 强制非 json 一律 dataType:'string'
    args: (from: any, to: any) => {
      to.dataType = from.dataType === 'json' ? 'json' : 'string';
    },
  },
  connectSocket: { args: { method: false } },
  scanCode: { args: { onlyFromCamera: false, scanType: false } },
  navigateToMiniProgram: {
    name: 'navigateToSmartProgram',
    args: { appId: 'appKey' },
  },
  navigateBackMiniProgram: { name: 'navigateBackSmartProgram' },
  showShareMenu: { name: 'openShare' },
  login: { name: 'getLoginCode' },
  getAccountInfoSync: {
    name: 'getEnvInfoSync',
    transformResult: (res: any) => ({
      ...res,
      miniProgram: { appId: res?.appKey },
      plugin: { appId: '', version: res?.sdkVersion },
    }),
  },
  getRecorderManager: {
    transformResult: (manager: any) =>
      stubUnsupported(manager, ['onFrameRecorded'], 'RecorderManager'),
  },
  getBackgroundAudioManager: {
    transformResult: (manager: any) =>
      stubUnsupported(manager, ['onPrev', 'onNext'], 'BackgroundAudioManager'),
  },
};

/** 对照 uni 的 createTodoMethod：平台缺失能力调用时给出明确提示 */
function stubUnsupported(manager: any, methods: string[], contextName: string) {
  methods.forEach((method) => {
    manager[method] = () =>
      // eslint-disable-next-line no-console
      console.error(`swan ${contextName} 暂不支持 ${method}`);
  });
  return manager;
}

/**
 * 抖音(tt)协议表，搬运自 uni-mp-toutiao/src/api/protocols.ts。
 */
const TOUTIAO: MpProtocolTable = {
  connectSocket: { args: { method: false } },
  scanCode: { args: { onlyFromCamera: false, scanType: false } },
  startAccelerometer: { args: { interval: false } },
  login: { args: { scopes: false, timeout: false } },
  getUserInfo: { args: { lang: false, timeout: false } },
  requestPayment: {
    // 抖音新版叫 pay(orderInfo 原样)，旧版 requestPayment(orderInfo -> data)
    custom: (opts, call) => {
      const g: any = globalThis;
      if (g.tt?.pay) {
        return call('pay', opts);
      }
      const { orderInfo, ...rest } = opts;
      return call('requestPayment', { ...rest, data: orderInfo });
    },
  },
  showTabBar: { args: tabbarAnimationArgs },
  hideTabBar: { args: tabbarAnimationArgs },
};

// 抖音 showTabBar/hideTabBar 不传 animation 会告警，默认 false
function tabbarAnimationArgs(from: any, to: any) {
  if (from?.animation === undefined) {
    to.animation = false;
  }
}

/**
 * 快手(ks)协议表，搬运自 uni-mp-kuaishou/src/api/protocols.ts。
 */
const KUAISHOU: MpProtocolTable = {
  requestPayment: {
    // 新版叫 pay（需带固定 serviceId '1'），旧版仍是 requestPayment
    custom: (opts, call) => {
      const g: any = globalThis;
      if (g.ks?.pay) {
        return call('pay', { serviceId: '1', ...opts });
      }
      return call('requestPayment', opts);
    },
  },
};

/**
 * 小红书(xhs)协议表，搬运自 uni-mp-xhs/src/api/protocols.ts。
 */
const XIAOHONGSHU: MpProtocolTable = {
  // 小红书 itemColor 无默认值，不传会撞白底白字
  showActionSheet: {
    args: (from: any, to: any) => {
      if (!from?.itemColor) {
        to.itemColor = '#000000';
      }
    },
  },
  requestPayment: { name: 'requestGuaranteeOrderPayment' },
};

/**
 * 通用结果归一（支付宝系）：
 * - 成功结果补 `errMsg: '<name>:ok'`（支付宝原生结果没有该字段）
 * - `error` / `errorMessage` 字段转 `errMsg: '<name>:fail ...'`
 * 参考 uni-mp-alipay 的通用 returnValue。
 */
export function normalizeAlipayStyleResult(methodName: string, res: any) {
  if (res == null || typeof res !== 'object' || res instanceof Error) {
    return res;
  }
  if (res.error !== undefined || res.errorMessage !== undefined) {
    const { error, errorMessage, ...rest } = res;
    return { ...rest, errMsg: `${methodName}:fail ${errorMessage ?? error}` };
  }
  return { ...res, errMsg: `${methodName}:ok` };
}

/** 需要通用结果归一的平台 */
export const GENERIC_RESULT_NORMALIZERS: Partial<
  Record<MpPlatform, (name: string, res: any) => any>
> = {
  my: normalizeAlipayStyleResult,
  dd: normalizeAlipayStyleResult,
  swan: normalizeAlipayStyleResult,
};

/**
 * 默认协议表：只收录各家与微信口径的高频差异。
 * 需要扩展/覆盖时 provide MP_API_PROTOCOLS 替换或合并。
 */
export const DEFAULT_MP_PROTOCOLS: Record<MpPlatform, MpProtocolTable> = {
  wx: { ...CORE, ...WX },
  tt: { ...CORE, ...TOUTIAO },
  swan: { ...CORE, ...BAIDU },
  qq: { ...CORE },
  jd: { ...CORE },
  my: { ...CORE, ...ALIPAY },
  dd: { ...CORE, ...DINGTALK },
  ks: { ...CORE, ...KUAISHOU },
  xhs: { ...CORE, ...XIAOHONGSHU },
};

export const MP_API_PROTOCOLS = new InjectionToken<
  Record<MpPlatform, MpProtocolTable>
>('MP_API_PROTOCOLS', {
  providedIn: 'root',
  factory: () => DEFAULT_MP_PROTOCOLS,
});
