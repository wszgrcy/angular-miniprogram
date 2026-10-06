/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 各业务域的参数 / 结果类型。只声明跨家共用的字段；各家私有差异由协议表处理，不在此体现。
 * 所有 Options 均继承 `MpCallbackOptions`，保留逃生舱（可直接传 success/fail），但推荐一律走 Promise / Observable 面。
 */

import {
  MpActionSheetOptions,
  MpActionSheetResult,
  MpApiNameInput,
  MpCallbackOptions,
  MpLoadingOptions,
  MpModalOptions,
  MpModalResult,
  MpNavigateBackOptions,
  MpNavigateOptions,
  MpToastOptions,
} from './types';

// ---------------------------------------------------------------- 导航栏

export interface MpNavigationBarColorResult {
  frontColor: string;
  backgroundColor: string;
  errMsg?: string;
}

// ---------------------------------------------------------------- TabBar

export interface MpTabBarBadgeOptions extends MpCallbackOptions {
  index: number;
  text: string;
}

export interface MpTabBarIndexOptions extends MpCallbackOptions {
  index: number;
}

export interface MpTabBarItemOptions extends MpCallbackOptions {
  index: number;
  text?: string;
  iconPath?: string;
  selectedIconPath?: string;
  pagePath?: string;
}

export interface MpTabBarStyleOptions extends MpCallbackOptions {
  color?: string;
  selectedColor?: string;
  backgroundColor?: string;
  borderStyle?: 'black' | 'white';
}

// ---------------------------------------------------------------- 页面

export interface MpPageScrollToOptions extends MpCallbackOptions {
  scrollTop?: number;
  selector?: string;
  duration?: number;
}

// ---------------------------------------------------------------- 字体 / 动画

export interface MpLoadFontFaceOptions extends MpCallbackOptions {
  family: string;
  source: string;
  desc?: Record<string, string>;
  global?: boolean;
}

export interface MpAnimationConfig {
  duration?: number;
  timingFunction?:
    | 'default'
    | 'linear'
    | 'ease'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out';
  delay?: number;
  transformOrigin?: string;
}

/**
 * createAnimation 返回的链式动画对象：`step()` 累积关键帧，`export()` 导出给组件。各家附加字段不一，故保留索引签名。
 */
export interface MpAnimation {
  step(config?: MpAnimationConfig): MpAnimation;
  export(): { animation: unknown; actions: unknown[] };
  [key: string]: any;
}

// ---------------------------------------------------------------- 媒体

export interface MpChooseImageOptions extends MpCallbackOptions {
  count?: number;
  sizeType?: ('original' | 'compressed')[];
  sourceType?: ('album' | 'camera')[];
  camera?: 'back' | 'front';
}

export interface MpChooseVideoOptions extends MpCallbackOptions {
  maxDuration?: number;
  camera?: 'back' | 'front';
  compressed?: boolean;
  sourceType?: ('album' | 'camera')[];
}

export interface MpChooseFileOptions extends MpCallbackOptions {
  count?: number;
  type?: 'all' | 'video' | 'image';
  extension?: string[];
}

export interface MpCompressImageOptions extends MpCallbackOptions {
  src: string;
  quality?: number;
  compressedWidth?: number;
  compressedHeight?: number;
}

export interface MpCompressVideoOptions extends MpCallbackOptions {
  src: string;
  quality?: 'high' | 'medium' | 'low';
  bitrate?: number;
  fps?: number;
  resolution?: number;
}

export interface MpImageInfo {
  width: number;
  height: number;
  orientation?: string;
  type?: string;
  errMsg?: string;
}

export interface MpVideoInfo {
  width: number;
  height: number;
  duration?: number;
  bitrate?: number;
  rotation?: number;
  errMsg?: string;
}

// ---------------------------------------------------------------- 文件

export interface MpFileInfo {
  size: number;
  digest?: string;
  errMsg?: string;
}

export interface MpSavedFileInfo {
  size: number;
  createTime: number;
  /** wx getSavedFileList 实际给的是 filePath */
  filePath?: string;
  savedFilePath?: string;
  errMsg?: string;
}

export interface MpSavedFileListResult {
  fileList: MpSavedFileInfo[];
  errMsg?: string;
}

export interface MpOpenDocumentOptions extends MpCallbackOptions {
  filePath: string;
  fileType?: string;
  showMenu?: number | boolean;
}

