/* eslint-disable no-console */
import fs from 'fs-extra';
import * as path from 'path';
import {
  LIBRARY_META_FILE_NAME,
  LIBRARY_META_GENERATOR,
  LIBRARY_META_SCHEMA_VERSION,
  LibraryComponentMetaRecord,
  LibraryDirectiveMetaRecord,
  LibraryMetaEntry,
  LibraryMetaFile,
  normalizeMetaKey,
} from './library-meta-schema';

/**
 * 库构建期的元数据暂存区（**写侧**）。
 *
 * 生命周期：`compileSourceFiles` 每写完一个中间 `.d.ts` 就把这个文件里的
 * 指令/组件登记进来；每个 entry 编译完再落一次盘。落盘是**全量重写**，
 * 天然幂等，watch 模式下反复触发也不会累加。
 *
 * 注意：这里刻意只存结构化数据，不存文本。旧方案存拼好的 `declare const`
 * 文本，导致「存储格式」和「载体格式」绑死，换载体就得重写一遍。
 */

interface MutableEntryRecord {
  moduleId: string;
  typings?: string;
  directives: Map<string, LibraryDirectiveMetaRecord>;
  components: Map<string, LibraryComponentMetaRecord>;
}

const store = new Map<string, MutableEntryRecord>();

function ensureEntry(moduleId: string): MutableEntryRecord {
  let entry = store.get(moduleId);
  if (!entry) {
    entry = {
      moduleId,
      directives: new Map(),
      components: new Map(),
    };
    store.set(moduleId, entry);
  }
  return entry;
}

/**
 * 登记 entry 的扁平化 d.ts 路径（读取侧主键）。
 *
 * 由 `compile-ngc.transform` 调用 —— 那里能直接从 ng-packagr 的
 * `destinationFiles.declarationsBundled` 拿到最终扁平 d.ts 的绝对路径，
 * 不需要事后扫 `package.json#exports` 反推。
 */
export function registerLibraryMetaEntry(
  moduleId: string,
  typingsAbsPath: string,
  distRoot: string,
): void {
  const entry = ensureEntry(moduleId);
  entry.typings = normalizeMetaKey(
    path.relative(distRoot, typingsAbsPath).split(path.sep).join('/'),
  );
}

/**
 * 同 key 重复登记且内容不一致时告警。
 *
 * 旧方案靠「把标记写进所有 d.ts」蒙混，同名冲突会静默拿错。
 * 这里至少让它响一次。
 */
function conflictCheck(
  kind: 'directive' | 'component',
  moduleId: string,
  className: string,
  prev: unknown,
  next: unknown,
): void {
  if (prev === undefined) {
    return;
  }
  if (JSON.stringify(prev) === JSON.stringify(next)) {
    return;
  }
  console.warn(
    `[library-meta] ${moduleId} 内类名冲突：${kind} "${className}" 被登记了两次且内容不同，` +
      `后者生效。前者=${JSON.stringify(prev)} 后者=${JSON.stringify(next)}`,
  );
}

export function recordLibraryDirectiveMeta(
  moduleId: string,
  className: string,
  record: LibraryDirectiveMetaRecord,
): void {
  const entry = ensureEntry(moduleId);
  conflictCheck(
    'directive',
    moduleId,
    className,
    entry.directives.get(className),
    record,
  );
  entry.directives.set(className, record);
}

export function recordLibraryComponentMeta(
  moduleId: string,
  className: string,
  record: LibraryComponentMetaRecord,
): void {
  const entry = ensureEntry(moduleId);
  conflictCheck(
    'component',
    moduleId,
    className,
    entry.components.get(className),
    record,
  );
  entry.components.set(className, record);
}

/** 仅供测试：查看当前暂存内容。 */
export function peekLibraryMetaStore(): ReadonlyMap<
  string,
  MutableEntryRecord
> {
  return store;
}

/** 仅供测试：清空暂存。 */
export function clearLibraryMetaStore(): void {
  store.clear();
}

/** 把暂存区序列化成 sidecar 结构。 */
export function buildLibraryMetaFile(libVersion?: string): LibraryMetaFile {
  const entries: Record<string, LibraryMetaEntry> = {};
  for (const [moduleId, record] of store) {
    if (!record.typings) {
      // 没登记 typings 就没法被读取侧命中，跳过并说明原因，
      // 不要静默产出一个查不到的条目
      console.warn(
        `[library-meta] entry "${moduleId}" 未登记 typings 路径，跳过写入 sidecar`,
      );
      continue;
    }
    const directives: Record<string, LibraryDirectiveMetaRecord> = {};
    for (const [name, meta] of record.directives) {
      directives[name] = meta;
    }
    const components: Record<string, LibraryComponentMetaRecord> = {};
    for (const [name, meta] of record.components) {
      components[name] = meta;
    }
    entries[record.typings] = {
      moduleId,
      typings: record.typings,
      directives,
      components,
    };
  }
  return {
    schemaVersion: LIBRARY_META_SCHEMA_VERSION,
    generator: LIBRARY_META_GENERATOR,
    libVersion,
    entries,
  };
}

function readLibVersion(distRoot: string): string | undefined {
  try {
    const pkg = fs.readJsonSync(path.join(distRoot, 'package.json'));
    return typeof pkg.version === 'string' ? pkg.version : undefined;
  } catch {
    return undefined;
  }
}

/**
 * 把暂存区全量写到 `<distRoot>/mp-library-meta.json`。
 *
 * 返回 `undefined` 表示当前没有任何可写元数据（例如本次编译没有指令）。
 */
export function writeLibraryMetaFile(
  distRoot: string,
): { filePath: string; entryCount: number } | undefined {
  if (store.size === 0) {
    return undefined;
  }
  const file = buildLibraryMetaFile(readLibVersion(distRoot));
  const keys = Object.keys(file.entries);
  if (keys.length === 0) {
    return undefined;
  }
  const filePath = path.join(distRoot, LIBRARY_META_FILE_NAME);
  // 第一个 entry 编译完时 dist 可能还没被创建（ng-packagr 的 deleteDestPath
  // 会先删掉它，而目录创建本来是靠 TS 写文件时顺带做的），这里自己兼容。
  fs.ensureDirSync(distRoot);
  fs.writeFileSync(filePath, JSON.stringify(file, null, 2) + '\n', 'utf8');
  return { filePath, entryCount: keys.length };
}
