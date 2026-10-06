import type { InlineConfig } from 'vite';

/**
 * 钩子能用的日志口子。
 *
 * 只声明用到的三个方法，不引 `@angular-devkit/architect` 的类型：
 * 钩子文件是用户自己的文件，公开类型越少耦合越好。
 */
export interface MpViteConfigLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

/**
 * 第二个入参：告诉钩子「这次是给谁编、给哪个平台编」。
 *
 * 一个钩子文件常常要按平台或按 production 分支（条件编译、mock 开关），
 * 这些信息在 config 里看不出来（define 已经被展开成字符串了）。
 */
export interface MpViteConfigContext {
  /** 哪个 builder 在跑：`application` 是应用构建，`vitest` 是测试产物构建 */
  target: 'application' | 'vitest';
  /** 目标平台，取值同 angular.json 的 `platform` */
  platform: string;
  /** 是否 production（由 `optimization` 推出，与 vite 的 mode 同源） */
  isProduction: boolean;
  /** vite 的 mode，production / development */
  mode: string;
  /** 工作区根目录（绝对路径） */
  workspaceRoot: string;
  /** 本钩子文件的绝对路径 */
  configPath: string;
  logger: MpViteConfigLogger;
}

/**
 * 自定义 vite 配置钩子。
 *
 * 入参是构建器组装完的**最终** vite 配置，随便改；改坏了由钩子自己负责，
 * 构建器不校验、不回正。返回新对象或就地改都行（不返回就用原对象）。
 */
export type MpViteConfigHook = (
  config: InlineConfig,
  context: MpViteConfigContext,
) =>
  | InlineConfig
  | void
  | null
  | undefined
  | Promise<InlineConfig | void | null | undefined>;
