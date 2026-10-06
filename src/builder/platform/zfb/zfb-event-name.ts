/**
 * 支付宝事件名映射（微信事件名 → 支付宝事件名）。
 *
 * 支付宝的事件属性是 `on` + 驼峰名，而这个驼峰名推不出来：`touchstart` → `touchStart` 只是断词，
 * `longpress` → `longTap`、`waiting` → `loading`、`animationfinish` → `animationEnd` 词根或语义都不同。
 * 所以只能整表列出。作者一律写微信形态，这里在编译期翻译，与 `wxsDialect` 是同一套思路：
 * 平台差异吃在编译期，不让开发者按平台写两套模板。
 *
 * 运行期有另一半：`src/library/platform/zfb/event-name.ts` 里有一份同表，用来把 `e.type` 反查回微信名。
 * 两份表由 `zfb-event-name.spec.ts` 逐条比对，防止漂移。
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

/**
 * 微信事件名 → 支付宝事件名。表里没有的原样返回。
 * 表键是去掉绑定前缀后的事件名（`touchstart`，不是 `capture-bind:touchstart`），前缀由调用方拆走。
 */
export function alipayEventName(name: string): string {
  return ALIPAY_EVENT_NAMES[name] ?? name;
}
