/**
 * 支付宝事件名映射（运行期那一半）。
 *
 * 编译期把 `(touchstart)` 写成 `onTouchStart`，事件打过来时 `e.type` 是支付宝
 * 驼峰名（`touchStart`），而监听键是按模板原文登记的（`touchstart`）。
 * 所以派发时要先把 `e.type` 反查回微信名，否则就是「属性名对了、监听查不到」。
 *
 * 表内容与 `src/builder/platform/zfb/zfb-event-name.ts` 逐条相同 ——
 * builder 与 library 是两个包，互相 import 不了，只能各存一份；
 * 漂移由 `src/builder/platform/zfb/zfb-event-name.spec.ts` 逐条比对挡住。
 */
export const ALIPAY_EVENT_NAMES: Record<string, string> = {
  touchstart: 'touchStart',
  touchmove: 'touchMove',
  touchend: 'touchEnd',
  touchcancel: 'touchCancel',
  longtap: 'longTap',
  longpress: 'longTap',
  transitionend: 'transitionEnd',
  animationstart: 'animationStart',
  animationiteration: 'animationIteration',
  animationend: 'animationEnd',
  firstappear: 'firstAppear',
  markertap: 'markerTap',
  callouttap: 'calloutTap',
  controltap: 'controlTap',
  regionchange: 'regionChange',
  paneltap: 'panelTap',
  scrolltoupper: 'scrollToUpper',
  scrolltolower: 'scrollToLower',
  changeend: 'changeEnd',
  timeupdate: 'timeUpdate',
  waiting: 'loading',
  fullscreenchange: 'fullScreenChange',
  useraction: 'userAction',
  renderstart: 'renderStart',
  loadedmetadata: 'renderStart',
  animationfinish: 'animationEnd',
  chooseavatar: 'chooseAvatar',
  beforeenter: 'beforeEnter',
  afterenter: 'afterEnter',
  entercancelled: 'enterCancelled',
  beforeleave: 'beforeLeave',
  afterleave: 'afterLeave',
  leavecancelled: 'leaveCancelled',
  clickoverlay: 'clickOverlay',
};

/** 支付宝事件名 → 微信事件名。一个支付宝名可能对应多个微信名（`longTap` ← `longtap` / `longpress`） */
const WX_EVENT_NAMES: Record<string, string[]> = {};
Object.entries(ALIPAY_EVENT_NAMES).forEach(([wxName, alipayName]) => {
  (WX_EVENT_NAMES[alipayName] ??= []).push(wxName);
});

/**
 * `e.type` 反查回来的微信事件名。
 *
 * 查不到就是普通事件（`tap` / `input` 这些两边同名的），返回空数组，
 * 派发候选一个都不多铺。
 */
export function wxEventNamesOf(alipayName: string): string[] {
  return WX_EVENT_NAMES[alipayName] ?? [];
}
