/* eslint-disable @typescript-eslint/no-explicit-any */

type ChannelListener = {
  type: 'on' | 'once';
  fn: (...args: any[]) => void;
};

/**
 * 页面间事件通道，参考 uni-shared 的 EventChannel。
 *
 * 机制平台无关：navigateTo 时创建通道并把 `__id__` 拼进 url，
 * 目标页从 query 里取 id 调 `getEventChannel(id)` 消费，
 * 之后 opener 与 target 通过同一通道互发事件。
 *
 * emit 早于监听的事件进缓存，注册监听时冲刷（解决两端启动时序不确定）。
 */
export class MpEventChannel {
  id?: number;
  private listeners = new Map<string, ChannelListener[]>();
  private emitCache: { eventName: string; args: any[] }[] = [];

  constructor(
    id?: number,
    events?: Record<string, (...args: any[]) => void>,
  ) {
    this.id = id;
    if (events) {
      Object.keys(events).forEach((name) => this.on(name, events[name]));
    }
  }

  emit(eventName: string, ...args: any[]): void {
    const fns = this.listeners.get(eventName);
    if (!fns || fns.length === 0) {
      this.emitCache.push({ eventName, args });
      return;
    }
    fns.forEach((opt) => opt.fn.apply(opt.fn, args));
    this.listeners.set(
      eventName,
      fns.filter((opt) => opt.type !== 'once'),
    );
  }

  on(eventName: string, fn: (...args: any[]) => void): void {
    const list = this.listeners.get(eventName) ?? [];
    list.push({ fn, type: 'on' });
    this.listeners.set(eventName, list);
    this.flushCache(eventName);
  }

  once(eventName: string, fn: (...args: any[]) => void): void {
    const list = this.listeners.get(eventName) ?? [];
    list.push({ fn, type: 'once' });
    this.listeners.set(eventName, list);
    this.flushCache(eventName);
  }

  off(eventName: string, fn?: (...args: any[]) => void): void {
    const fns = this.listeners.get(eventName);
    if (!fns) {
      return;
    }
    if (fn) {
      this.listeners.set(
        eventName,
        fns.filter((opt) => opt.fn !== fn),
      );
    } else {
      this.listeners.delete(eventName);
    }
  }

  private flushCache(eventName: string): void {
    const matched = this.emitCache.filter((c) => c.eventName === eventName);
    if (!matched.length) {
      return;
    }
    this.emitCache = this.emitCache.filter(
      (c) => c.eventName !== eventName,
    );
    matched.forEach((c) => this.emit(c.eventName, ...c.args));
  }
}