// ---------------------------------------------------------------- 位置

export interface MpLocation {
  latitude: number;
  longitude: number;
  speed?: number;
  accuracy?: number;
  altitude?: number;
  verticalAccuracy?: number;
  horizontalAccuracy?: number;
  errMsg?: string;
}

export interface MpGetLocationOptions extends MpCallbackOptions {
  type?: 'wgs84' | 'gcj02';
  altitude?: boolean;
  isHighAccuracy?: boolean;
  highAccuracyExpireTime?: number;
}

export interface MpChooseLocationOptions extends MpCallbackOptions {
  latitude?: number;
  longitude?: number;
  name?: string;
  address?: string;
}

export interface MpChosenLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  errMsg?: string;
}

export interface MpOpenLocationOptions extends MpCallbackOptions {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
  scale?: number;
}

// ---------------------------------------------------------------- 设备

export interface MpAddPhoneContactOptions extends MpCallbackOptions {
  lastName: string;
  firstName?: string;
  phoneNumber?: string;
  email?: string;
  [key: string]: any;
}

export interface MpAuthorizeSetting {
  albumAuthorized?: string;
  cameraAuthorized?: string;
  locationAuthorized?: string;
  locationReducedAccuracy?: boolean;
  microphoneAuthorized?: string;
  notificationAuthorized?: string;
  [key: string]: any;
}

export interface MpSystemSetting {
  bluetoothEnabled?: boolean;
  locationEnabled?: boolean;
  wifiEnabled?: boolean;
  cameraAuthorized?: boolean;
  locationAuthorized?: boolean;
  wifiAuthorized?: boolean;
  [key: string]: any;
}

// ---------------------------------------------------------------- 传感器

export type MpAccelerometerInterval = 'game' | 'ui' | 'normal';

export interface MpAccelerometerReading {
  x: number;
  y: number;
  z: number;
  errMsg?: string;
}

export interface MpCompassReading {
  direction: number;
  accuracy?: number;
  errMsg?: string;
}

export interface MpSoterAuthenticationResult {
  authResult: Record<string, any>;
  rawResult: string;
  errCode?: number;
  errMsg?: string;
}

// ---------------------------------------------------------------- Socket

export interface MpSocketMessage {
  data: string | ArrayBuffer;
  isBuffer?: boolean;
  errMsg?: string;
}

export interface MpConnectSocketOptions extends MpCallbackOptions {
  url: string;
  header?: Record<string, string>;
  protocols?: string[];
  method?: string;
}

// ---------------------------------------------------------------- 登录 / 支付 / 分享

export interface MpLoginOptions extends MpCallbackOptions {
  provider?: string;
  onlyAuthorize?: boolean;
  scopes?: string | string[];
}

export interface MpLoginResult {
  code?: string;
  authResult?: any;
  authProvider?: string;
  errMsg?: string;
}

export interface MpPaymentOptions extends MpCallbackOptions {
  provider?: string;
  orderInfo?: any;
  [key: string]: any;
}

export interface MpPaymentResult {
  returnCode?: string;
  returnMsg?: string;
  errMsg?: string;
}

export interface MpShareOptions extends MpCallbackOptions {
  provider?: string;
  scene?: string;
  title?: string;
  summary?: string;
  href?: string;
  imageUrl?: string;
  mediaUrl?: string;
  [key: string]: any;
}

// ---------------------------------------------------------------- Canvas / Context

export interface MpCanvasToTempFilePathOptions extends MpCallbackOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  destWidth?: number;
  destHeight?: number;
  fileType?: 'jpg' | 'png';
  quality?: number;
  canvasId?: string;
  canvas?: any;
}

export interface MpCanvasImageData extends MpCallbackOptions {
  width: number;
  height: number;
  data: Uint8ClampedArray | number[];
}

// ---------------------------------------------------------------- 蓝牙 / iBeacon

export interface MpBluetoothDevice {
  name?: string;
  deviceId: string;
  RSSI?: number;
  [key: string]: any;
}

export interface MpBLEService {
  uuid: string;
  isPrimary?: boolean;
}

export interface MpBLECharacteristic {
  uuid: string;
  properties?: {
    read?: boolean;
    write?: boolean;
    notify?: boolean;
    indicate?: boolean;
  };
}

