/**
 * Promise 化规则，参考 uni-app（uni-mp-core/src/api/promise.ts）：
 *
 * - task 类 API（request/uploadFile/...）返回 task，不 Promise 化
 * - 同步 API（`*Sync`）、上下文对象（`create*` / `*Manager`）、
 *   事件注册（`on*` / `off*`）不 Promise 化
 * - 其余 API 未传回调时返回 Promise
 */

const TASK_APIS = new Set([
  'request',
  'downloadFile',
  'uploadFile',
  'connectSocket',
]);

/**
 * 参考 uni-mp-core 的 SYNC_API_RE，做了三类调整：
 * - 收紧：`^on|^off` → `^on[A-Z]|^off[A-Z]`，避免误伤普通词
 * - 删除：uni 私有项（__f__ / SubNVue 系 / requireNativePlugin 等）
 * - 保留：同步约定（Sync 后缀 / create* / *Manager）与单位转换类
 */
const NON_PROMISE_RE =
  /^\$|Sync$|^create|Manager$|^on[A-Z]|^off[A-Z]|upx2px|rpx2px|canIUse|hideKeyboard|getMenuButtonBoundingClientRect|getDeviceInfo|getAppBaseInfo|getWindowInfo|getSystemSetting|getAppAuthorizeSetting|base64ToArrayBuffer|arrayBufferToBase64/;

export function isTaskApi(name: string): boolean {
  return TASK_APIS.has(name);
}

export function shouldPromise(name: string): boolean {
  return !isTaskApi(name) && !NON_PROMISE_RE.test(name);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasCallbackHandlers(options: Record<string, any>): boolean {
  return (
    typeof options.success === 'function' ||
    typeof options.fail === 'function' ||
    typeof options.complete === 'function'
  );
}
