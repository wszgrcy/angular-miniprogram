/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (payload: any) => void;

/**
 * 全局事件总线（root 单例），对标 uni 的 `uni.$on/$off/$emit`。
 *
 * 与 rxjs Subject 的区别：为了 `off(event, handler)` 的精确移除语义，
 * 用 handler 集合手工派发；`on` 同时返回退订函数，两种用法都支持。
 * 监听方改状态走 signal，写入时 Angular 自己标脏，无需手动调度。
 */
@Injectable({ providedIn: 'root' })
export class MpEventBus implements OnDestroy {
  private readonly listeners = new Map<string, Set<Handler>>();

  /** 返回退订函数，等价于 `off(event, handler)` */
  on<T = any>(event: string, handler: (payload: T) => void): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler as Handler);
    return () => this.off(event, handler);
  }

  once<T = any>(event: string, handler: (payload: T) => void): () => void {
    const wrapped: Handler = (payload) => {
      this.off(event, wrapped);
      handler(payload);
    };
    (handler as any).__mpOnce = wrapped;
    return this.on(event, wrapped);
  }

  off(event: string, handler?: (payload: any) => void) {
    if (!handler) {
      this.listeners.delete(event);
      return;
    }
    const set = this.listeners.get(event);
    if (!set) {
      return;
    }
    set.delete(handler);
    const onceWrapper = (handler as any).__mpOnce as Handler | undefined;
    if (onceWrapper) {
      set.delete(onceWrapper);
    }
    if (set.size === 0) {
      this.listeners.delete(event);
    }
  }

  emit<T = any>(event: string, payload?: T) {
    const set = this.listeners.get(event);
    if (!set || set.size === 0) {
      return;
    }
    // 快照迭代：允许 handler 内部 on/off
    for (const handler of [...set]) {
      handler(payload);
    }
  }

  /** 可订阅形态：退订即退订监听 */
  on$<T = any>(event: string) {
    return new Observable<T>((subscriber) => {
      const off = this.on<T>(event, (payload) => subscriber.next(payload));
      return off;
    });
  }

  has(event: string) {
    return (this.listeners.get(event)?.size ?? 0) > 0;
  }

  clear() {
    this.listeners.clear();
  }

  ngOnDestroy() {
    this.clear();
  }
}