export interface MpBLECharacteristicResult {
  deviceId: string;
  serviceId: string;
  characteristicId: string;
  value?: ArrayBuffer;
  errMsg?: string;
}

export interface MpScanCodeOptions extends MpCallbackOptions {
  onlyFromCamera?: boolean;
  scanType?: ('barCode' | 'qrCode' | 'datamatrix' | 'pdf417')[];
  compress?: number;
  autoDecodeCharSet?: boolean;
}

export interface MpScanCodeResult {
  result: string;
  scanType?: string;
  charSet?: string;
  path?: string;
  rawData?: ArrayBuffer;
  errMsg?: string;
}

export interface MpPreviewImageOptions extends MpCallbackOptions {
  urls: string[];
  current?: string | number;
  enablesavephoto?: boolean;
  enableShowPhotoDownload?: boolean;
}

export interface MpSelectedTextRange {
  start: number;
  end: number;
  errMsg?: string;
}

export interface MpScreenBrightnessResult {
  value: number;
  errMsg?: string;
}

export interface MpRecorderManagerOptions {
  duration?: number;
  sampleRate?: number;
  numberOfChannels?: number;
  encodeBitRate?: number;
  format?: 'mp3' | 'aac' | 'wav' | 'pcm';
  audioSource?:
    | 'auto'
    | 'mic'
    | 'voice_recognition'
    | 'camcorder'
    | 'voice_communication';
}

export interface MpBeacon {
  uuid: string;
  major?: string;
  minor?: string;
  proximity?: number;
  accuracy?: number;
  rssi?: number;
  power?: number;
}

export interface MpSetClipboardDataOptions extends MpCallbackOptions {
  data: string;
  showToast?: boolean;
}

export interface MpClipboardData {
  data: string;
  errMsg?: string;
}

export interface MpMakePhoneCallOptions extends MpCallbackOptions {
  phoneNumber: string;
}

export interface MpSetNavigationBarTitleOptions extends MpCallbackOptions {
  title: string;
}

export interface MpSetNavigationBarColorOptions extends MpCallbackOptions {
  frontColor: string;
  backgroundColor: string;
  animation?: { duration?: number; timingFunc?: string };
}

/** 仅带 filePath 的入参（saveImageToPhotosAlbum / removeSavedFile 等） */
export interface MpFilePathOptions extends MpCallbackOptions {
  filePath: string;
}

export interface MpGetImageInfoOptions extends MpCallbackOptions {
  src: string;
}

export interface MpGetVideoInfoOptions extends MpCallbackOptions {
  src: string;
}

export interface MpSetKeepScreenOnOptions extends MpCallbackOptions {
  keepScreenOn: boolean;
}

export interface MpSetScreenBrightnessOptions extends MpCallbackOptions {
  value: number;
}

export interface MpSendSocketMessageOptions extends MpCallbackOptions {
  data: string | ArrayBuffer;
}

export interface MpCloseSocketOptions extends MpCallbackOptions {
  code?: number;
  reason?: string;
}

export interface MpLoadSubPackageOptions extends MpCallbackOptions {
  name: string;
}

export interface MpStorageOptions extends MpCallbackOptions {
  key: string;
  data?: unknown;
}

export interface MpStorageResult<T = unknown> {
  data: T;
  errMsg?: string;
}

/** 仅带 deviceId 的蓝牙入参 */
export interface MpBLEDeviceIdOptions extends MpCallbackOptions {
  deviceId: string;
}

/** 蓝牙特征值定位入参 */
export interface MpBLECharacteristicTargetOptions extends MpCallbackOptions {
  deviceId: string;
  serviceId: string;
  characteristicId: string;
}

export interface MpNotifyBLEChangeOptions
  extends MpBLECharacteristicTargetOptions {
  state: boolean;
}

/** 单次写入包大小，BLE 默认 20 字节，传大包前需调大 */
export interface MpSetBLEMTUOptions extends MpBLEDeviceIdOptions {
  mtu: number;
}

export interface MpBleRssiResult {
  rssi: number;
  errMsg?: string;
}

export interface MpGetProviderOptions extends MpCallbackOptions {
  service: string;
}

export interface MpStartAccelerometerOptions extends MpCallbackOptions {
  interval?: MpAccelerometerInterval;
}

