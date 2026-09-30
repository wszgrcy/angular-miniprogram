/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 统一 API 层的公共类型。
 *
 * 语义对齐 uni-app 的 uni.xxx：一套写法，跨家生效。
 * 平台标识使用**运行时全局对象名**（vite define 注入的 `miniProgramPlatform`），
 * 与构建期平台 key（zfb/zj/bdzn）的映射见 `platform.ts`。
 */

/** 运行时平台标识（= 各家全局对象名） */
export type MpPlatform =
  | 'wx' // 微信
  | 'my' // 支付宝
  | 'tt' // 字节/抖音
  | 'swan' // 百度
  | 'qq' // QQ
  | 'dd' // 钉钉
  | 'jd'; // 京东

/**
 * 已知统一 API 名。
 *
 * 配合 `MpApiName | (string & {})` 使用：这是 TS 的「补全但不设限」技巧——
 * 字面量联合提供输入 `'` 时的候选列表，`string & {}` 保留对任意字符串的
 * 兼容性（写未知名字不报错，运行时由平台层报「不支持」）。
 */
export type MpApiName =
  // 导航
  | 'navigateTo'
  | 'redirectTo'
  | 'switchTab'
  | 'reLaunch'
  | 'navigateBack'
  // 交互
  | 'showToast'
  | 'hideToast'
  | 'showLoading'
  | 'hideLoading'
  | 'showModal'
  | 'showActionSheet'
  // 存储
  | 'setStorage'
  | 'getStorage'
  | 'removeStorage'
  | 'clearStorage'
  | 'setStorageSync'
  | 'getStorageSync'
  | 'removeStorageSync'
  | 'clearStorageSync'
  // 网络（task 类）
  | 'request'
  | 'uploadFile'
  | 'downloadFile'
  | 'connectSocket'
  // 系统
  | 'upx2px'
  | 'rpx2px'
  | 'canIUse'
  | 'hideKeyboard'
  | 'showKeyboard'
  | 'getSelectedTextRange'
  | 'getMenuButtonBoundingClientRect'
  | 'getDeviceInfo'
  | 'getAppBaseInfo'
  | 'getWindowInfo'
  | 'getSystemInfo'
  | 'getSystemInfoSync'
  // 剪贴板 / 电话 / 扫码 / 预览
  | 'setClipboardData'
  | 'getClipboardData'
  | 'makePhoneCall'
  | 'scanCode'
  | 'previewImage'
  | 'closePreviewImage'
  // 导航栏
  | 'setNavigationBarTitle'
  | 'setNavigationBarColor'
  | 'showNavigationBarLoading'
  | 'hideNavigationBarLoading'
  // TabBar
  | 'showTabBar'
  | 'hideTabBar'
  | 'setTabBarBadge'
  | 'removeTabBarBadge'
  | 'showTabBarRedDot'
  | 'hideTabBarRedDot'
  | 'setTabBarItem'
  | 'setTabBarStyle'
  // 页面
  | 'pageScrollTo'
  | 'startPullDownRefresh'
  | 'stopPullDownRefresh'
  | 'loadFontFace'
  | 'createAnimation'
  // 媒体
  | 'chooseImage'
  | 'chooseVideo'
  | 'chooseFile'
  | 'compressImage'
  | 'compressVideo'
  | 'getImageInfo'
  | 'getVideoInfo'
  | 'saveImageToPhotosAlbum'
  | 'saveVideoToPhotosAlbum'
  | 'getRecorderManager'
  // 文件
  | 'saveFile'
  | 'getFileInfo'
  | 'getSavedFileInfo'
  | 'getSavedFileList'
  | 'removeSavedFile'
  | 'openDocument'
  // 位置
  | 'getLocation'
  | 'chooseLocation'
  | 'openLocation'
  | 'startLocationUpdate'
  | 'stopLocationUpdate'
  | 'onLocationChange'
  | 'offLocationChange'
  | 'onLocationChangeError'
  | 'offLocationChangeError'
  // 设备
  | 'vibrateShort'
  | 'vibrateLong'
  | 'setKeepScreenOn'
  | 'getScreenBrightness'
  | 'setScreenBrightness'
  | 'addPhoneContact'
  | 'getAppAuthorizeSetting'
  | 'openAppAuthorizeSetting'
  | 'getSystemSetting'
  // 传感器
  | 'startAccelerometer'
  | 'stopAccelerometer'
  | 'onAccelerometer'
  | 'offAccelerometer'
  | 'startCompass'
  | 'stopCompass'
  | 'onCompass'
  | 'offCompass'
  | 'startSoterAuthentication'
  | 'onWindowResize'
  | 'offWindowResize'
  // Socket
  | 'sendSocketMessage'
  | 'closeSocket'
  // 登录 / 支付 / 分享 / 插件
  | 'login'
  | 'getUserInfo'
  | 'getUserProfile'
  | 'requestPayment'
  | 'share'
  | 'shareWithSystem'
  | 'getProvider'
  | 'loadSubPackage'
  // Canvas / Context
  | 'createCanvasContext'
  | 'canvasToTempFilePath'
  | 'canvasGetImageData'
  | 'canvasPutImageData'
  | 'createVideoContext'
  | 'createAudioContext'
  | 'createInnerAudioContext'
  | 'createMapContext'
  | 'createLivePusherContext'
  | 'getBackgroundAudioManager'
  // 蓝牙 / iBeacon
  | 'openBluetoothAdapter'
  | 'startBluetoothDevicesDiscovery'
  | 'stopBluetoothDevicesDiscovery'
  | 'getBluetoothDevices'
  | 'onBluetoothDeviceFound'
  | 'offBluetoothDeviceFound'
  | 'createBLEConnection'
  | 'closeBLEConnection'
  | 'onBLEConnectionStateChange'
  | 'offBLEConnectionStateChange'
  | 'getBLEDeviceServices'
  | 'getBLEDeviceCharacteristics'
  | 'readBLECharacteristicValue'
  | 'writeBLECharacteristicValue'
  | 'notifyBLECharacteristicValueChange'
  | 'onBLECharacteristicValueChange'
  | 'offBLECharacteristicValueChange'
  | 'startBeaconDiscovery'
  | 'stopBeaconDiscovery'
  | 'getBeacons'
  | 'onBeaconUpdate'
  | 'offBeaconUpdate'
  | 'onBeaconServiceChange'
  | 'offBeaconServiceChange'
  // base64
  | 'arrayBufferToBase64'
  | 'base64ToArrayBuffer';
/** 补全候选 + 任意字符串兼容 */
export type MpApiNameInput = MpApiName | (string & {});

/** 所有异步 API 通用回调面 */
export interface MpCallbackOptions {
  success?: (res: any) => void;
  fail?: (err: any) => void;
  complete?: (res: any) => void;
  [key: string]: any;
}

export interface MpNavigateOptions extends MpCallbackOptions {
  url: string;
}

export interface MpNavigateBackOptions extends MpCallbackOptions {
  delta?: number;
}

export interface MpToastOptions extends MpCallbackOptions {
  title: string;
  icon?: 'success' | 'error' | 'loading' | 'none';
  duration?: number;
  mask?: boolean;
}

export interface MpLoadingOptions extends MpCallbackOptions {
  title?: string;
  mask?: boolean;
}

export interface MpModalOptions extends MpCallbackOptions {
  title?: string;
  content?: string;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export interface MpModalResult {
  confirm: boolean;
  cancel: boolean;
  errMsg?: string;
}

export interface MpActionSheetOptions extends MpCallbackOptions {
  itemList: (string | { name: string })[];
  itemColor?: string;
  popoverStyle?: string;
}

export interface MpActionSheetResult {
  tapIndex: number;
  errMsg?: string;
}
