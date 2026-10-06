/* eslint-disable @typescript-eslint/no-explicit-any */

import { Observable, Subscription } from 'rxjs';

/**
 * 节点查询 / 观察器。差异只在返回形态：`exec()` 返回 Promise、`observe$()` 返回 Observable。
 * 回调不手动调度变更检测：状态走 signal，写入时 Angular 自己标脏。
 */

/** 节点字段查询结果（boundingClientRect / scrollOffset / scrollSize 等字段的并集） */
export interface MpNodeInfo {
  id?: string;
  dataset?: Record<string, any>;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  width?: number;
  height?: number;
  scrollLeft?: number;
  scrollTop?: number;
  scrollWidth?: number;
  scrollHeight?: number;
  [field: string]: any;
}

export interface MpSelectorQuery {
  /** 原始平台 SelectorQuery，逃生舱 */
  readonly raw: any;
  select(selector: string): MpSelectorQuery;
  selectAll(selector: string): MpSelectorQuery;
  selectViewport(): MpSelectorQuery;
  /** 限定到某个原生小程序组件实例（组件内查询） */
  in(component: unknown): MpSelectorQuery;
  boundingClientRect(): MpSelectorQuery;
  scrollOffset(): MpSelectorQuery;
  scrollSize(): MpSelectorQuery;
  fields(
    option: Record<string, any>,
    callback?: (res: any) => void,
  ): MpSelectorQuery;
  /** 执行查询，resolve 为各节点结果数组（与 select 顺序一致） */
  exec<T = MpNodeInfo[]>(callback?: (res: T) => void): Promise<T>;
  [method: string]: any;
}

/** IntersectionObserver 回调结果（各端字段并集） */
export interface MpIntersectionObserved {
  intersectionRatio: number;
  boundingClientRect: Record<string, number>;
  intersectionRect: Record<string, number>;
  relativeRect: Record<string, number>;
  time: number;
  id?: string;
  dataset?: Record<string, any>;
  [field: string]: any;
}

export interface MpIntersectionObserver {
  readonly raw: any;
  relativeTo(
    selector: string,
    margins?: Record<string, number>,
  ): MpIntersectionObserver;
  relativeToViewport(margins?: Record<string, number>): MpIntersectionObserver;
  observe(
    selector: string,
    callback: (res: MpIntersectionObserved) => void,
  ): void;
  /** 订阅即 observe，退订即 disconnect */
  observe$(selector: string): Observable<MpIntersectionObserved>;
  disconnect(): void;
  [method: string]: any;
}

/** 媒体查询条件 */
export interface MpMediaQueryDescriptor {
  minWidth?: number;
  maxWidth?: number;
  width?: number;
  minHeight?: number;
  maxHeight?: number;
  height?: number;
  orientation?: 'portrait' | 'landscape';
}

export interface MpMediaQueryResult {
  matches: boolean;
}

export interface MpMediaQueryObserver {
  /** 立即以当前匹配结果触发一次，之后仅在匹配状态变化时触发 */
  observe(
    descriptor: MpMediaQueryDescriptor,
    callback: (res: MpMediaQueryResult) => void,
  ): void;
  observe$(descriptor: MpMediaQueryDescriptor): Observable<MpMediaQueryResult>;
  disconnect(): void;
}

/** 把原生 SelectorQuery 包成链式 + Promise exec 的形态 */
export function createMpSelectorQuery(raw: any): MpSelectorQuery {
  const wrapper: any = new Proxy({} as Record<string, any>, {
    get(_target, prop) {
      if (prop === 'raw') {
        return raw;
      }
      if (prop === 'exec') {
        return (callback?: (res: any) => void) =>
          new Promise((resolve) => {
            raw.exec((res: any) => {
              callback?.(res);
              resolve(res);
            });
          });
      }
      const value = raw[prop];
      if (typeof value === 'function' && prop !== 'constructor') {
        return (...args: any[]) => {
          value.apply(raw, args);
          return wrapper;
        };
      }
      return value;
    },
    has(_target, prop) {
      return prop === 'raw' || prop in raw;
    },
  });
  return wrapper as MpSelectorQuery;
}

/** 把原生 IntersectionObserver 包成 observe$ 可订阅的形态 */
export function createMpIntersectionObserver(raw: any): MpIntersectionObserver {
  const wrapper: any = new Proxy({} as Record<string, any>, {
    get(_target, prop) {
      if (prop === 'raw') {
        return raw;
      }
      if (prop === 'observe') {
        return (selector: string, callback: (res: any) => void) => {
          raw.observe(selector, (res: any) => callback(res));
        };
      }
      if (prop === 'observe$') {
        return (selector: string) =>
          new Observable<MpIntersectionObserved>((subscriber) => {
            raw.observe(selector, (res: any) => subscriber.next(res));
            return () => raw.disconnect?.();
          });
      }
      const value = raw[prop];
      if (typeof value === 'function' && prop !== 'constructor') {
        return (...args: any[]) => {
          const out = value.apply(raw, args);
          return out === raw ? wrapper : out;
        };
      }
      return value;
    },
    has(_target, prop) {
      return prop === 'raw' || prop in raw;
    },
  });
  return wrapper as MpIntersectionObserver;
}

/** 纯 JS 求值（各家小程序无原生媒体查询 API） */
export function matchMpMediaQuery(
  descriptor: MpMediaQueryDescriptor,
  windowWidth: number,
  windowHeight: number,
): boolean {
  const {
    minWidth,
    maxWidth,
    width,
    minHeight,
    maxHeight,
    height,
    orientation,
  } = descriptor;
  if (minWidth !== undefined && windowWidth < minWidth) {
    return false;
  }
  if (maxWidth !== undefined && windowWidth > maxWidth) {
    return false;
  }
  if (width !== undefined && windowWidth !== width) {
    return false;
  }
  if (minHeight !== undefined && windowHeight < minHeight) {
    return false;
  }
  if (maxHeight !== undefined && windowHeight > maxHeight) {
    return false;
  }
  if (height !== undefined && windowHeight !== height) {
    return false;
  }
  if (orientation !== undefined) {
    const portrait = windowHeight >= windowWidth;
    if ((orientation === 'portrait') !== portrait) {
      return false;
    }
  }
  return true;
}

/**
 * 媒体查询观察器工厂。
 * @param getWindow 当前窗口尺寸来源（getWindowInfo）
 * @param resize$   窗口尺寸变化流（onWindowResize，平台缺失时静默）
 */
export function createMpMediaQueryObserverFactory(
  getWindow: () => { windowWidth: number; windowHeight: number },
  resize$: () => Observable<unknown>,
): () => MpMediaQueryObserver {
  return () => {
    let sub: Subscription | undefined;
    let last: boolean | undefined;

    const observer: MpMediaQueryObserver = {
      observe(descriptor, callback) {
        observer.disconnect();
        const emit = () => {
          const { windowWidth, windowHeight } = getWindow();
          const matches = matchMpMediaQuery(
            descriptor,
            windowWidth,
            windowHeight,
          );
          if (last === undefined || last !== matches) {
            last = matches;
            callback({ matches });
          }
        };
        emit();
        sub = resize$().subscribe(emit);
      },
      observe$(descriptor) {
        return new Observable<MpMediaQueryResult>((subscriber) => {
          observer.observe(descriptor, (res) => subscriber.next(res));
          return () => observer.disconnect();
        });
      },
      disconnect() {
        sub?.unsubscribe();
        sub = undefined;
        last = undefined;
      },
    };
    return observer;
  };
}
