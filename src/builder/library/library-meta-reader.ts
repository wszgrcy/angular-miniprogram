/* eslint-disable no-console */
import fs from 'fs-extra';
import * as path from 'path';
import {
  LIBRARY_META_FILE_NAME,
  LIBRARY_META_SCHEMA_VERSION,
  LibraryComponentMetaRecord,
  LibraryDirectiveMetaRecord,
  LibraryMetaEntry,
  LibraryMetaFile,
  isLibraryMetaFile,
  normalizeMetaKey,
} from './library-meta-schema';

/**
 * 应用构建侧读取库元数据 sidecar。
 *
 * 定位链路（全部基于「TS 实际解析到的文件路径」，不依赖任何配置约定）：
 *
 *   classDeclaration.getSourceFile().fileName
 *     → 向上找最近的 package.json（带 name 的，即真正的包边界）
 *     → 同目录下的 mp-library-meta.json
 *     → entries[ relative(包根, d.ts) ]
 *     → directives[类名] / components[类名]
 *
 * 这条链路对以下场景都成立，不需要额外适配：
 *   - node_modules 正常安装
 *   - pnpm 的 `.pnpm/<pkg>/node_modules/<pkg>` 布局（包边界仍是它自己）
 *   - `npm link` / symlink（TS 默认 resolve 到 realpath，包根跟着 realpath 走）
 *   - tsconfig `paths` 把 `angular-miniprogram/forms` 指到 `../../dist/forms`
 *     （解析到的 d.ts 在 `dist/types/`，最近 package.json 就是 `dist/package.json`）
 */

/** 命中结果。`record` 存在即代表拿到了元数据。 */
export interface LibraryMetaLookup {
  /** 命中的包根目录（未命中为 undefined） */
  pkgRoot?: string;
  /** 命中的 sidecar 文件路径 */
  sidecarPath?: string;
  /** 命中的 entry */
  entry?: LibraryMetaEntry;
  /** 命中的记录类型 */
  kind?: 'component' | 'directive';
  record?: LibraryDirectiveMetaRecord | LibraryComponentMetaRecord;
  /** sidecar 里这个 entry 完全没有这个类（可能是 stale 或非本工具链产物） */
  entryMatchedButClassMissing?: boolean;
}

const NOT_FOUND: LibraryMetaLookup = {};

interface SidecarCacheEntry {
  mtimeMs: number;
  file: LibraryMetaFile | null;
}
const sidecarCache = new Map<string, SidecarCacheEntry>();
const packageRootCache = new Map<string, string | undefined>();

/**
 * 从某个文件向上找它所属的**包根**。
 *
 * 判定标准：目录里有 `package.json` 且带非空 `name`。
 * 找到就停 —— 哪怕它没有 sidecar 也不再往上走，
 * 否则会误命中上层无关包（比如应用自己的 dist）的元数据。
 */
