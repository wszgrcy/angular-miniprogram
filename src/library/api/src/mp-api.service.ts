/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ɵChangeDetectionScheduler as ChangeDetectionScheduler,
  Injectable,
  ɵNotificationSource as NotificationSource,
  inject,
} from '@angular/core';
import { MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram/platform';
import { MpEventChannel } from './event-channel';
import { MpInterceptorRegistry, runHookQueue } from './interceptor-registry';
import { MP_PLATFORM } from './platform';
import { hasCallbackHandlers, shouldPromise } from './promisify';
import { applyFieldMap } from './protocol-engine';
import {
  GENERIC_RESULT_NORMALIZERS,
  MP_API_PROTOCOLS,
  MpApiProtocol,
} from './protocols';
import {
  buildAppBaseInfo,
  buildDeviceInfo,
  buildWindowInfo,
  enhanceSystemInfo,
} from './system-info';
import { MpApiInterceptor, MpApiNameInput, MpCallbackOptions } from './types';

/**
 * 统一小程序 API 服务（root 单例），对标 uni-app 的 uni.xxx 层。
 *
 * 三层职责，全部对齐 uni 的调用管线：
 *
 *   invoke(name, options)
 *     -> Promise 化判定（未传回调且非 sync/task 时返回 Promise）
 *     -> 拦截器（invoke 可改写参数 / false 阻断；success/fail/complete 改写结果）
 *     -> 平台协议归一化（API 名 / 参数 / 结果，如 my.showModal -> alert/confirm）
 *     -> 目标全局对象（wx / my / tt / swan / qq / dd / jd）
 *
 * 所有回调经 `ɵChangeDetectionScheduler` 通知变更检测，不依赖 zone。
 */
@Injectable({ providedIn: 'root' })
export class MpApiService {
  private readonly globalObject = inject(MINIPROGRAM_GLOBAL_TOKEN) as Record<
    string,
    any
  >;
  private readonly platform = inject(MP_PLATFORM);
  private readonly protocols = inject(MP_API_PROTOCOLS);
  private readonly scheduler = inject(ChangeDetectionScheduler);
  private readonly registry = new MpInterceptorRegistry();
  private readonly eventChannels = new Map<number, MpEventChannel>();
  private channelSeq = 0;

  // ---------------------------------------------------------------- 拦截器

  /** `addInterceptor('navigateTo', {...})` 按 API 拦截；`addInterceptor({...})` 全局拦截 */
  addInterceptor(
    nameOrInterceptor: string | MpApiInterceptor,
    interceptor?: MpApiInterceptor,
  ): void {
    this.registry.add(nameOrInterceptor, interceptor);
  }

  removeInterceptor(
    nameOrInterceptor: string | MpApiInterceptor,
    interceptor?: MpApiInterceptor,
  ): void {
    this.registry.remove(nameOrInterceptor, interceptor);
  }

  // ---------------------------------------------------------------- 通用调用

  /**
   * 通用入口：`invoke('showToast', { title: 'hi' })`。
   * `name` 带已知 API 名补全，也接受任意字符串（运行时由平台报不支持）。
   * 未传回调且非 sync/task API 时返回 Promise。
   */
  invoke<T = any>(
    name: MpApiNameInput,
    options: MpCallbackOptions = {},
  ): any {
    const opts: MpCallbackOptions = { ...options };
    const promiseable = shouldPromise(name) && !hasCallbackHandlers(opts);

    let resolveFn!: (value: T) => void;
    let rejectFn!: (reason: any) => void;
    const promise = promiseable
      ? new Promise<T>((resolve, reject) => {
          resolveFn = resolve;
          rejectFn = reject;
        })
      : undefined;

    if (promiseable) {
      opts.success = (res) => resolveFn(res);
      opts.fail = (err) => rejectFn(err);
      this.invokeWithInterceptors(name, opts);
      // Promise 模式下返回值就是 Promise 本身（returnValue 钩子作用于 Promise，同 uni）
      return this.registry.applyReturnValue(name, promise);
    }

    return this.registry.applyReturnValue(name, this.invokeWithInterceptors(name, opts));
  }

  /** 直接取平台原始 API（跳过协议/拦截器），用于协议 custom 之外的特殊场景 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRawApi(name: MpApiNameInput): ((...args: any[]) => any) | undefined {
    const fn = this.globalObject?.[name];
    return typeof fn === 'function' ? fn : undefined;
  }

  // ---------------------------------------------------------------- 导航

  /**
   * 导航并建立事件通道（同 uni）：url 自动拼 `__id__`，
   * 目标页从 query 取 id 调 `getEventChannel(id)` 消费同一通道。
   */
  navigateTo(urlOrOptions: string | MpCallbackOptions): Promise<any> {
    const opts: MpCallbackOptions =
      typeof urlOrOptions === 'string'
        ? { url: urlOrOptions }
        : { ...urlOrOptions };
    const channel = this.initEventChannel(opts.events);
    if (opts.url) {
      opts.url =
        opts.url +
        (String(opts.url).indexOf('?') === -1 ? '?' : '&') +
        '__id__=' +
        channel.id;
    }
    return this.invoke('navigateTo', opts).then((res: any) => {
      if (res && typeof res === 'object') {
        res.eventChannel = channel;
      }
      return res;
    });
  }

  redirectTo(urlOrOptions: string | MpCallbackOptions): Promise<void> {
    return this.invoke(
      'redirectTo',
      typeof urlOrOptions === 'string'
        ? { url: urlOrOptions }
        : urlOrOptions,
    );
  }

  switchTab(urlOrOptions: string | MpCallbackOptions): Promise<void> {
    return this.invoke(
      'switchTab',
      typeof urlOrOptions === 'string'
        ? { url: urlOrOptions }
        : urlOrOptions,
    );
  }

  reLaunch(urlOrOptions: string | MpCallbackOptions): Promise<void> {
    return this.invoke(
      'reLaunch',
      typeof urlOrOptions === 'string'
        ? { url: urlOrOptions }
        : urlOrOptions,
    );
  }

  navigateBack(deltaOrOptions: number | MpCallbackOptions = 1): Promise<void> {
    return this.invoke(
      'navigateBack',
      typeof deltaOrOptions === 'number'
        ? { delta: deltaOrOptions }
        : deltaOrOptions,
    );
  }

  /** 目标页消费通道（一次性，取后即除） */
  getEventChannel(id: number): MpEventChannel | undefined {
    const channel = this.eventChannels.get(id);
    this.eventChannels.delete(id);
    return channel;
  }

  private initEventChannel(events?: Record<string, (...args: any[]) => void>) {
    const channel = new MpEventChannel(++this.channelSeq, events);
    this.eventChannels.set(channel.id!, channel);
    return channel;
  }

  // ---------------------------------------------------------------- 交互

  showToast(options: string | MpCallbackOptions): Promise<void> {
    return this.invoke(
      'showToast',
      typeof options === 'string' ? { title: options } : options,
    );
  }

  hideToast(): Promise<void> {
    return this.invoke('hideToast');
  }

  showLoading(titleOrOptions: string | MpCallbackOptions = ''): Promise<void> {
    return this.invoke(
      'showLoading',
      typeof titleOrOptions === 'string'
        ? { title: titleOrOptions }
        : titleOrOptions,
    );
  }

  hideLoading(): Promise<void> {
    return this.invoke('hideLoading');
  }

  showModal(options: MpCallbackOptions): Promise<any> {
    return this.invoke('showModal', options);
  }

  showActionSheet(options: MpCallbackOptions): Promise<any> {
    return this.invoke('showActionSheet', options);
  }

  // ---------------------------------------------------------------- 存储（异步）

  setStorage(key: string, value: unknown): Promise<any> {
    return this.invoke('setStorage', { key, data: value });
  }

  /** 直接返回存储值（结果 {data} 已拆） */
  getStorage<T = any>(key: string): Promise<T> {
    return this.invoke<{ data: T }>('getStorage', { key }).then(
      (res: { data: T }) => res?.data,
    );
  }

  removeStorage(key: string): Promise<any> {
    return this.invoke('removeStorage', { key });
  }

  clearStorage(): Promise<any> {
    return this.invoke('clearStorage');
  }

  // ---------------------------------------------------------------- 存储（同步）

  setStorageSync(key: string, value: unknown): void {
    this.callSync('setStorageSync', key, value);
  }

  getStorageSync<T = any>(key: string): T {
    return this.callSync<T>('getStorageSync', key);
  }

  removeStorageSync(key: string): void {
    this.callSync('removeStorageSync', key);
  }

  clearStorageSync(): void {
    this.callSync('clearStorageSync');
  }

  // ---------------------------------------------------------------- 系统

  upx2px(value: number, deviceWidth?: number): number {
    const g = this.globalObject;
    if (typeof g?.upx2px !== 'function') {
      return value;
    }
    // 支付宝收裸数字，微信系收 options 对象
    if (this.platform === 'my') {
      return g.upx2px(value);
    }
    return deviceWidth === undefined
      ? g.upx2px({ number: value })
      : g.upx2px({ number: value, to: 'px', deviceWidth });
  }

  canIUse(schema: string): boolean {
    try {
      return !!this.globalObject?.canIUse?.(schema);
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------- 系统信息族

  /** 全量增强：原始结果 + 归一字段（device/host/os/safeAreaInsets） */
  getSystemInfoSync(): any {
    const raw = this.callSync<any>('getSystemInfoSync');
    return enhanceSystemInfo(this.platform, this.globalObject, raw, {});
  }

  /** 异步全量（走 invoke 管线，可被拦截） */
  getSystemInfo(): Promise<any> {
    return this.invoke('getSystemInfo').then((res: any) =>
      enhanceSystemInfo(this.platform, this.globalObject, res, {}),
    );
  }

  /** 平台有原生拆分 API 用原生，否则从 getSystemInfoSync 拼 */
  getDeviceInfo(): any {
    const source = this.getRawApi('getDeviceInfo')
      ? this.callSync<any>('getDeviceInfo')
      : this.callSync<any>('getSystemInfoSync');
    return buildDeviceInfo(this.platform, this.globalObject, source);
  }

  getAppBaseInfo(): any {
    const source = this.getRawApi('getAppBaseInfo')
      ? this.callSync<any>('getAppBaseInfo')
      : this.callSync<any>('getSystemInfoSync');
    return buildAppBaseInfo(this.platform, this.globalObject, source);
  }

  getWindowInfo(): any {
    const source = this.getRawApi('getWindowInfo')
      ? this.callSync<any>('getWindowInfo')
      : this.callSync<any>('getSystemInfoSync');
    return buildWindowInfo(this.platform, this.globalObject, source);
  }

  getMenuButtonBoundingClientRect(): any {
    return this.callSync('getMenuButtonBoundingClientRect');
  }

  // ---------------------------------------------------------------- 内部管线

  private invokeWithInterceptors(
    name: string,
    opts: MpCallbackOptions,
  ): unknown {
    const invokeHooks = this.registry.hooks(name, 'invoke');
    if (invokeHooks.length) {
      const queue = runHookQueue(invokeHooks, { name, options: opts });
      if (queue.blocked) {
        return undefined;
      }
      if (queue.promise) {
        return queue.promise.then((ctx) => {
          if (ctx === false || ctx == null) {
            return undefined;
          }
          const finalOpts = (ctx as MpCallbackOptions).options ?? opts;
          return this.invokeFinal(name, finalOpts);
        });
      }
      opts = (queue.value as MpCallbackOptions)?.options ?? opts;
    }
    return this.invokeFinal(name, opts);
  }

  /** 包装 success/fail/complete：拦截钩子 + 变更检测通知 */
  private invokeFinal(name: string, opts: MpCallbackOptions): unknown {
    const wrapped: MpCallbackOptions = { ...opts };
    (['success', 'fail', 'complete'] as const).forEach((key) => {
      const original = wrapped[key];
      const hooks = this.registry.hooks(name, key);
      if (!original && !hooks.length) {
        return;
      }
      wrapped[key] = (res: unknown) => {
        this.runInAngular(() => {
          let out = res;
          for (const hook of hooks) {
            const result = hook(out, opts);
            if (result !== undefined && result !== false) {
              out = result;
            }
          }
          original?.(out);
        });
      };
    });
    return this.dispatch(name, wrapped);
  }

  /** 平台协议归一化后调用目标 API */
  private dispatch(name: string, opts: MpCallbackOptions): unknown {
    const protocol: MpApiProtocol | undefined =
      this.protocols[this.platform]?.[name];

    if (protocol?.custom) {
      return protocol.custom(opts, (targetName, targetArgs) =>
        this.rawCall(targetName, targetArgs, name),
      );
    }

    const normalize = GENERIC_RESULT_NORMALIZERS[this.platform];

    // 结果处理链：平台原始结果 -> 通用归一(errMsg) -> 协议 returnValue -> 下游
    // returnValue 只作用于成功结果；通用归一对 success/fail/complete 都生效
    const wrapResult = (
      handler: ((res: any) => void) | undefined,
      withProtocol: boolean,
    ) => {
      if (!handler) {
        return undefined;
      }
      return (res: any) => {
        let out = normalize ? normalize(name, res) : res;
        if (withProtocol && protocol?.transformResult) {
          out = protocol.transformResult(out);
        }
        if (withProtocol && protocol?.returnValue) {
          out = applyFieldMap(out, protocol.returnValue);
        }
        handler(out);
      };
    };

    const finalOpts: MpCallbackOptions = { ...opts };
    (['success', 'fail', 'complete'] as const).forEach((key) => {
      const wrapped = wrapResult(opts[key], key === 'success');
      if (wrapped) {
        finalOpts[key] = wrapped;
      } else {
        delete finalOpts[key];
      }
    });

    const finalArgs =
      protocol?.args !== undefined
        ? applyFieldMap(finalOpts, protocol.args)
        : finalOpts;
    return this.rawCall(protocol?.name ?? name, finalArgs, name);
  }

  private rawCall(
    targetName: string,
    args: MpCallbackOptions,
    unifiedName: string,
  ): unknown {
    const fn = this.getRawApi(targetName);
    if (!fn) {
      const error = new Error(
        `当前平台(${this.platform})不支持 API: ${unifiedName}${
          targetName !== unifiedName ? `(${targetName})` : ''
        }`,
      );
      // 有回调面时走回调（Promise 模式下即 reject），否则直接抛出
      if (hasCallbackHandlers(args)) {
        args.fail?.(error);
        args.complete?.(error);
        return undefined;
      }
      throw error;
    }
    return fn.call(this.globalObject, args);
  }

  private callSync<T>(name: string, ...args: unknown[]): T {
    const fn = this.getRawApi(name);
    if (!fn) {
      throw new Error(`当前平台(${this.platform})不支持 API: ${name}`);
    }
    const result = fn.apply(this.globalObject, args) as any;
    // 同步 API 同样过协议（如支付宝 getStorageSync 的 {data} 拆封）
    const protocol = this.protocols[this.platform]?.[name];
    if (!protocol) {
      return result as T;
    }
    let out = result;
    if (protocol.transformResult) {
      out = protocol.transformResult(out);
    }
    if (protocol.returnValue) {
      out = applyFieldMap(out, protocol.returnValue);
    }
    return out as T;
  }

  private runInAngular(fn: () => void): void {
    try {
      fn();
    } finally {
      this.scheduler.notify(NotificationSource.Listener);
    }
  }
}
