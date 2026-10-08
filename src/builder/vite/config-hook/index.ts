import * as fs from 'fs';
import { pathToFileURL } from 'url';
import type { InlineConfig } from 'vite';
import { resolveNative } from '../../util/path';
import type {
  MpViteConfigContext,
  MpViteConfigHook,
  MpViteConfigLogger,
} from './types';

export type {
  MpViteConfigContext,
  MpViteConfigHook,
  MpViteConfigLogger,
} from './types';

/**
 * 自定义 vite 配置的加载与应用。
 *
 * angular.json 是 JSON，装不下函数，所以「改 vite 配置」只能走文件：选项给路径，
 * 文件默认导出一个 `(config, ctx) => config` 的钩子。
 * 这里不做任何守卫：钩子里改坏了是钩子的事。本模块只负责「读得到、报错认得出是哪个文件」。
 */

/** 恒等函数，只为让钩子文件里能推断参数类型，不用手写 `satisfies`。 */
export function defineMpViteConfig(hook: MpViteConfigHook): MpViteConfigHook {
  return hook;
}

/** 需不需要 jiti：只有 TS 家族要，`.js` / `.mjs` / `.cjs` 走原生 import。 */
export function needsJiti(file: string): boolean {
  return /\.[cm]?tsx?$/.test(file);
}

/** 选项里的路径 → 绝对路径。绝对路径写法（含 devkit 的 `/C:/...`）也收。 */
export function resolveMpViteConfigPath(
  viteConfig: string,
  workspaceRoot: string,
): string {
  return resolveNative(workspaceRoot, viteConfig);
}

function typeName(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return '数组';
  }
  return typeof value;
}

function messageOf(error: unknown): string {
  return String(
    (error as Error)?.message ?? (error as Error)?.toString?.() ?? error,
  );
}

/**
 * 包一层错误并留住 cause。本仓库编译目标是 ES2015，用不了 `new Error(msg, { cause })`，
 * 所以手动挂；Node 打堆栈认这个属性。
 */
function wrapError(message: string, cause: unknown): Error {
  const error = new Error(message);
  (error as { cause?: unknown }).cause = cause;
  return error;
}

/**
 * 读文件模块本体。TS 走 jiti（`moduleCache: false`，watch 每轮都要重新求值）。
 * JS 走原生 `import()`，但必须带 `?t=` 破缓存，否则 watch 期间会一直拿到第一轮那份。
 */
async function importConfigModule(
  configPath: string,
  tsConfigPaths?: string,
): Promise<unknown> {
  if (!fs.existsSync(configPath)) {
    throw new Error(`自定义 vite 配置不存在：${configPath}`);
  }
  if (!needsJiti(configPath)) {
    return import(pathToFileURL(configPath).href + `?t=${Date.now()}`);
  }
  const { createJiti } = await import('jiti').catch((error: unknown) => {
    throw wrapError(
      `解析 .ts 自定义 vite 配置需要 jiti，但当前环境解析不到它：${configPath}\n` +
        '请确认 angular-miniprogram 的依赖已完整安装（node_modules/jiti）。' +
        `\n${messageOf(error)}`,
      error,
    );
  });
  const jiti = createJiti(configPath, {
    moduleCache: false,
    interopDefault: true,
    // 让钩子文件里也能用工程 tsconfig 的 paths 别名；没给就不碰 tsconfig
    ...(tsConfigPaths ? { tsconfigPaths: tsConfigPaths } : {}),
  });
  return jiti.import(configPath);
}

/**
 * 默认导出 → 钩子函数。三种写法都要认：ESM `export default fn`、
 * CJS `module.exports = fn`、以及原生 `import()` 引 CJS 文件时的 `{ default: fn }`。
 */
export function toViteConfigHook(
  loaded: unknown,
  configPath: string,
): MpViteConfigHook {
  const candidate =
    typeof loaded === 'function'
      ? loaded
      : (loaded as { default?: unknown } | null | undefined)?.default ?? loaded;
  if (typeof candidate !== 'function') {
    throw new Error(
      `自定义 vite 配置必须默认导出一个函数 (config, ctx) => config：${configPath}\n` +
        `实际导出的是 ${typeName(loaded)}。`,
    );
  }
  return candidate as MpViteConfigHook;
}

export interface ApplyMpViteConfigOptions {
  /** angular.json 里的 `viteConfig`，没配就不做任何事 */
  viteConfig?: string;
  target: MpViteConfigContext['target'];
  platform: string;
  isProduction: boolean;
  workspaceRoot: string;
  /** 传给 jiti 的 tsconfigPaths，相对 workspaceRoot 或绝对 */
  tsConfig?: string;
  logger: MpViteConfigLogger;
}

/**
 * 把组装好的 config 交给用户的钩子，返回最终要交给 vite 的配置。
 * 返回 `undefined` / `null` 视为就地改完了，用原对象；返回非对象直接报错。
 */
export async function applyMpViteConfig(
  config: InlineConfig,
  options: ApplyMpViteConfigOptions,
): Promise<InlineConfig> {
  if (!options.viteConfig) {
    return config;
  }
  const configPath = resolveMpViteConfigPath(
    options.viteConfig,
    options.workspaceRoot,
  );
  const tsConfigPaths = options.tsConfig
    ? resolveNative(options.workspaceRoot, options.tsConfig)
    : undefined;
  const hook = toViteConfigHook(
    await importConfigModule(configPath, tsConfigPaths),
    configPath,
  );
  const context: MpViteConfigContext = {
    target: options.target,
    platform: options.platform,
    isProduction: options.isProduction,
    mode: options.isProduction ? 'production' : 'development',
    workspaceRoot: options.workspaceRoot,
    configPath,
    logger: options.logger,
  };

  let result: InlineConfig | void | null | undefined;
  try {
    result = await hook(config, context);
  } catch (error) {
    throw wrapError(
      `自定义 vite 配置执行失败：${configPath}\n${messageOf(error)}`,
      error,
    );
  }
  if (result === undefined || result === null) {
    options.logger.info(`自定义 vite 配置已应用：${configPath}`);
    return config;
  }
  if (typeof result !== 'object' || Array.isArray(result)) {
    throw new Error(
      `自定义 vite 配置必须返回配置对象（或就地修改后不返回）：${configPath}\n` +
        `实际返回的是 ${typeName(result)}。`,
    );
  }
  options.logger.info(`自定义 vite 配置已应用：${configPath}`);
  return result;
}