export function findLibraryPackageRoot(fromFile: string): string | undefined {
  const cached = packageRootCache.get(fromFile);
  if (cached !== undefined || packageRootCache.has(fromFile)) {
    return cached;
  }
  let dir = path.dirname(path.resolve(fromFile));
  let result: string | undefined;
  // 逐层向上，到文件系统根为止
  for (;;) {
    const pkgJson = path.join(dir, 'package.json');
    if (fs.existsSync(pkgJson) && fs.statSync(pkgJson).isFile()) {
      try {
        const parsed = fs.readJsonSync(pkgJson);
        if (parsed && typeof parsed.name === 'string' && parsed.name.length) {
          result = dir;
          break;
        }
      } catch {
        // package.json 读不动就继续往上，别崩
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  packageRootCache.set(fromFile, result);
  return result;
}

/** 读并缓存 sidecar。文件没变就不重复 parse。 */
export function readLibraryMetaFile(
  pkgRoot: string,
): LibraryMetaFile | undefined {
  const filePath = path.join(pkgRoot, LIBRARY_META_FILE_NAME);
  if (!fs.existsSync(filePath)) {
    return undefined;
  }
  const mtimeMs = fs.statSync(filePath).mtimeMs;
  const cached = sidecarCache.get(filePath);
  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.file ?? undefined;
  }
  let file: LibraryMetaFile | null = null;
  try {
    const parsed: unknown = fs.readJsonSync(filePath);
    if (!isLibraryMetaFile(parsed)) {
      console.warn(`[library-meta] ${filePath} 不是合法的库元数据文件，忽略`);
    } else if (parsed.schemaVersion !== LIBRARY_META_SCHEMA_VERSION) {
      console.warn(
        `[library-meta] ${filePath} schema 版本不匹配：产物为 v${parsed.schemaVersion}，` +
          `当前构建器只认 v${LIBRARY_META_SCHEMA_VERSION}，忽略。请重新构建该库。`,
      );
    } else {
      file = parsed;
    }
  } catch (err) {
    console.warn(
      `[library-meta] 读取 ${filePath} 失败：${
        (err as Error)?.message ?? String(err)
      }`,
    );
  }
  sidecarCache.set(filePath, { mtimeMs, file });
  return file ?? undefined;
}

/**
 * 在 entry 的 `directives` / `components` 里按类名查记录。
 *
 * 先精确匹配；不中再做一次大小写无关匹配（Windows 盘符 / 大小写不敏感
 * 文件系统的兜底），只在精确匹配失败时才走，不影响正常路径性能。
 */
function pickFromMap<T>(
  map: Record<string, T> | undefined,
  key: string,
): T | undefined {
  if (!map) {
    return undefined;
  }
  if (Object.prototype.hasOwnProperty.call(map, key)) {
    return map[key];
  }
  const lower = key.toLowerCase();
  for (const k of Object.keys(map)) {
    if (k.toLowerCase() === lower) {
      return map[k];
    }
  }
  return undefined;
}

/**
 * 按「类的 d.ts 路径 + 类名」查库元数据。
 *
 * 返回空对象表示彻底没查到，调用方自行决定降级策略。
 */
export function lookupLibraryMeta(
  sourceFilePath: string,
  className: string,
): LibraryMetaLookup {
  if (!sourceFilePath || !className) {
    return NOT_FOUND;
  }
  const pkgRoot = findLibraryPackageRoot(sourceFilePath);
  if (!pkgRoot) {
    return NOT_FOUND;
  }
  const file = readLibraryMetaFile(pkgRoot);
  if (!file) {
    return { pkgRoot };
  }
  const sidecarPath = path.join(pkgRoot, LIBRARY_META_FILE_NAME);
  const relKey = normalizeMetaKey(
    path.relative(pkgRoot, path.resolve(sourceFilePath)),
  );

  let entry: LibraryMetaEntry | undefined = file.entries[relKey];
  if (!entry) {
    // 大小写无关兜底
    const lower = relKey.toLowerCase();
    const hit = Object.keys(file.entries).find(
      (k) => normalizeMetaKey(k).toLowerCase() === lower,
    );
    entry = hit ? file.entries[hit] : undefined;
  }
  if (!entry) {
    return { pkgRoot, sidecarPath };
  }

  const component = pickFromMap<LibraryComponentMetaRecord>(
    entry.components,
    className,
  );
  if (component) {
    return {
      pkgRoot,
      sidecarPath,
      entry,
      kind: 'component',
      record: component,
    };
  }
  const directive = pickFromMap<LibraryDirectiveMetaRecord>(
    entry.directives,
    className,
  );
  if (directive) {
    return {
      pkgRoot,
      sidecarPath,
      entry,
      kind: 'directive',
      record: directive,
    };
  }
  return { pkgRoot, sidecarPath, entry, entryMatchedButClassMissing: true };
}

/** 仅供测试：清掉读取缓存。 */
export function clearLibraryMetaReaderCache(): void {
  sidecarCache.clear();
  packageRootCache.clear();
}
