import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';

export interface TsPathAlias {
  find: string;
  replacement: string;
}

/**
 * 把 tsconfig 的 `baseUrl` + `paths` 翻译成 Vite 的 resolve.alias。
 *
 * webpack 那边由 @ngtools/webpack 直接吃 tsconfig paths，Vite/Rolldown 不读
 * tsconfig，所以必须自己转一遍，否则 `angular-miniprogram` 这类映射解析不到。
 *
 * 会沿 `extends` 链往上收集，子配置的 paths 覆盖父配置的。
 */
export function tsConfigPathsToAliases(
  tsconfigPath: string,
  visited = new Set<string>()
): TsPathAlias[] {
  const resolved = path.resolve(tsconfigPath);
  if (visited.has(resolved) || !fs.existsSync(resolved)) {
    return [];
  }
  visited.add(resolved);

  const parsed = ts.readConfigFile(resolved, ts.sys.readFile);
  const config = parsed?.config ?? {};
  const ownDir = path.dirname(resolved);

  // 先处理父配置
  const parentAliases: TsPathAlias[] = [];
  const extendsValue = config.extends;
  const extendsList = Array.isArray(extendsValue)
    ? extendsValue
    : extendsValue
      ? [extendsValue]
      : [];
  for (const ext of extendsList) {
    if (typeof ext !== 'string') {
      continue;
    }
    const parentPath = path.resolve(ownDir, ext);
    parentAliases.push(...tsConfigPathsToAliases(parentPath, visited));
  }

  const options = config.compilerOptions || {};
  const baseUrl: string = options.baseUrl
    ? path.resolve(ownDir, options.baseUrl)
    : ownDir;
  const pathsMap: Record<string, string[]> = options.paths || {};

  const ownAliases: TsPathAlias[] = [];
  for (const [key, targets] of Object.entries(pathsMap)) {
    if (!targets?.length) {
      continue;
    }
    ownAliases.push({
      find: key,
      replacement: path.resolve(baseUrl, targets[0]),
    });
  }

  // 父配置在前，子配置在后覆盖
  const merged = new Map<string, string>();
  for (const alias of [...parentAliases, ...ownAliases]) {
    merged.set(alias.find, alias.replacement);
  }

  // Vite 的 alias 对字符串 find 走「精确 或 startsWith(find + '/')」，
  // 所以长的必须排在前面，否则 `angular-miniprogram` 会把
  // `angular-miniprogram/platform/wx` 一起抢走。
  return Array.from(merged.entries())
    .map(([find, replacement]) => ({ find, replacement }))
    .sort((a, b) => b.find.length - a.find.length);
}