export interface MpStartBeaconDiscoveryOptions extends MpCallbackOptions {
  uuids: string[];
}

export interface MpBluetoothDevicesResult {
  devices: MpBluetoothDevice[];
  errMsg?: string;
}

export interface MpBLEServicesResult {
  services: MpBLEService[];
  errMsg?: string;
}

export interface MpBLECharacteristicsResult {
  characteristics: MpBLECharacteristic[];
  errMsg?: string;
}

export interface MpBeaconsResult {
  beacons: MpBeacon[];
  errMsg?: string;
}

export interface MpProvidersResult {
  providers: string[];
  errMsg?: string;
}

export interface MpSaveFileOptions extends MpCallbackOptions {
  tempFilePath: string;
  filePath?: string;
}

export interface MpGetFileInfoOptions extends MpCallbackOptions {
  filePath: string;
  digestAlgorithm?: 'md5' | 'sha1' | 'sha256';
}

export interface MpCanvasImageDataOptions extends MpCallbackOptions {
  canvasId?: string;
  canvas?: any;
  x: number;
  y: number;
  width: number;
  height: number;
  data?: Uint8ClampedArray | number[];
}

export interface MpShowKeyboardOptions extends MpCallbackOptions {
  focus?: boolean;
  id?: string;
}

export interface MpStartLocationUpdateOptions extends MpCallbackOptions {
  type?: 'gcj02' | 'wgs84';
}

export interface MpCreateInnerAudioContextOptions extends MpCallbackOptions {
  useWebAudioImplement?: boolean;
  obeyMuteSwitch?: boolean;
}

/**
 * API 名 -> success 结果类型。未列出的按 `any` 处理。有了这张表，`invoke` 及所有包装方法的
 * 返回类型都能自动推导，无需逐个声明。
 */
