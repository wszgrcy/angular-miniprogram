/**
 * `abortcontroller-polyfill/dist/abortcontroller` 的最小类型声明。该包完全没有 TypeScript 声明，
 * 直接 import 会 TS7016，这里按实际 API 补一份最小可用的声明，通过 tsconfig.builder.json 的 `paths` 指过来。
 *
 * 写成「纯模块形状」而非 `declare module '...'` 包裹：它是被 `paths` 当作模块解析目标拉进来的。
 * 注意这是 ponyfill：只 exports，不给 `self` / `global` 赋值。挂载由 `polyfill-entry.ts` 手动完成。
 */
export interface AbortSignalLike {
  readonly aborted: boolean;
  readonly reason?: unknown;
  onabort: ((this: AbortSignalLike, ev: unknown) => unknown) | null;
  addEventListener(
    type: string,
    listener: (ev: unknown) => unknown,
    options?: unknown,
  ): void;
  removeEventListener(
    type: string,
    listener: (ev: unknown) => unknown,
    options?: unknown,
  ): void;
  dispatchEvent(event: unknown): boolean;
  throwIfAborted(): void;
}

export class AbortSignal implements AbortSignalLike {
  constructor();
  readonly aborted: boolean;
  readonly reason?: unknown;
  onabort: ((this: AbortSignal, ev: unknown) => unknown) | null;
  addEventListener(
    type: string,
    listener: (ev: unknown) => unknown,
    options?: unknown,
  ): void;
  removeEventListener(
    type: string,
    listener: (ev: unknown) => unknown,
    options?: unknown,
  ): void;
  dispatchEvent(event: unknown): boolean;
  throwIfAborted(): void;
}

export class AbortController {
  constructor();
  readonly signal: AbortSignal;
  abort(reason?: unknown): void;
}

export default AbortController;
