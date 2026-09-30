/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ɵChangeDetectionScheduler as ChangeDetectionScheduler,
  Injectable,
  ɵNotificationSource as NotificationSource,
  inject,
} from '@angular/core';
import { MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram/platform';
import {
  Observable,
  Subject,
  defer,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { MpEventChannel } from './event-channel';
import {
  MpInvokeContext,
  MpPipeHandle,
  MpPipeRegistry,
  MpPipeSet,
  pipeThrough,
  toAbortError,
} from './pipe-registry';
import { MP_PLATFORM } from './platform';
import { hasCallbackHandlers, isTaskApi, shouldPromise } from './promisify';
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
import { MpApiNameInput, MpCallbackOptions } from './types';

/**
 * 统一小程序 API 服务（root 单例），对标 uni-app 的 uni.xxx 层。
 *
 * rxjs 冷流管线：
 *
 *   invoke$(name, options)
 *     -> of(ctx) -> pre pipes（改写参数 / blockWith 阻断）
 *     -> switchMap(真正调用)   <- 订阅才发生
 *     -> post pipes（改写结果 / 埋点 / catchError）
 *     -> 平台协议归一化（API 名 / 参数 / 结果）在调用层内完成
 *
 * 返回形态：
 * - `invoke$` 可订阅冷流；`invoke` 返回 Promise（急切订阅）
 * - task 类同步返回 task（异步 pre 管道不适用，物理限制）
 * - 同步 API（*Sync / create* / on* 等）直接返回原始值
 * - AbortSignal：未发起即取消 / in-flight 取消（task 类自动 abort）
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
  private readonly registry = inject(MpPipeRegistry);
  private readonly eventChannels = new Map<number, MpEventChannel>();
  private channelSeq = 0;

  // ---------------------------------------------------------------- 管道拦截

  /**
   * 按 API 注册管道：`const h = api.setPipe('navigateTo', { pre: [...] })`
   * 返回句柄，`h.dispose()` 即撤销本次注册。
   */
  setPipe(name: MpApiNameInput, set: MpPipeSet): MpPipeHandle {
    return this.registry.setPipes(name, set);
  }

  removePipe(name: MpApiNameInput): void {
    this.registry.removePipes(name);
  }

  /** 全局管道（对所有 API 生效），同样返回可 dispose 的句柄 */
  setGlobalPipes(set: MpPipeSet): MpPipeHandle {
    return this.registry.setGlobalPipes(set);
  }

  clearGlobalPipes(): void {
    this.registry.clearGlobalPipes();
  }

  // ---------------------------------------------------------------- 通用调用

  /**
   * 冷流入口：订阅才发起调用，全程可管道干预。
   * 用户回调（若传）作为旁路观察者在 post 管道之后触发，
   * 看到的同样是归一/改写后的结果。
   */
  invoke$<T = any>(
    name: MpApiNameInput,
    options: MpCallbackOptions = {},
  ): Observable<T> {
    return defer(() => {
      const { cbs, rest } = this.extractCallbacks(options);
      const ctx: MpInvokeContext = { name, options: rest };
      let stream$: Observable<any> = pipeThrough(of(ctx), [
        ...this.registry.prePipes(name),
        switchMap((c) => this.callObservable<T>(c)),
        ...this.registry.postPipes(name),
      ]);
      if (cbs) {
        let lastRes: any;
        stream$ = stream$.pipe(
          tap(
            (res) => {
              lastRes = res;
              cbs.success?.(res);
            },
            (err) => {
              cbs.fail?.(err);
              cbs.complete?.(err);
            },
            () => cbs.complete?.(lastRes),
          ),
        );
      }
      return stream$;
    });
  }

  /**
   * Promise 入口：普通 API 返回 Promise；task 类同步返回 task；
   * 同步 API 直接返回值。`name` 带补全，也接受任意字符串。
   */
  invoke<T = any>(
    name: MpApiNameInput,
    options: MpCallbackOptions = {},
  ): any {
    if (isTaskApi(name)) {
      return this.invokeTask(name, options);
    }
    if (!shouldPromise(name)) {
      return this.callSync(name, options);
    }
    return new Promise<T>((resolve, reject) => {
      this.invoke$<T>(name, options).subscribe({
        next: (v) => resolve(v),
        error: (e) => reject(e),
      });
    });
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

  private extractCallbacks(options: MpCallbackOptions): {
    cbs: {
      success?: (res: any) => void;
      fail?: (err: any) => void;
      complete?: (res: any) => void;
    } | null;
    rest: MpCallbackOptions;
  } {
    const rest = { ...options };
    const success =
      typeof rest.success === 'function' ? rest.success : undefined;
    const fail = typeof rest.fail === 'function' ? rest.fail : undefined;
    const complete =
      typeof rest.complete === 'function' ? rest.complete : undefined;
    delete rest.success;
    delete rest.fail;
    delete rest.complete;
    const cbs =
      success || fail || complete ? { success, fail, complete } : null;
    return { cbs, rest };
  }

  /** 冷流调用单元：订阅时发起，支持 AbortSignal 取消 */
  private callObservable<T>(ctx: MpInvokeContext): Observable<T> {
    return new Observable<T>((subscriber) => {
      const signal = ctx.options.signal as AbortSignal | undefined;
      if (signal?.aborted) {
        subscriber.error(toAbortError(signal));
        return;
      }
      const onAbort = () => subscriber.error(toAbortError(signal));
      signal?.addEventListener?.('abort', onAbort);

      const opts: MpCallbackOptions = { ...ctx.options };
      delete opts.signal;
      opts.success = (res) =>
        this.runInAngular(() => subscriber.next(res));
      opts.fail = (err) => this.runInAngular(() => subscriber.error(err));

      this.dispatch(ctx.name as string, opts);

      return () => signal?.removeEventListener?.('abort', onAbort);
    });
  }

  /**
   * task 类：同步返回 task。
   * pre 管道同步执行（异步 pre 与同步 task 返回物理互斥）；
   * 结果经 post 管道后再触发用户回调；signal 接 task.abort()。
   */
  private invokeTask(
    name: MpApiNameInput,
    options: MpCallbackOptions,
  ): any {
    const { cbs, rest } = this.extractCallbacks(options);
    let ctx: MpInvokeContext = { name, options: rest };
    let emitted = false;
    let preError: any;

    pipeThrough(of(ctx), this.registry.prePipes(name)).subscribe({
        next: (c) => {
          emitted = true;
          ctx = c;
        },
        error: (e) => {
          preError = e;
        },
      });

    if (preError) {
      this.runInAngular(() => {
        cbs?.fail?.(preError);
        cbs?.complete?.(preError);
      });
      return undefined;
    }
    if (!emitted) {
      // 被裸 filter 掉：不发起调用
      return undefined;
    }

    const result$ = new Subject<any>();
    pipeThrough(result$, this.registry.postPipes(name)).subscribe({
        next: (res) => cbs?.success?.(res),
        error: (err) => {
          cbs?.fail?.(err);
          cbs?.complete?.(err);
        },
      });

    const opts: MpCallbackOptions = { ...ctx.options };
    const signal = opts.signal as AbortSignal | undefined;
    delete opts.signal;
    opts.success = (res) =>
      this.runInAngular(() => {
        result$.next(res);
        result$.complete();
        cbs?.complete?.(res);
      });
    opts.fail = (err) =>
      this.runInAngular(() => result$.error(err));

    const task = this.dispatch(name as string, opts);

    if (signal) {
      const abort = () => {
        try {
          (task as any)?.abort?.();
        } catch {
          /* 平台 task 不支持 abort 时忽略 */
        }
      };
      if (signal.aborted) {
        abort();
      } else {
        signal.addEventListener?.('abort', abort);
      }
    }
    return task;
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