/** 安全区矩形（平台原始字段） */
export interface MpSafeArea {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

/** 安全区到屏幕四边的距离，由 safeArea 与窗口尺寸算出 */
export interface MpSafeAreaInsets {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

/** 设备类别；各家写法不一，保留字串但给出常见值补全 */
export type MpDeviceType = 'phone' | 'pad' | 'pc' | 'tv' | (string & {});

/** getDeviceInfo 口径 */
export interface MpDeviceInfo {
  deviceId: string;
  deviceType: MpDeviceType;
  deviceBrand: string;
  deviceModel: string;
  osName: string;
  osVersion: string;
  platform: string;
}

/** getAppBaseInfo 口径 */
export interface MpAppBaseInfo {
  hostName: string;
  hostVersion: string;
  /** 宿主语言，`zh_CN` -> `zh-CN` */
  hostLanguage: string;
  hostSDKVersion?: string;
  hostFontSizeSetting?: number;
  language?: string;
  appLanguage: string;
}

/** getWindowInfo 口径 */
export interface MpNetworkTypeResult {
  networkType: string;
  errMsg?: string;
}

export interface MpBatteryInfoResult {
  level: number;
  isCharging: boolean;
}

export interface MpWindowInfo {
  windowWidth: number;
  windowHeight: number;
  statusBarHeight: number;
  safeArea?: MpSafeArea;
  safeAreaInsets?: MpSafeAreaInsets;
  pixelRatio: number;
  windowTop: number;
  windowBottom: number;
}

/**
 * getSystemInfo / getSystemInfoSync 增强口径：原始结果整体透传 + 归一字段。各家原始字段差异大，故保留索引签名。
 */
export interface MpEnhancedSystemInfo
  extends MpDeviceInfo,
    MpAppBaseInfo,
    MpWindowInfo {
  system: string;
  hostTheme?: string;
  [key: string]: any;
}

/** 胶囊按钮布局矩形 */
export interface MpMenuButtonRect {
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// ---------------------------------------------------------------- 授权 / 会话

export interface MpAuthorizeOptions extends MpCallbackOptions {
  /** 权限 scope，如 `scope.userLocation` */
  scope: string;
}

/** getSetting 返回的授权配置：scope -> 是否授权（部分平台有 'deny'/'both' 中间态） */
export interface MpAuthSetting {
  [scope: string]: boolean | 'deny' | 'both' | undefined;
}

export interface MpSettingResult {
  authSetting: MpAuthSetting;
  [key: string]: any;
}

// ---------------------------------------------------------------- 启动参数

/** getLaunchOptionsSync / getEnterOptionsSync / onAppShow 结果 */
export interface MpLaunchOptions {
  path?: string;
  scene?: number | string;
  query?: Record<string, string>;
  referrerInfo?: { appId?: string; extraData?: Record<string, any> };
  shareTicket?: string;
  [key: string]: any;
}

// ---------------------------------------------------------------- 键盘事件

export interface MpKeyboardHeightChangeResult {
  height: number;
  duration?: number;
}

// ---------------------------------------------------------------- 生物认证补充

export interface MpSoterSupportResult {
  supportMode: string[];
  errMsg?: string;
}

export interface MpSoterEnrollOptions extends MpCallbackOptions {
  authChallenge: string;
  sceneDesc?: string;
}

export interface MpSoterEnrollResult {
  isEnrolled: boolean;
  errMsg?: string;
}

/**
 * 统一名 -> 参数形状。Proxy 兜底面的参数类型来源：
 * 等价 uni 用 @dcloudio/types 手写 uni.xxx 参数，但纯类型零运行时。
 * 未收录的名字退化为 MpCallbackOptions（宽进，运行时由协议层把关）。
 */
export interface MpApiParamMap {
  navigateTo: MpNavigateOptions;
  redirectTo: MpNavigateOptions;
  switchTab: MpNavigateOptions;
  reLaunch: MpNavigateOptions;
  navigateBack: MpNavigateBackOptions;
  preloadPage: MpNavigateOptions;
  unPreloadPage: MpNavigateOptions;
  showToast: MpToastOptions;
  showLoading: MpLoadingOptions;
  showModal: MpModalOptions;
  showActionSheet: MpActionSheetOptions;
  setStorage: MpStorageOptions;
  getStorage: { key: string };
  removeStorage: { key: string };
  setClipboardData: MpSetClipboardDataOptions;
  makePhoneCall: MpMakePhoneCallOptions;
  scanCode: MpScanCodeOptions;
  previewImage: MpPreviewImageOptions;
  setNavigationBarTitle: MpSetNavigationBarTitleOptions;
  setNavigationBarColor: MpSetNavigationBarColorOptions;
  setTabBarBadge: MpTabBarBadgeOptions;
  removeTabBarBadge: MpTabBarIndexOptions;
  showTabBarRedDot: MpTabBarIndexOptions;
  hideTabBarRedDot: MpTabBarIndexOptions;
  setTabBarItem: MpTabBarItemOptions;
  setTabBarStyle: MpTabBarStyleOptions;
  pageScrollTo: MpPageScrollToOptions;
  loadFontFace: MpLoadFontFaceOptions;
  createAnimation: MpAnimationConfig;
  showKeyboard: MpShowKeyboardOptions;
  authorize: MpAuthorizeOptions;
  chooseImage: MpChooseImageOptions;
  chooseVideo: MpChooseVideoOptions;
  chooseFile: MpChooseFileOptions;
  compressImage: MpCompressImageOptions;
  compressVideo: MpCompressVideoOptions;
  getImageInfo: MpGetImageInfoOptions;
  getVideoInfo: MpGetVideoInfoOptions;
  saveImageToPhotosAlbum: MpFilePathOptions;
  saveVideoToPhotosAlbum: MpFilePathOptions;
  saveFile: MpSaveFileOptions;
  getFileInfo: MpGetFileInfoOptions;
  getSavedFileInfo: MpFilePathOptions;
  removeSavedFile: MpFilePathOptions;
  openDocument: MpOpenDocumentOptions;
  getLocation: MpGetLocationOptions;
  chooseLocation: MpChooseLocationOptions;
  openLocation: MpOpenLocationOptions;
  startLocationUpdate: MpStartLocationUpdateOptions;
  setKeepScreenOn: MpSetKeepScreenOnOptions;
  setScreenBrightness: MpSetScreenBrightnessOptions;
  addPhoneContact: MpAddPhoneContactOptions;
  startAccelerometer: MpStartAccelerometerOptions;
  checkIsSoterEnrolledInDevice: MpSoterEnrollOptions;
  connectSocket: MpConnectSocketOptions;
  sendSocketMessage: MpSendSocketMessageOptions;
  closeSocket: MpCloseSocketOptions;
  login: MpLoginOptions;
  requestPayment: MpPaymentOptions;
  share: MpShareOptions;
  shareWithSystem: MpShareOptions;
  getProvider: MpGetProviderOptions;
  loadSubPackage: MpLoadSubPackageOptions;
  canvasToTempFilePath: MpCanvasToTempFilePathOptions;
  canvasGetImageData: MpCanvasImageDataOptions;
  canvasPutImageData: MpCanvasImageDataOptions;
  createInnerAudioContext: MpCreateInnerAudioContextOptions;
  createBLEConnection: MpBLEDeviceIdOptions;
  closeBLEConnection: MpBLEDeviceIdOptions;
  getBLEDeviceRSSI: MpBLEDeviceIdOptions;
  getBLEDeviceServices: MpBLEDeviceIdOptions;
  setBLEMTU: MpSetBLEMTUOptions;
  readBLECharacteristicValue: MpBLECharacteristicTargetOptions;
  writeBLECharacteristicValue: MpBLECharacteristicTargetOptions & {
    value: ArrayBuffer;
  };
  notifyBLECharacteristicValueChange: MpNotifyBLEChangeOptions;
  startBeaconDiscovery: MpStartBeaconDiscoveryOptions;
}

/** 按名字查参数类型，未收录的保持宽松 */
export type MpParamOf<N extends MpApiNameInput> = N extends keyof MpApiParamMap
  ? MpApiParamMap[N]
  : MpCallbackOptions;

export interface MpApiResultMap {
  // 交互
  showModal: MpModalResult;
  showActionSheet: MpActionSheetResult;

