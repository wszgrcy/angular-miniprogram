import { MpApiResultMap } from './domain-types';
import { MpApiName, MpApiNameInput } from './types';

/**
 * Promise 化规则，参考 uni-app（uni-mp-core/src/api/promise.ts）：
 *
 * - task 类 API 返回 task，不 Promise 化
 * - 同步 API（`*Sync`）、上下文对象（`create*` / `*Manager`）、
 *   事件注册（`on*` / `off*`）不 Promise 化
 * - 其余 API 返回 Promise
 *
 * 运行时用正则判定，类型层用 `MpApiReturn` 镜像同一套规则，
 * 两者需保持一致。
 */

export type MpTaskApiName =
  | 'request'
  | 'downloadFile'
  | 'uploadFile'
  | 'connectSocket';

/**
 * 从 `MpApiName` 里抽出同步类名字。
 * 用 `Extract` 而非裸模板模式，避免任意字符串被误判。
 */
export type MpSyncApiName = Extract<
  MpApiName,
  | `${string}Sync`
  | `create${string}`
  | `${string}Manager`
  | `on${string}`
  | `off${string}`
  | 'upx2px'
  | 'rpx2px'
  | 'canIUse'
  | 'hideKeyboard'
  | 'getMenuButtonBoundingClientRect'
  | 'getDeviceInfo'
  | 'getAppBaseInfo'
  | 'getWindowInfo'
  | 'getSystemSetting'
  | 'getAppAuthorizeSetting'
  | 'base64ToArrayBuffer'
  | 'arrayBufferToBase64'
>;

/** 名字匹配同步模式、但实际是异步的例外 */
export type MpAsyncOverride = 'createBLEConnection';

/** task 类返回的句柄 */
export interface MpTask {
  abort(): void;
  [key: string]: unknown;
}

/** 按名字查结果类型，未收录的保持宽松 */
export type MpResultOf<N extends MpApiNameInput> = N extends keyof MpApiResultMap
  ? MpApiResultMap[N]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  : any;

/**
 * `invoke(name)` 的返回类型：按名字把 task / 同步 / Promise 三分，
 * 结果类型查 `MpApiResultMap`。
 */
export type MpApiReturn<
  N extends MpApiNameInput,
  T = MpResultOf<N>,
> = N extends MpTaskApiName
  ? MpTask
  : N extends MpAsyncOverride
    ? Promise<T>
    : N extends MpSyncApiName
      ? T
      : Promise<T>;

/** `invoke$(name)` 的流元素类型 */
export type MpStreamOf<N extends MpApiNameInput> = N extends MpTaskApiName
  ? MpTask
  : MpResultOf<N>;

const TASK_APIS = new Set<MpTaskApiName>([
  'request',
  'downloadFile',
  'uploadFile',
  'connectSocket',
]);

const NON_PROMISE_RE =
  /^\$|Sync$|^create|Manager$|^on[A-Z]|^off[A-Z]|upx2px|rpx2px|canIUse|hideKeyboard|getMenuButtonBoundingClientRect|getDeviceInfo|getAppBaseInfo|getWindowInfo|getSystemSetting|getAppAuthorizeSetting|base64ToArrayBuffer|arrayBufferToBase64/;

const ASYNC_OVERRIDES = new Set<MpAsyncOverride>(['createBLEConnection']);

export function isTaskApi(name: string) {
  return TASK_APIS.has(name as MpTaskApiName);
}

export function shouldPromise(name: string) {
  if (ASYNC_OVERRIDES.has(name as MpAsyncOverride)) {
    return true;
  }
  return !isTaskApi(name) && !NON_PROMISE_RE.test(name);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasCallbackHandlers(options: Record<string, any>) {
  return (
    typeof options.success === 'function' ||
    typeof options.fail === 'function' ||
    typeof options.complete === 'function'
  );
}
