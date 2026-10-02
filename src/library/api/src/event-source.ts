import { Observable } from 'rxjs';

/**
 * 平台 `onXxx` / `offXxx` 事件对 -> 冷流。
 *
 * 订阅即注册监听，退订即移除，无需手工配对。
 * `on` / `off` 由调用方提供（内部通常走 MpApiService 的调用管线）。
 */
export function fromMpEvent<T>(
  on: (handler: (res: T) => void) => void,
  off: (handler: (res: T) => void) => void,
) {
  return new Observable<T>((subscriber) => {
    const handler = (res: T) => subscriber.next(res);
    on(handler);
    return () => off(handler);
  });
}

/**
 * 单例式事件源：平台只提供 on*（无 off*）时用，退订只断开本地订阅。
 */
export function fromMpEventOnce<T>(on: (handler: (res: T) => void) => void) {
  return fromMpEvent(on, () => undefined);
}