  // 存储
  getStorage: MpStorageResult;
  /** 存的是什么取回什么，编译期无从得知；要类型走 `getStorageSync<T>(key)` */
  getStorageSync: unknown;

  // 剪贴板 / 扫码
  getClipboardData: MpClipboardData;
  scanCode: MpScanCodeResult;

  // 键盘
  getSelectedTextRange: MpSelectedTextRange;

  // 媒体
  getImageInfo: MpImageInfo;
  getVideoInfo: MpVideoInfo;

  // 文件
  getFileInfo: MpFileInfo;
  getSavedFileInfo: MpSavedFileInfo;
  getSavedFileList: MpSavedFileListResult;

  // 位置
  getLocation: MpLocation;
  chooseLocation: MpChosenLocation;

  // 设备
  getScreenBrightness: MpScreenBrightnessResult;
  getAppAuthorizeSetting: MpAuthorizeSetting;
  getSystemSetting: MpSystemSetting;

  // 生物认证
  startSoterAuthentication: MpSoterAuthenticationResult;
  checkIsSupportSoterAuthentication: MpSoterSupportResult;
  checkIsSoterEnrolledInDevice: MpSoterEnrollResult;

  // 授权 / 会话
  getSetting: MpSettingResult;

  // 启动参数
  getLaunchOptionsSync: MpLaunchOptions;
  getEnterOptionsSync: MpLaunchOptions;

  // 登录 / 支付 / 插件
  login: MpLoginResult;
  requestPayment: MpPaymentResult;
  getProvider: MpProvidersResult;

  // Canvas
  canvasGetImageData: MpCanvasImageData;

  // 动画
  createAnimation: MpAnimation;

  // 蓝牙 / iBeacon
  getBluetoothDevices: MpBluetoothDevicesResult;
  getBLEDeviceServices: MpBLEServicesResult;
  getBLEDeviceCharacteristics: MpBLECharacteristicsResult;
  readBLECharacteristicValue: MpBLECharacteristicResult;
  getBLEDeviceRSSI: MpBleRssiResult;
  getBeacons: MpBeaconsResult;

  // 系统
  getSystemInfo: MpEnhancedSystemInfo;
  getSystemInfoSync: MpEnhancedSystemInfo;
  getDeviceInfo: MpDeviceInfo;
  getAppBaseInfo: MpAppBaseInfo;
  getWindowInfo: MpWindowInfo;
  getNetworkType: MpNetworkTypeResult;
  getBatteryInfo: MpBatteryInfoResult;
  getBatteryInfoSync: MpBatteryInfoResult;
  getMenuButtonBoundingClientRect: MpMenuButtonRect;
  canIUse: boolean;
  upx2px: number;
  rpx2px: number;
  arrayBufferToBase64: string;
  base64ToArrayBuffer: ArrayBuffer;
}
