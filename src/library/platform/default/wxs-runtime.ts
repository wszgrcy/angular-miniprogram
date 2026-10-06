/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
/**
 * wxs 运行时。
 *
 * 新架构下渲染层与逻辑层是**彻底解耦**的：整条表达式在 wxml 里求值，
 * 逻辑层只把枝叶数据推到 `nodeList` 上，压根不知道 wxs 的存在。
 * 因此这里**没有** marker / proxy / token 那一套 —— 那些都是为了让
 * 逻辑层"参与"渲染层计算而生的，与隔离原则相悖。
 *
 * 运行时只剩两件必须做的事：
 *
 *   1. 模块元数据注册表 —— 启动时要知道哪些方法名会被渲染层回调
 *   2. callMethod 转发器 —— 渲染层→逻辑层的唯一通道
 */

/**
 * 编译期从 `.wxs` 源提出的元数据（导出成员 / callMethod 名单）。
 *
 * 为什么不能等 callMethod 调用时再动态注册：小程序的
 * `ownerInstance.callMethod(name)` 要求 `name` 已在 Component({methods})
 * 里存在，调用时再注册已经晚了。
 */
export interface WxsModuleDefinition {
  exports: string[];
  callMethods: string[];
}

const moduleRegistry = new Map<string, WxsModuleDefinition>();

export function registerWxsModule(
  name: string,
  definition: WxsModuleDefinition,
): void {
  moduleRegistry.set(name, definition);
}

export function getWxsModuleDefinition(
  name: string,
): WxsModuleDefinition | undefined {
  return moduleRegistry.get(name);
}

/** 所有已注册模块会回调的逻辑层方法名（去重） */
export function collectWxsCallMethods(): string[] {
  const set = new Set<string>();
  moduleRegistry.forEach((def) => {
    def.callMethods.forEach((m) => set.add(m));
  });
  return [...set];
}

/** @internal 仅测试用 */
export function clearWxsModuleRegistry(): void {
  moduleRegistry.clear();
}

/**
 * 未 link 期间的回调暂存上限。
 *
 * 渲染层可能在 Angular 组件与 MP 实例完成链接之前就触发 callMethod
 * （首屏 wxs 事件比 attach 先到）。直接丢会让用户看到「偶发失灵」，
 * 无限存又可能撞内存，所以限额 + 溢出告警。
 */
const PENDING_CALL_LIMIT = 20;
const pendingCallMethods = new WeakMap<
  object,
  Array<{ name: string; args: unknown }>
>();
const warnedOverflow = new WeakSet<object>();

/**
 * 生成 callMethod 转发器，铺到 MP Component.methods 上。
 *
 * 这是渲染层→逻辑层的**唯一**通道，且是异步语义：
 * wxs 拿不到返回值的后续影响，只能发个消息过来。
 */
export function createWxsCallMethodForwarders(
  names: string[],
): Record<string, (...args: unknown[]) => unknown> {
  const methods: Record<string, (...args: unknown[]) => unknown> = {};
  for (const name of names) {
    methods[name] = function (this: any, args: unknown) {
      const ngInstance = this.__ngComponentInstance;
      if (!ngInstance) {
        queueCallMethod(this, name, args);
        return undefined;
      }
      return invokeNgMethod(ngInstance, name, args);
    };
  }
  return methods;
}

function queueCallMethod(
  mpInstance: object,
  name: string,
  args: unknown,
): void {
  const list = pendingCallMethods.get(mpInstance) || [];
  if (list.length >= PENDING_CALL_LIMIT) {
    if (!warnedOverflow.has(mpInstance)) {
      warnedOverflow.add(mpInstance);
      console.warn(
        `[wxs] callMethod('${name}') 在组件链接完成前堆积超过 ` +
          `${PENDING_CALL_LIMIT} 条，后续将被丢弃。`,
      );
    }
    return;
  }
  list.push({ name, args });
  pendingCallMethods.set(mpInstance, list);
}

/**
 * 链接完成后补发暂存的回调。
 *
 * 必须在 `linkNgComponentWithPath` 里调用，否则首屏事件会永久滞留。
 */
export function flushPendingCallMethods(mpInstance: object): void {
  const list = pendingCallMethods.get(mpInstance);
  if (!list || !list.length) {
    return;
  }
  pendingCallMethods.delete(mpInstance);
  const ngInstance = (mpInstance as any).__ngComponentInstance;
  if (!ngInstance) {
    return;
  }
  for (const item of list) {
    invokeNgMethod(ngInstance, item.name, item.args);
  }
}

function invokeNgMethod(ngInstance: any, name: string, args: unknown): unknown {
  const fn = ngInstance[name];
  if (typeof fn !== 'function') {
    console.warn(
      `[wxs] callMethod('${name}') 在组件上找不到对应方法，` +
        `请确认 wxs 里的方法名与组件方法一致。`,
    );
    return undefined;
  }
  return fn.call(ngInstance, args);
}
