/**
 * 模板事件名 → 逻辑层监听键。
 *
 * 编译期把 `(tap.stop)` 写成 wxml 的 `catch:tap="catchEvent"`，事件打过来时
 * `catchEvent` 只会拿 `event.type`（`tap`）去 `nodeList[i].listener` 里查键。
 * 而 Angular 注册监听用的是模板上那串原文（`tap.stop`），两边对不上就是
 * 「wxml 看着没问题、点下去没反应」。所以 `renderer.listen` 落库前先把名字
 * 归一化一遍。
 *
 * 规则必须与编译期的 `src/builder/mini-program-compiler/event-name.ts` 一致，
 * 两边的用例表在各自 spec 里逐条对齐。这里**多登记一个键**而不是替换：
 * 编译期知道宿主是不是自定义组件（组件上的 `click` 是它自己的 @Output，
 * 不能当 tap），运行期不知道，于是 `click` 的两个候选键都留着 ——
 * 多出来的键没人查，等于没绑。
 */

/** 可识别的模板修饰符，与编译期同一张表 */
const MODIFIERS = new Set(['stop', 'prevent', 'capture', 'once']);

/**
 * DOM 事件名 → 小程序事件名，与编译期 `DOM_EVENT_ALIASES` 同一张表。
 *
 * builder / library 是两个包，拿不到对方源文件，所以这里抄一份，
 * 由 `src/builder/mini-program-compiler/event-name.spec.ts` 逐字比对防漂移。
 */
export const DOM_EVENT_ALIASES: Record<string, string> = {
  click: 'tap',
};

interface ParsedEventName {
  type: string;
  prefix: string;
  once: boolean;
}

function parseEventName(name: string): ParsedEventName {
  const parts = name.split('.');
  const modifiers: string[] = [];
  // 只从尾部剥已知修饰符：`keyup.enter` 的 `enter` 不是小程序修饰符
  while (parts.length > 1 && MODIFIERS.has(parts[parts.length - 1])) {
    modifiers.push(parts.pop() as string);
  }
  const capture = modifiers.includes('capture');
  const stop = modifiers.includes('stop') || modifiers.includes('prevent');
  return {
    type: parts.join('.'),
    prefix: capture
      ? stop
        ? 'capture-catch'
        : 'capture-bind'
      : stop
        ? 'catch'
        : 'bind',
    once: modifiers.includes('once'),
  };
}

/**
 * 一个模板事件名在 `listener` 表里允许占的键。
 *
 * 首个永远是模板原文，保证既有写法（含 `keyup.enter` 这类 Angular
 * 自己的按键修饰符）行为不变；后面才是小程序语义的归一化键。
 */
export function mpListenerKeys(name: string): string[] {
  const { type, prefix } = parseEventName(name);
  const keys = new Set<string>([
    name,
    // `bind` 用裸事件名，其余带前缀 —— 与 getListenerEventMapping 的候选同形
    prefix === 'bind' ? type : `${prefix}${type}`,
  ]);
  // 别名只在「宿主不是自定义组件」时才成立，运行期拿不到宿主身份，
  // 两个键都登记：多出来的键没人查，等于没绑。
  const alias = DOM_EVENT_ALIASES[type];
  if (alias) {
    keys.add(prefix === 'bind' ? alias : `${prefix}${alias}`);
  }
  return [...keys];
}

/**
 * 写了 `.once` —— 只响应一次。
 *
 * 小程序没有「一次性绑定」这种属性，只能由监听器自己收摊：首次触发后把
 * 占过的键全删掉。Angular 的 `listen` 一个视图生命周期里只调一次，删掉就
 * 不会再注册回来，语义与 uni-app 的 `RuntimeEventFlags.Once` 一致。
 */
export function mpListenerOnce(name: string): boolean {
  return parseEventName(name).once;
}
