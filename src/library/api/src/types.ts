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
  | 'getMenuButtonBoundingClientRect'
  | 'getDeviceInfo'
  | 'getAppBaseInfo'
  | 'getWindowInfo'
  | 'getSystemInfo'
  | 'getSystemInfoSync';
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
