/**
 * Angular 事件名 → 小程序事件名。
 *
 * DOM 上没有 `tap.stop` 这个事件，默认等于什么都没绑。小程序的
 * `bind / catch / capture-bind / capture-catch` 能用「事件名 + 修饰符」表达，
 * 这里把修饰符翻译成绑定前缀。
 *
 * | 模板写法 | wxml |
 * | --- | --- |
 * | `(tap)="f"` | `bind:tap="f"` |
 * | `(tap.stop)="f"` / `(tap.prevent)="f"` | `catch:tap="f"` |
 * | `(tap.capture)="f"` | `capture-bind:tap="f"` |
 * | `(tap.stop.capture)="f"` | `capture-catch:tap="f"` |
 * | `(click)="f"`（非自定义组件） | `bind:tap="f"` |
 *
 * 两端必须同步：wxml 属性名由这里定，逻辑层监听键由运行时 `mpListenerKeys` 定，
 * 对不上就是「产物看着对、点下去没反应」。
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
 * 可识别的模板修饰符。`stop` / `prevent` 都落 `catch`（小程序的 catch 本身就意味着
 * 不再向上冒泡），`capture` 决定走捕获阶段。`once` 不参与前缀，只从事件名上剔掉，
 * 只响一次的语义在运行期实现。
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
 * 从尾部剥已知修饰符。只认表里的、只从尾部往前剥：`keyup.enter` 的 `enter` 是
 * Angular 的按键修饰符，不能被当成小程序修饰符吃掉。
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
 * 逻辑层监听键。`bind` 用裸事件名，其余带前缀，与运行时
 * `getListenerEventMapping(prefix, name)` 的产物同形。
 */
export function mpListenerKey(type: string, prefix: MpEventPrefix): string {
  return prefix === 'bind' ? type : `${prefix}${type}`;
}

/**
 * DOM 事件名 → 小程序事件名（小程序里没有 `click`，只有 `tap`）。
 * 表里这些名字只在宿主是普通元素时成立，整张表由 `isOwnEvent` 统一豁免。
 * 只装 DOM↔小程序的别名；平台之间的差异见各平台目录。
 */
export const DOM_EVENT_ALIASES: Record<string, string> = {
  click: 'tap',
};

export function parseMpEvent(
  raw: string,
  /** `isOwnEvent`：事件名属于宿主自己（宿主是自定义组件，或宿主上的指令声明了同名 `@Output`），不能按原生事件改写。 */
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
