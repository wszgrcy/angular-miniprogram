/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, OperatorFunction, throwError } from 'rxjs';
import { MpApiNameInput, MpCallbackOptions } from './types';

/**
 * 动态数组应用管道（rxjs pipe 只有 0..9 固定重载，不支持 spread 数组）。
 */
export function pipeThrough(
  source: Observable<any>,
  ops: OperatorFunction<any, any>[],
) {
  return ops.reduce((stream, op) => stream.pipe(op), source);
}

/** 流经 pre 管道的调用上下文 */
export interface MpInvokeContext {
  name: MpApiNameInput;
  options: MpCallbackOptions;
}

/**
 * rxjs 管道注册单元。
 *
 * - `pre`：调用发生前，作用于 `MpInvokeContext`——改写参数、阻断
 * - `post`：调用发生后，作用于结果——改写结果、埋点、catchError
 *
 * 阻断用 `blockWith(reason)`（落定为 MpBlockedError），
 * 不要用裸 `filter`（会空 complete → EmptyError）。
 */
export interface MpPipeSet {
  pre?: OperatorFunction<MpInvokeContext, MpInvokeContext>[];
  post?: OperatorFunction<any, any>[];
}

/** 被 pre 管道阻断 */
export class MpBlockedError extends Error {
  constructor(public apiName: string) {
    super(`API 被管道阻断: ${apiName}`);
    this.name = 'MpBlockedError';
  }
}

export function isMpBlockedError(e: any): e is MpBlockedError {
  return e?.name === 'MpBlockedError';
}

/** 阻断操作符：pre 管道中返回它即中止调用 */
export function blockWith(
  reason?: any,
): OperatorFunction<MpInvokeContext, never> {
  return () =>
    throwError(() =>
      reason instanceof Error
        ? reason
        : new MpBlockedError(String(reason ?? 'blocked')),
    );
}

/** AbortSignal -> 标准 AbortError */
export function toAbortError(signal?: AbortSignal) {
  const reason = (signal as any)?.reason;
  if (reason instanceof Error) {
    return reason;
  }
  const err = new Error(reason ? String(reason) : 'operation aborted');
  err.name = 'AbortError';
  return err;
}

export function isAbortError(e: any) {
  return e?.name === 'AbortError';
}

/**
 * 管道贡献单元：一个 DI 贡献可同时提供全局与按名作用域管道。
 */
export interface MpPipeContribution {
  global?: MpPipeSet;
  scoped?: Record<MpApiNameInput, MpPipeSet>;
}

/**
 * 多 provider token，声明式注册管道（同 HTTP_INTERCEPTORS 用法）。
 *
 * ```ts
 * providers: [
 *   { provide: MP_API_PIPES, multi: true, useValue: {
 *       global: { post: [tap((r) => track(r))] },
 *       scoped: { navigateTo: { pre: [loginGuard] } },
 *   } },
 * ]
 * ```
 */
export const MP_API_PIPES = new InjectionToken<MpPipeContribution>(
  'MP_API_PIPES',
);

/**
 * `setPipe` / `setGlobalPipes` 返回的句柄：`dispose()` 即撤销本次注册。
 * 幂等，重复调用无副作用。
 */
export interface MpPipeHandle {
  dispose(): void;
}

interface MpPipeRegistration {
  /** `null` 表示全局 */
  name: MpApiNameInput | null;
  pre: OperatorFunction<MpInvokeContext, MpInvokeContext>[];
  post: OperatorFunction<any, any>[];
  /** DI 贡献的注册不受 `clearGlobalPipes()` 影响 */
  fromDi?: boolean;
}

/**
 * 管道注册表（root 单例）：全局 + 按 API 名作用域两层。
 *
 * 每次 set 是一条独立记录，返回句柄可单独 `dispose()`。
 */
@Injectable({ providedIn: 'root' })
export class MpPipeRegistry {
  private registrations: MpPipeRegistration[] = [];
  /** 内置管道：永远最先执行，不受 `clearGlobalPipes()` 影响 */
  private core: MpPipeRegistration[] = [];

  constructor() {
    // multi provider：运行时为数组，Angular 类型不反映 multi，此处显式收敛
    const raw = inject(MP_API_PIPES, { optional: true });
    const contributions: MpPipeContribution[] = Array.isArray(raw)
      ? (raw as MpPipeContribution[])
      : raw
        ? [raw as MpPipeContribution]
        : [];
    for (const c of contributions) {
      if (c.global) {
        this.register(null, c.global, true);
      }
      if (c.scoped) {
        for (const [name, set] of Object.entries(c.scoped)) {
          this.register(name, set, true);
        }
      }
    }
  }

  /** 全局管道（对所有 API 生效） */
  setGlobalPipes(set: MpPipeSet) {
    return this.register(null, set);
  }

  /** 清除运行时注册的全局管道（不动 DI 贡献） */
  clearGlobalPipes() {
    this.registrations = this.registrations.filter(
      (r) => r.name !== null || r.fromDi,
    );
  }

  /** 按 API 名作用域管道 */
  setPipes(name: MpApiNameInput, set: MpPipeSet) {
    return this.register(name, set);
  }

  /** 移除该 API 名下的所有作用域管道 */
  removePipes(name: MpApiNameInput) {
    this.registrations = this.registrations.filter((r) => r.name !== name);
  }

  /** DI / 运行时全局在前，作用域在后，各自保持注册顺序 */
  prePipes(name: MpApiNameInput) {
    return this.collect(name, 'pre');
  }

  postPipes(name: MpApiNameInput) {
    return this.collect(name, 'post');
  }

  private collect(name: MpApiNameInput, key: 'pre' | 'post') {
    const hits = this.registrations.filter(
      (r) => r.name === null || r.name === name,
    );
    return [
      ...this.core,
      ...hits.filter((r) => r.name === null),
      ...hits.filter((r) => r.name !== null),
    ].flatMap((r) => r[key]);
  }

  /** 注册内置管道，返回的句柄同样可 `dispose()` */
  setCorePipes(set: MpPipeSet) {
    const reg: MpPipeRegistration = {
      name: null,
      pre: [...(set.pre ?? [])],
      post: [...(set.post ?? [])],
    };
    this.core.push(reg);
    return {
      dispose: () => {
        const index = this.core.indexOf(reg);
        if (index !== -1) {
          this.core.splice(index, 1);
        }
      },
    };
  }

  private register(
    name: MpApiNameInput | null,
    set: MpPipeSet,
    fromDi = false,
  ): MpPipeHandle {
    const reg: MpPipeRegistration = {
      name,
      pre: [...(set.pre ?? [])],
      post: [...(set.post ?? [])],
      fromDi,
    };
    this.registrations.push(reg);
    return {
      dispose: () => {
        const index = this.registrations.indexOf(reg);
        if (index !== -1) {
          this.registrations.splice(index, 1);
        }
      },
    };
  }
}
