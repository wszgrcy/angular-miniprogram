/**
 * `normalizeCacheOptions` —— 本地实现，替代
 * `@angular-devkit/build-angular/src/utils/normalize-cache`。
 *
 * ## 为什么本地实现
 *
 * 这是迁到 Vite 之后，本仓库对 `@angular-devkit/build-angular` 的
 * **最后一处运行时依赖**（其余全是已本地化的 `AssetPattern` 类型导入）。
 * 只要它还从 build-angular 引，那一整串 webpack 生态就得留在 node_modules：
 * webpack / babel-loader / copy-webpack-plugin / css-loader / less-loader /
 * mini-css-extract-plugin / postcss-loader / sass-loader / source-map-loader /
 * webpack-dev-middleware / webpack-dev-server / @ngtools/webpack /
 * @angular-devkit/build-webpack …
 *
 * 而这个函数本身自包含（只用到 `node:path`），语义就是读 `angular.json`
 * 里的 `cli.cache` 配置，行为照抄 devkit 实现。
 *
 * 调用方只消费 `enabled` 与 `path` 两个字段
 * （见 `builder.ts`：`join(cacheDirectory, 'ng-packagr')`）。
 */
import { join, resolve } from 'node:path';

/**
 * 缓存子目录的版本段，作用与 devkit 的 VERSION 相同——
 * 让不同工具版本的缓存互不污染。这里跟随本包版本。
 */
const VERSION = '1.5.2';

export interface NormalizedCacheOptions {
  /** Whether disk cache is enabled. */
  enabled: boolean;
  /** Disk cache path. Example: `/.angular/cache/1.5.2`. */
  path: string;
  /** Disk cache base path. Example: `/.angular/cache`. */
  basePath: string;
}

function hasCacheMetadata(value: unknown): value is { cli: { cache: unknown } } {
  return (
    !!value &&
    typeof value === 'object' &&
    'cli' in value &&
    !!(value as { cli?: unknown }).cli &&
    typeof (value as { cli: unknown }).cli === 'object' &&
    'cache' in (value as { cli: object })
  );
}

export function normalizeCacheOptions(
  projectMetadata: unknown,
  workspaceRoot: string,
): NormalizedCacheOptions {
  const cacheMetadata = hasCacheMetadata(projectMetadata)
    ? (projectMetadata.cli.cache as Record<string, unknown>)
    : {};

  const {
    enabled = true,
    environment = 'local',
    path = '.angular/cache',
  } = cacheMetadata as {
    enabled?: boolean;
    environment?: 'all' | 'any' | 'ci' | 'local' | 'none';
    path?: string;
  };

  const isCI =
    process.env['CI'] === '1' ||
    process.env['CI']?.toLowerCase() === 'true';

  let cacheEnabled = enabled;
  if (cacheEnabled) {
    switch (environment) {
      case 'ci':
        cacheEnabled = isCI;
        break;
      case 'local':
        cacheEnabled = !isCI;
        break;
    }
  }

  const cacheBasePath = resolve(workspaceRoot, path);

  return {
    enabled: cacheEnabled,
    basePath: cacheBasePath,
    path: join(cacheBasePath, VERSION),
  };
}
