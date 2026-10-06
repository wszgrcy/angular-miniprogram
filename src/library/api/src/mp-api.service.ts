/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable, inject } from '@angular/core';
import { MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram/platform';
import { Observable, Subject, defer, map, of, switchMap, tap } from 'rxjs';
import { mpContext } from './context-wrapper';
import { MpEventChannel } from './event-channel';
import {
  createMpIntersectionObserver,
  createMpMediaQueryObserverFactory,
  createMpSelectorQuery,
} from './mp-node-query';
import {
  MpInvokeContext,
  MpPipeRegistry,
  MpPipeSet,
  pipeThrough,
  toAbortError,
} from './pipe-registry';
import { MP_PLATFORM } from './platform';
import {
  MpApiReturn,
  MpResultOf,
  MpStreamOf,
  hasCallbackHandlers,
  isTaskApi,
  shouldPromise,
} from './promisify';
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
import { MpApiNameInput, MpCallbackOptions, MpNavigateOptions } from './types';
import {
  MP_API_SCHEMAS,
  MpApiSchema,
  mergeSchemas,
  mpValidationPipe,
} from './validation';

/** 语言持久化存储键（对标 uni 的 UNI_STORAGE_LOCALE） */
const LOCALE_KEY = 'mp.locale';

/**
 * 统一小程序 API 服务（root 单例），对标 uni-app 的 uni.xxx 层。
 *
 * ## 与 MP_API_PROXY 的分工（对齐 uni 的架构）
 *
 * uni 的运行时同样**不手写透传方法**：`uni` 是 Proxy，
 * 未显式实现的 API 自动落到 `platform[key]`；显式实现只存在于
 * 「有真实逻辑」的 API。类型则全部由独立的类型包声明。
 * AMP 采用同一分层：
 *
 * - `MpApiService`（本服务）：调用管线（promisify / 协议归一 / 管道拦截 /
 *   AbortSignal / 变更检测调度）+ 仅这里能实现的增强 API
 *   （事件通道、系统信息增强、上下文包装、节点查询、`on*` 事件流等）。
 * - `MP_API_PROXY`：uni 式兜底门面，任意原生 API 直接调用，
 *   参数 / 返回类型由 `MpApiParamMap` / `MpApiResultMap` 类型表提供
 *   （等价 uni 的 @dcloudio/types 手写声明，但零运行时成本）。
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
 * 回调不再手动调度变更检测：状态统一走 signal，写入 signal 时 Angular
 * 自己会把关联视图标脏并调度一次 tick，不依赖 zone。
 */
@Injectable({ providedIn: 'root' })
export class MpApiService {
  private readonly globalObject = inject(MINIPROGRAM_GLOBAL_TOKEN) as Record<
    string,
    any
  >;
  private readonly platform = inject(MP_PLATFORM);
  private readonly protocols = inject(MP_API_PROTOCOLS);
  private readonly registry = inject(MpPipeRegistry);
  private readonly eventChannels = new Map<number, MpEventChannel>();
  private channelSeq = 0;
  private readonly mediaQueryObserverFactory =
    createMpMediaQueryObserverFactory(
      () => this.getWindowInfo(),
      () => this.event$('onWindowResize', 'offWindowResize'),
    );

  constructor() {
    // 守卫必须内联写：包成 `isMpDevMode()` 后打包器无法证明分支已死，
    // schema 会跟整进生产包（实测 15KB vs 147B）。
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      const raw = inject(MP_API_SCHEMAS, { optional: true });
      const contributions: Record<string, MpApiSchema>[] = Array.isArray(raw)
        ? (raw as Record<string, MpApiSchema>[])
        : raw
          ? [raw as Record<string, MpApiSchema>]
          : [];
      this.registry.setCorePipes({
        pre: [mpValidationPipe(mergeSchemas(contributions))],
      });
    }
  }

  // ---------------------------------------------------------------- 管道拦截

  /**
   * 按 API 注册管道：`const h = api.setPipe('navigateTo', { pre: [...] })`
   * 返回句柄，`h.dispose()` 即撤销本次注册。
   */
  setPipe(name: MpApiNameInput, set: MpPipeSet) {
    return this.registry.setPipes(name, set);
  }

  removePipe(name: MpApiNameInput) {
    this.registry.removePipes(name);
  }

  /** 全局管道（对所有 API 生效），同样返回可 dispose 的句柄 */
  setGlobalPipes(set: MpPipeSet) {
    return this.registry.setGlobalPipes(set);
  }

  clearGlobalPipes() {
    this.registry.clearGlobalPipes();
  }

  // ---------------------------------------------------------------- 通用调用

  /**
   * 冷流入口：订阅才发起调用，全程可管道干预。
   * 用户回调（若传）作为旁路观察者在 post 管道之后触发，
   * 看到的同样是归一/改写后的结果。
   */
  invoke$<N extends MpApiNameInput, T = MpStreamOf<N>>(
    name: N,
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
  invoke<N extends MpApiNameInput, T = MpResultOf<N>>(
    name: N,
    options: MpCallbackOptions = {},
  ): MpApiReturn<N, T> {
    if (isTaskApi(name)) {
      return this.invokeTask(name, options) as MpApiReturn<N, T>;
    }
    if (!shouldPromise(name)) {
      return this.callSync(name, options) as MpApiReturn<N, T>;
    }
    return new Promise<T>((resolve, reject) => {
      this.invoke$<N, T>(name, options).subscribe({
        next: (v) => resolve(v),
        // 小程序 API 的错误载荷是平台原始对象（`{errMsg: ...}`），原样抛给调用方
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        error: (e) => reject(e),
      });
    }) as MpApiReturn<N, T>;
  }

  /** 直接取平台原始 API（跳过协议/拦截器），用于协议 custom 之外的特殊场景 */
  getRawApi(name: MpApiNameInput): ((...args: any[]) => any) | undefined {
    const fn = this.globalObject?.[name];
    return typeof fn === 'function' ? fn : undefined;
  }

  /**
   * 统一名在当前平台是否可用（协议映射后的目标名存在即算可用）。
   * uni 式 Proxy 兜底用它决定属性是否返回 `undefined`。
   */
  hasApi(name: MpApiNameInput): boolean {
    const protocol: MpApiProtocol | undefined =
      this.protocols[this.platform]?.[name];
    if (protocol?.custom) {
      return true;
    }
    return typeof this.getRawApi(protocol?.name ?? name) === 'function';
  }

  // ---------------------------------------------------------------- 导航（带事件通道）

  /**
   * 导航并建立事件通道：url 自动拼 `__id__`，
   * 目标页从 query 取 id 调 `getEventChannel(id)` 消费同一通道。
   * 其余导航类 API（redirectTo/switchTab/reLaunch/navigateBack）
   * 无附加逻辑，走 `invoke` 或 Proxy。
   */
  navigateTo(options: MpNavigateOptions) {
    const opts: MpCallbackOptions = { ...options };
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

  /** 目标页消费通道（一次性，取后即除） */
  getEventChannel(id: number) {
    const channel = this.eventChannels.get(id);
    this.eventChannels.delete(id);
    return channel;
  }

  private initEventChannel(events?: Record<string, (...args: any[]) => void>) {
    const channel = new MpEventChannel(++this.channelSeq, events);
    this.eventChannels.set(channel.id!, channel);
    return channel;
  }

  // ---------------------------------------------------------------- 存储（同步，参数为裸值非 options 对象）

  setStorageSync(key: string, value: unknown) {
    this.callSync('setStorageSync', key, value);
  }

  getStorageSync<T = any>(key: string): T {
    return this.callSync<T>('getStorageSync', key);
  }

  removeStorageSync(key: string) {
    this.callSync('removeStorageSync', key);
  }

  clearStorageSync() {
    this.callSync('clearStorageSync');
  }

  // ---------------------------------------------------------------- 单位 / 能力探测

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

  /**
   * 能力探测。不能直接拿统一名去问平台：协议表里改过名的 API
   * （如 setNavigationBarTitle -> setNavigationBar）会被误报为不支持。
   */
  canIUse(schema: string) {
    const protocol = this.protocols[this.platform]?.[schema];
    const targets = protocol?.probe ?? [protocol?.name ?? schema];

    // 平台探测优先：能覆盖组件等非函数能力
    const probe = this.getRawApi('canIUse');
    if (probe) {
      try {
        return targets.every((t) => !!probe.call(this.globalObject, t));
      } catch {
        // 平台探测不可靠，落到存在性判断
      }
    }

    return targets.every((t) => typeof this.getRawApi(t) === 'function');
  }

  // ---------------------------------------------------------------- 系统信息族（增强拼装）

  /** 全量增强：原始结果 + 归一字段（device/host/os/safeAreaInsets） */
  getSystemInfoSync() {
    const raw = this.callSync<any>('getSystemInfoSync');
    return enhanceSystemInfo(this.platform, this.globalObject, raw);
  }

  /** 异步全量（走 invoke 管线，可被拦截） */
  getSystemInfo() {
    return this.invoke('getSystemInfo').then((res: any) =>
      enhanceSystemInfo(this.platform, this.globalObject, res),
    );
  }

  /** 平台有原生拆分 API（含协议映射名）用原生，否则从 getSystemInfoSync 拼 */
  getDeviceInfo() {
    const source = this.hasApi('getDeviceInfo')
      ? this.callSync<any>('getDeviceInfo')
      : this.callSync<any>('getSystemInfoSync');
    return buildDeviceInfo(this.platform, this.globalObject, source);
  }

  getAppBaseInfo() {
    const source = this.hasApi('getAppBaseInfo')
      ? this.callSync<any>('getAppBaseInfo')
      : this.callSync<any>('getSystemInfoSync');
    return buildAppBaseInfo(this.platform, this.globalObject, source);
  }

  getWindowInfo() {
    const source = this.hasApi('getWindowInfo')
      ? this.callSync<any>('getWindowInfo')
      : this.callSync<any>('getSystemInfoSync');
    return buildWindowInfo(this.platform, this.globalObject, source);
  }

  // ---------------------------------------------------------------- 上下文对象（mpContext 包装，事件可订阅）

  /** 录音管理器：`rec.on('start')` / `rec.on('frameRecorded')` 可订阅 */
  getRecorderManager() {
    return mpContext(this.callSync<any>('getRecorderManager'));
  }

  /** 返回包装后的 SocketTask：`on('open'|'message'|'error'|'close')` 可订阅 */
  connectSocket(options: MpCallbackOptions) {
    return mpContext(this.invoke('connectSocket', options));
  }

  createCanvasContext(canvasId: string) {
    return mpContext(this.callSync<any>('createCanvasContext', canvasId));
  }

  createVideoContext(id: string, component?: any) {
    return mpContext(this.callSync<any>('createVideoContext', id, component));
  }

  createAudioContext(id: string, component?: any) {
    return mpContext(this.callSync<any>('createAudioContext', id, component));
  }

  createInnerAudioContext(options: MpCallbackOptions = {}) {
    return mpContext(this.callSync<any>('createInnerAudioContext', options));
  }

  createMapContext(mapId: string, component?: any) {
    return mpContext(this.callSync<any>('createMapContext', mapId, component));
  }

  createLivePusherContext(id?: string, component?: any) {
    return mpContext(
      this.callSync<any>('createLivePusherContext', id, component),
    );
  }

  getBackgroundAudioManager() {
    return mpContext(this.callSync<any>('getBackgroundAudioManager'));
  }

  // ---------------------------------------------------------------- 节点查询 / 观察器

  /**
   * 节点查询。`exec()` 返回 Promise。
   * @param component 原生小程序组件实例（组件内查询；ng 实例先经 ComponentFinderService 换取）
   */
  createSelectorQuery(component?: unknown) {
    const raw = this.callSync<any>('createSelectorQuery');
    if (component) {
      raw.in?.(component);
    }
    return createMpSelectorQuery(raw);
  }

  /** 交叉观察器：`observe$(selector)` 订阅即 observe，退订即 disconnect */
  createIntersectionObserver(
    options: MpCallbackOptions = {},
    component?: unknown,
  ) {
    const raw = this.callSync<any>('createIntersectionObserver', options);
    if (component) {
      raw.in?.(component);
    }
    return createMpIntersectionObserver(raw);
  }

  /** 媒体查询观察器（JS 求值 + onWindowResize 驱动，各家无原生 API） */
  createMediaQueryObserver() {
    return this.mediaQueryObserverFactory();
  }

  /**
   * 宿主主题变化（对标 uni 的 onHostThemeChange，基于 wx.onThemeChange）。
   * 订阅即注册，退订即移除；结果归一为 `{ hostTheme }`。
   */
  onHostThemeChange() {
    return this.event$<{ theme?: string }>(
      'onThemeChange',
      'offThemeChange',
    ).pipe(map((res) => ({ hostTheme: res?.theme ?? '' })));
  }

  // ---------------------------------------------------------------- 多语言

  private localeCache: string | undefined;
  private readonly localeChanged$ = new Subject<{ locale: string }>();

  /** 当前语言（首次从存储读取，默认 zh-Hans，同 uni） */
  getLocale(): string {
    if (this.localeCache === undefined) {
      let stored = '';
      try {
        stored = String(
          this.callSync<string>('getStorageSync', LOCALE_KEY) ?? '',
        );
      } catch {
        /* 无存储能力时落回默认 */
      }
      this.localeCache = stored || 'zh-Hans';
    }
    return this.localeCache;
  }

  /** 切换语言：持久化并广播，同值返回 false（同 uni 返回值语义） */
  setLocale(locale: string): boolean {
    if (this.getLocale() === locale) {
      return false;
    }
    this.localeCache = locale;
    this.callSync('setStorageSync', LOCALE_KEY, locale);
    this.localeChanged$.next({ locale });
    return true;
  }

  /** 语言切换事件（订阅即监听，无需 off） */
  onLocaleChange(): Observable<{ locale: string }> {
    return this.localeChanged$.asObservable();
  }

  // ================================================================ 事件桥

  /**
   * 平台 `onXxx` / `offXxx` 对子 -> 冷流：订阅即注册，退订即移除。
   * 平台缺任一侧时静默降级（不抛错），事件不可用时流不发出。
   * 无配对 `off*` 的事件（如 onError）省略第二个参数，退订只断开本地订阅。
   *
   * 任意 `on*` 事件都可直接走本方法或 Proxy，不再逐个封装。
   */
  event$<T>(onName: MpApiNameInput, offName?: MpApiNameInput) {
    const table = this.protocols[this.platform];
    const onProtocol = table?.[onName];
    const onTarget = onProtocol?.name ?? onName;
    const offTarget = offName ? table?.[offName]?.name ?? offName : undefined;
    return new Observable<T>((subscriber) => {
      const handler = (res: T) => {
        let out: any = res;
        if (onProtocol?.transformResult) {
          out = onProtocol.transformResult(out);
        }
        if (onProtocol?.returnValue) {
          out = applyFieldMap(out, onProtocol.returnValue);
        }
        subscriber.next(out);
      };
      const on = this.getRawApi(onTarget);
      if (on) {
        on.call(this.globalObject, handler);
      }
      return () => {
        if (offTarget) {
          const off = this.getRawApi(offTarget);
          if (off) {
            off.call(this.globalObject, handler);
          }
        }
      };
    });
  }

  // ================================================================ 内部管线

  private extractCallbacks(options: MpCallbackOptions) {
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
  private callObservable<T>(ctx: MpInvokeContext) {
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
      opts.success = (res) => subscriber.next(res);
      opts.fail = (err) => subscriber.error(err);

      this.dispatch(ctx.name as string, opts);

      return () => signal?.removeEventListener?.('abort', onAbort);
    });
  }

  /**
   * task 类：同步返回 task。
   * pre 管道同步执行（异步 pre 与同步 task 返回物理互斥）；
   * 结果经 post 管道后再触发用户回调；signal 接 task.abort()。
   */
  private invokeTask(name: MpApiNameInput, options: MpCallbackOptions) {
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
      cbs?.fail?.(preError);
      cbs?.complete?.(preError);
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
    opts.success = (res) => {
      result$.next(res);
      result$.complete();
      cbs?.complete?.(res);
    };
    opts.fail = (err) => result$.error(err);

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
  private dispatch(name: string, opts: MpCallbackOptions) {
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

  private callSync<T>(name: string, ...args: unknown[]) {
    const protocol = this.protocols[this.platform]?.[name];
    const fn = this.getRawApi(protocol?.name ?? name);
    if (!fn) {
      throw new Error(`当前平台(${this.platform})不支持 API: ${name}`);
    }
    const result = fn.apply(this.globalObject, args) as any;
    // 同步 API 同样过协议（如支付宝 getStorageSync 的 {data} 拆封）
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
}
