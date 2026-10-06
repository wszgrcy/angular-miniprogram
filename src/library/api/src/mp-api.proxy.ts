/* eslint-disable @typescript-eslint/no-explicit-any */

import { InjectionToken, inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MpParamOf } from './domain-types';
import { MpApiService } from './mp-api.service';
import { MpApiReturn } from './promisify';
import { MpApiName, MpApiNameInput, MpCallbackOptions } from './types';

/**
 * Proxy 兜底：任意原生 API 直接 `proxy.xxx(options)` 调用，自动走 MpApiService 的
 * promisify / 协议归一 / 管道拦截全套管线。语义：
 * - 平台（含协议映射后）不存在该 API 时属性返回 `undefined`
 * - 普通异步 API 返回 Promise，task 类返回 task，`*Sync` 直接返回值
 * - `on*` 名字：不传参返回 Observable（订阅即注册，退订即移除）；传回调则返回 Subscription
 * - 拦截：管道照常可用（`api.setPipe('navigateTo', ...)`），Proxy 只是 MpApiService 的门面
 */
export interface MpApiEventCall<T = any> {
  (): Observable<T>;
  (handler: (res: T) => void): Subscription;
}

export type MpApiProxyEntry<N extends MpApiNameInput = string> =
  N extends `on${string}`
    ? MpApiEventCall
    : (options?: MpParamOf<N>) => MpApiReturn<N>;

/** 已知 API 名获得精确签名，未知名字保留任意字符串兜底 */
export type MpApiProxy = {
  [N in MpApiName]: MpApiProxyEntry<N>;
} & Record<string, MpApiProxyEntry | undefined>;

function createFacade(
  api: MpApiService,
  name: string,
): MpApiProxyEntry | MpApiEventCall | undefined {
  if (/^on[A-Z]/.test(name)) {
    if (!api.hasApi(name)) {
      return undefined;
    }
    const offName = `off${name.slice(2)}`;
    return ((handler?: (res: any) => void) =>
      handler
        ? api.event$(name, offName).subscribe((res) => handler(res))
        : api.event$(name, offName)) as MpApiEventCall;
  }
  if (!api.hasApi(name)) {
    return undefined;
  }
  return (options?: MpCallbackOptions) => api.invoke(name, options);
}

export function createMpApiProxy(api: MpApiService): MpApiProxy {
  const cache = new Map<string, MpApiProxyEntry | MpApiEventCall>();
  return new Proxy({} as MpApiProxy, {
    get(_target, prop) {
      if (typeof prop !== 'string') {
        return undefined;
      }
      if (cache.has(prop)) {
        return cache.get(prop);
      }
      const fn = createFacade(api, prop);
      if (fn !== undefined) {
        cache.set(prop, fn);
      }
      return fn;
    },
    has(_target, prop) {
      return typeof prop === 'string' && createFacade(api, prop) !== undefined;
    },
  });
}

/**
 * 注入用法：
 *
 * ```ts
 * constructor(private mp: MpApiProxy) {}
 * this.mp.showToast({ title: 'hi' });        // Promise
 * this.mp.onKeyboardHeightChange()          // Observable
 * ```
 */
export const MP_API_PROXY = new InjectionToken<MpApiProxy>('MP_API_PROXY', {
  providedIn: 'root',
  factory: () => createMpApiProxy(inject(MpApiService)),
});
