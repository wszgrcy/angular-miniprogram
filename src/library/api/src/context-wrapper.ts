/* eslint-disable @typescript-eslint/no-explicit-any */

import { Observable } from 'rxjs';

/** `start` / `onStart` -> `onStart`（已大写的不重复处理） */
function normalizeEventName(event: string) {
  if (/^on[A-Z]/.test(event)) {
    return event;
  }
  return `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
}

/**
 * 平台上下文对象（RecorderManager / InnerAudioContext / CanvasContext / MapContext 等）的统一包装。
 *
 * - `raw`：原始平台对象，逃生舱
 * - `on(event)`：把平台的 `onXxx` 注册变成可订阅流，退订时自动调对应的 `offXxx`（若存在）
 * - 其余属性 / 方法：透传到原始对象（`play()` / `pause()` / `seek()` …）
 */
export interface MpContext<T extends object = any> {
  readonly raw: T;
  on<R = any>(event: string): Observable<R>;
  [key: string]: any;
}

/**
 * @param raw     平台原始上下文对象
 * @param notify  回调触达 Angular 后的变更检测通知
 */
export function mpContext<T extends object>(
  raw: T,
  notify: (fn: () => void) => void,
): MpContext<T> {
  const streams = new Map<string, Observable<any>>();

  const target = {
    get raw() {
      return raw;
    },
  } as Record<string, any>;

  target.on = (event: string) => {
    const key = normalizeEventName(event);
    let stream = streams.get(key);
    if (!stream) {
      stream = new Observable<any>((subscriber) => {
        const handler = (res: any) => notify(() => subscriber.next(res));
        const onFn = (raw as any)[key];
        if (typeof onFn !== 'function') {
          subscriber.error(
            new Error(`上下文不支持事件: ${key}（${raw.constructor?.name}）`),
          );
          return;
        }
        onFn.call(raw, handler);
        return () => {
          const offFn = (raw as any)[`off${key.slice(2)}`];
          if (typeof offFn === 'function') {
            offFn.call(raw, handler);
          }
        };
      });
      streams.set(key, stream);
    }
    return stream;
  };

  return new Proxy(target, {
    get(receiver, prop, recv) {
      if (prop in receiver) {
        return Reflect.get(receiver, prop, recv);
      }
      const value = (raw as any)[prop];
      if (typeof value === 'function') {
        return value.bind(raw);
      }
      return value;
    },
    set(receiver, prop, value) {
      if (prop === 'on' || prop === 'raw') {
        return Reflect.set(receiver, prop, value);
      }
      (raw as any)[prop] = value;
      return true;
    },
    has(receiver, prop) {
      return prop in receiver || prop in (raw as any);
    },
  }) as MpContext<T>;
}
