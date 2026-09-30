import { MpApiInterceptor } from './types';

type HookName = 'invoke' | 'success' | 'fail' | 'complete' | 'returnValue';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HookFn = (data: any, params?: any) => any;

const HOOK_NAMES: HookName[] = [
  'invoke',
  'success',
  'fail',
  'complete',
  'returnValue',
];

function isPromise(value: unknown): value is Promise<unknown> {
  return (
    !!value &&
    typeof (value as Promise<unknown>).then === 'function' &&
    typeof (value as Promise<unknown>).catch === 'function'
  );
}

/**
 * 钩子队列执行结果：
 * - blocked: 某个钩子返回 false，调用被阻断
 * - value:   同步归约后的数据
 * - promise: 队列中出现了异步钩子
 */
export interface HookQueueResult {
  blocked: boolean;
  value?: unknown;
  promise?: Promise<unknown>;
}

/**
 * 拦截器注册表。全局 + 按 API 名作用域两层，
 * 语义对齐 uni-app 的 globalInterceptors / scopedInterceptors。
 *
 * 不是 DI token：它随 `MpApiService`（root 单例）一起单例，
 * 避免为一个可变容器再拆一层 token。
 */
export class MpInterceptorRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private globalHooks = new Map<HookName, HookFn[]>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private scopedHooks = new Map<string, Map<HookName, HookFn[]>>();

  add(
    nameOrInterceptor: string | MpApiInterceptor,
    interceptor?: MpApiInterceptor,
  ): void {
    if (typeof nameOrInterceptor === 'string') {
      if (!interceptor) {
        return;
      }
      let map = this.scopedHooks.get(nameOrInterceptor);
      if (!map) {
        map = new Map();
        this.scopedHooks.set(nameOrInterceptor, map);
      }
      this.mergeInto(map, interceptor);
    } else {
      this.mergeInto(this.globalHooks, nameOrInterceptor);
    }
  }

  remove(
    nameOrInterceptor: string | MpApiInterceptor,
    interceptor?: MpApiInterceptor,
  ): void {
    if (typeof nameOrInterceptor === 'string') {
      if (!interceptor) {
        this.scopedHooks.delete(nameOrInterceptor);
        return;
      }
      const map = this.scopedHooks.get(nameOrInterceptor);
      if (map) {
        this.removeFrom(map, interceptor);
        if (map.size === 0) {
          this.scopedHooks.delete(nameOrInterceptor);
        }
      }
      return;
    }
    this.removeFrom(this.globalHooks, nameOrInterceptor);
  }

  /** 全局 + 作用域合并后的某个钩子列表（顺序：全局在前） */
  hooks(apiName: string, hook: HookName): HookFn[] {
    const list = [...(this.globalHooks.get(hook) ?? [])];
    const scoped = this.scopedHooks.get(apiName)?.get(hook);
    if (scoped) {
      list.push(...scoped);
    }
    return list;
  }

  hasAny(apiName: string): boolean {
    return HOOK_NAMES.some((hook) => this.hooks(apiName, hook).length > 0);
  }

  /** returnValue 钩子：改写 API 的同步返回值（task 等） */
  applyReturnValue(apiName: string, returnValue: unknown): unknown {
    for (const hook of this.hooks(apiName, 'returnValue')) {
      const result = hook(returnValue);
      if (result !== undefined && result !== false) {
        returnValue = result;
      }
    }
    return returnValue;
  }

  private mergeInto(
    target: Map<HookName, HookFn[]>,
    interceptor: MpApiInterceptor,
  ): void {
    for (const hook of HOOK_NAMES) {
      const fn = interceptor[hook];
      if (typeof fn === 'function') {
        const list = target.get(hook) ?? [];
        if (!list.includes(fn as HookFn)) {
          list.push(fn as HookFn);
        }
        target.set(hook, list);
      }
    }
  }

  private removeFrom(
    target: Map<HookName, HookFn[]>,
    interceptor: MpApiInterceptor,
  ): void {
    for (const hook of HOOK_NAMES) {
      const fn = interceptor[hook];
      const list = target.get(hook);
      if (typeof fn === 'function' && list) {
        const idx = list.indexOf(fn as HookFn);
        if (idx !== -1) {
          list.splice(idx, 1);
        }
      }
    }
  }
}

/**
 * 同步优先的钩子队列（对齐 uni 的 queue）：
 * - 任一钩子同步返回 false → 阻断
 * - 出现 Promise → 后续钩子串入 Promise 链；链上 resolve(false) 同样阻断
 * - 钩子返回 undefined 视为不改写，透传原数据
 */
export function runHookQueue(
  hooks: HookFn[],
  data: unknown,
  params?: unknown,
): HookQueueResult {
  let promise: Promise<unknown> | undefined;
  for (const hook of hooks) {
    if (promise) {
      promise = promise.then((current) => {
        const result = hook(current, params);
        if (result === false) {
          return false;
        }
        return result === undefined ? current : result;
      });
    } else {
      const result = hook(data, params);
      if (result === false) {
        return { blocked: true };
      }
      if (isPromise(result)) {
        promise = result;
      } else if (result !== undefined) {
        data = result;
      }
    }
  }
  return promise ? { blocked: false, promise } : { blocked: false, value: data };
}
