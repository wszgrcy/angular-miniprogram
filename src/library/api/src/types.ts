/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 统一 API 层的公共类型。一套写法，跨家生效。平台标识使用运行时全局对象名
 * （vite define 注入的 `miniProgramPlatform`），与构建期平台 key（zfb/zj/bdzn）的映射见 `platform.ts`。
 */

/** 运行时平台标识（= 各家全局对象名） */
export type MpPlatform =
  | 'wx' // 微信
  | 'my' // 支付宝
  | 'tt' // 字节/抖音（飞书共用同一命名空间）
  | 'swan' // 百度
  | 'qq' // QQ
  | 'dd' // 钉钉
  | 'jd' // 京东
  | 'ks' // 快手
  | 'xhs'; // 小红书

/**
 * 已知统一 API 名。配合 `MpApiName | (string & {})` 使用：这是 TS 的「补全但不设限」技巧——
 * 字面量联合提供候选列表，`string & {}` 保留对任意字符串的兼容性（写未知名字不报错，
 * 运行时由平台层报「不支持」）。
 */
export type MpApiName =
  // 导航
  | 'navigateTo'
  | 'redirectTo'
  | 'switchTab'
  | 'reLaunch'
  | 'navigateBack'
  | 'preloadPage'
  | 'unPreloadPage'
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
  | 'onAccelerometerChange'
  | 'offAccelerometerChange'
  | 'startCompass'
  | 'stopCompass'
  | 'onCompassChange'
  | 'offCompassChange'
  | 'startGyroscope'
  | 'stopGyroscope'
  | 'onGyroscopeChange'
  | 'offGyroscopeChange'
  | 'startSoterAuthentication'
  | 'checkIsSupportSoterAuthentication'
  | 'checkIsSoterEnrolledInDevice'
  | 'onWindowResize'
  | 'offWindowResize'
  // 授权 / 会话
  | 'authorize'
  | 'getSetting'
  | 'openSetting'
  | 'checkSession'
  // 启动参数
  | 'getLaunchOptionsSync'
  | 'getEnterOptionsSync'
  // 键盘事件
  | 'onKeyboardHeightChange'
  | 'offKeyboardHeightChange'
  // 节点查询 / 观察器
  | 'createSelectorQuery'
  | 'createIntersectionObserver'
  | 'createMediaQueryObserver'
  // 系统管理类（透传 typed 名）
  | 'getUpdateManager'
  | 'getLogManager'
  | 'getRealtimeLogManager'
  | 'getFileSystemManager'
  // 订阅消息 / 跨程序跳转
  | 'requestSubscribeMessage'
  | 'navigateToMiniProgram'
  // 上下文 / Socket
  | 'createCameraContext'
  | 'createLivePlayerContext'
  | 'createTCPSocket'
  | 'createUDPSocket'
  // 屏幕 / 录音 / 宿主主题事件
  | 'onUserCaptureScreen'
  | 'offUserCaptureScreen'
  | 'onScreenRecordingStateChanged'
  | 'offScreenRecordingStateChanged'
  | 'onThemeChange'
  | 'offThemeChange'
  // WiFi / 地址 / 视频
  | 'getConnectedWifi'
  | 'connectWifi'
  | 'startWifi'
  | 'onWifiConnected'
  | 'offWifiConnected'
  | 'chooseAddress'
  | 'operateVideoPlayer'
  // 调试 / 分包懒加载
  | 'setEnableDebug'
  | 'onLazyLoadError'
  | 'offLazyLoadError'
  // 广告（原生透传）
  | 'createRewardedVideoAd'
  | 'createInterstitialAd'
  | 'createBannerAd'
  | 'createCustomAd'
  | 'createGridImageAd'
  | 'createFullScreenVideoAd'
  | 'createDramaAd'
  // 富文本 / 视觉 / 下拉背景 / 宿主分享
  | 'createEditorContext'
  | 'createVKSession'
  | 'setBackgroundColor'
  | 'setBackgroundTextStyle'
  | 'shareVideoMessage'
  // Socket
  | 'sendSocketMessage'
  | 'closeSocket'
  // Socket 全局事件
  | 'onSocketOpen'
  | 'offSocketOpen'
  | 'onSocketClose'
  | 'offSocketClose'
  | 'onSocketMessage'
  | 'offSocketMessage'
  | 'onSocketError'
  | 'offSocketError'
  // 网络状态 / 电量
  | 'getNetworkType'
  | 'onNetworkStatusChange'
  | 'offNetworkStatusChange'
  | 'getBatteryInfo'
  | 'getBatteryInfoSync'
  // 登录 / 支付 / 插件
  | 'login'
  | 'getUserInfo'
  | 'getUserProfile'
  | 'requestPayment'
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
  | 'getBLEDeviceRSSI'
  | 'setBLEMTU'
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
