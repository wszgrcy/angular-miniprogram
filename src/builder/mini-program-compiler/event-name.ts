/**
 * Angular 事件名 → 小程序事件名。
 *
 * Angular 模板里 `(tap.stop)="f()"` 编译期不报错——事件名就是一串字符，
 * 编译器不认得也不管。但 DOM 上没有 `tap.stop` 这个事件，默认等于什么都没绑。
 * 小程序的 `bind / catch / capture-bind / capture-catch` 正好能用
 * 「事件名 + 修饰符」表达，于是这里把修饰符翻译成绑定前缀，
 * 等价于 uni-app 的 `@tap.stop` → `catch:tap`。
 *
 * | 模板写法 | wxml |
 * | --- | --- |
 * | `(tap)="f"` | `bind:tap="f"` |
 * | `(tap.stop)="f"` / `(tap.prevent)="f"` | `catch:tap="f"` |
 * | `(tap.capture)="f"` | `capture-bind:tap="f"` |
 * | `(tap.stop.capture)="f"` | `capture-catch:tap="f"` |
 * | `(click)="f"`（非自定义组件） | `bind:tap="f"` |
 *
 * **两端必须同步**：wxml 属性名由这里定，逻辑层监听键由
 * `src/library/platform/default/event-name.ts` 的 `mpListenerKeys` 定。
 * 事件真正派发时查的是后者，两边算出来的键对不上就是
 * 「产物看着对、点下去没反应」。两边的用例表在各自的 spec 里逐条对齐。
 *
 * 注：`(catch:tap)` 这种冒号写法走不通——Angular 会把 `catch` 当全局事件目标，
 * 直接报 `Unexpected global target 'catch'`，轮不到我们改写。
 */

/** wx 系事件绑定前缀。长名在前，`capture-bind` 不能被 `bind` 抢走 */
export const MP_EVENT_PREFIXES = [
  'capture-bind',
  'capture-catch',
  'mut-bind',
  'bind',
  'catch',
] as const;
export type MpEventPrefix = (typeof MP_EVENT_PREFIXES)[number];

/**
 * 可识别的模板修饰符。
 *
 * 与 uni-app 的 `genOn` 一致：`stop` / `prevent` 都落 `catch`
 * （小程序的 catch 本身就同时意味着「不再向上冒泡」，两者无需区分），
 * `capture` 决定绑定期走捕获阶段。
 *
 * `once` 不参与前缀（小程序没有「只响应一次」的绑定属性），它只意味着
 * 「从事件名上剔掉」；只响一次的语义在运行期实现，见
 * `src/library/platform/default/event-name.ts`。
 */
const MODIFIERS = new Set(['stop', 'prevent', 'capture', 'once']);

export interface MpEvent {
  /** 去掉修饰符后的事件名，如 `tap` */
  type: string;
  /** 绑定前缀 */
  prefix: MpEventPrefix;
  /** wxml 侧事件名：`bind` 保持原样（`tap`），其余带前缀（`catch:tap`） */
  name: string;
  /** 逻辑层监听键，必须与运行时 `mpListenerKeys` 的产物同形 */
  listener: string;
  /** 写了 `.once` */
  once: boolean;
}

/**
 * 从尾部剥已知修饰符。
 *
 * 只认表里的修饰符、只从尾部往前剥：`keyup.enter` 的 `enter` 是 Angular 的
 * 按键修饰符（运行期由 KeyEventsPlugin 处理），不能被当成小程序修饰符吃掉。
 */
function splitModifiers(raw: string): {
  type: string;
  modifiers: string[];
} {
  const parts = raw.split('.');
  const modifiers: string[] = [];
  while (parts.length > 1 && MODIFIERS.has(parts[parts.length - 1])) {
    modifiers.push(parts.pop() as string);
  }
  return { type: parts.join('.'), modifiers };
}

function eventPrefix(modifiers: string[]): MpEventPrefix {
  const capture = modifiers.includes('capture');
  const stop = modifiers.includes('stop') || modifiers.includes('prevent');
  if (capture) {
    return stop ? 'capture-catch' : 'capture-bind';
  }
  return stop ? 'catch' : 'bind';
}

/**
 * 逻辑层监听键。
 *
 * `bind` 用裸事件名，其余带前缀 —— 与运行时
 * `getListenerEventMapping(prefix, name)` 的 `prefix + name` 同形，
 * 所以各平台（含支付宝那套 `onTap` / `catchTap`）都能顺着自己的
 * 候选列表查到，不需要为修饰符再加平台分支。
 */
export function mpListenerKey(type: string, prefix: MpEventPrefix): string {
  return prefix === 'bind' ? type : `${prefix}${type}`;
}

/**
 * DOM 事件名 → 小程序事件名。
 *
 * 小程序里没有 `click`，只有 `tap`。表里这些名字只在「宿主是普通元素」
 * 时成立，所以整张表由 `isOwnEvent` 统一豁免 —— 新增别名只需加表项，
 * 不用跟着改判断。
 *
 * 只装 DOM↔小程序的别名；平台之间的差异（支付宝 `longpress` → `longTap`）
 * 属于另一回事，见 `platform/zfb/zfb-event-name.ts`。
 */
export const DOM_EVENT_ALIASES: Record<string, string> = {
  click: 'tap',
};

export function parseMpEvent(
  raw: string,
  /**
   * `isOwnEvent`：这个事件名属于宿主自己 —— 宿主是自定义组件，或宿主上的
   * 指令声明了同名 `@Output`。这种名字不能按原生事件改写。
   */
  options: { isOwnEvent?: boolean } = {},
): MpEvent {
  const { type: bare, modifiers } = splitModifiers(raw);
  const prefix = eventPrefix(modifiers);
  // 小程序没有 click，只有 tap；宿主自己的同名 @Output 整张表都不能过
  const alias = options.isOwnEvent ? undefined : DOM_EVENT_ALIASES[bare];
  const type = alias ?? bare;
  return {
    type,
    prefix,
    name: prefix === 'bind' ? type : `${prefix}:${type}`,
    listener: mpListenerKey(type, prefix),
    once: modifiers.includes('once'),
  };
}
