/* eslint-disable no-console */
import fs from 'fs-extra';
import * as path from 'path';
import {
  LIBRARY_META_FILE_NAME,
  LIBRARY_META_GENERATOR,
  LIBRARY_META_SCHEMA_VERSION,
  LibraryComponentMetaRecord,
  LibraryDirectiveMetaRecord,
  LibraryGlobalTemplateRecord,
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
  fesm?: string;
  directives: Map<string, LibraryDirectiveMetaRecord>;
  components: Map<string, LibraryComponentMetaRecord>;
  selfTemplate?: LibraryGlobalTemplateRecord;
  scopeTemplates: Map<string, LibraryGlobalTemplateRecord>;
}

const store = new Map<string, MutableEntryRecord>();

function ensureEntry(moduleId: string): MutableEntryRecord {
  let entry = store.get(moduleId);
  if (!entry) {
    entry = {
      moduleId,
      directives: new Map(),
      components: new Map(),
      scopeTemplates: new Map(),
    };
    store.set(moduleId, entry);
  }
  return entry;
}

/**
 * 登记 entry 的产物路径（读取侧主键 + 模块 id 到实际文件的映射）。
 *
 * 由 `compile-ngc.transform` 调用 —— 那里能直接从 ng-packagr 的
 * `destinationFiles.declarationsBundled` / `.fesm2022` 拿到绝对路径，
 * 不需要事后扫 `package.json#exports` 反推。
 */
export function registerLibraryMetaEntry(
  moduleId: string,
  typingsAbsPath: string,
  distRoot: string,
  fesmAbsPath?: string,
): void {
  const entry = ensureEntry(moduleId);
  entry.typings = toRelativePosix(typingsAbsPath, distRoot);
  if (fesmAbsPath) {
    entry.fesm = toRelativePosix(fesmAbsPath, distRoot);
  }
}

function toRelativePosix(absPath: string, root: string): string {
  return normalizeMetaKey(
    path.relative(root, absPath).split(path.sep).join('/'),
  );
}

/**
 * 同 key 重复登记且**重叠字段**不一致时告警。
 *
 * 旧方案靠「把标记写进所有 d.ts」蒙混，同名冲突会静默拿错。
 * 这里至少让它响一次。
 *
 * 只比 `next` 里实际带的字段：组件记录现在是「多个地方分次合并」
 * （host 绑定一路、模板载荷一路），整体比会假报警。
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
  const prevObj = (prev ?? {}) as Record<string, unknown>;
  const nextObj = (next ?? {}) as Record<string, unknown>;
  const conflicting = Object.keys(nextObj).filter(
    (k) =>
      prevObj[k] !== undefined &&
      JSON.stringify(prevObj[k]) !== JSON.stringify(nextObj[k]),
  );
  if (!conflicting.length) {
    return;
  }
  console.warn(
    `[library-meta] ${moduleId} 内类名冲突：${kind} "${className}" 的 ${conflicting.join(
      ', ',
    )} 被登记了两次且内容不同，后者生效。`,
  );
}

/**
 * 登记 / 合并指令的 host 元数据。
 *
 * 合并而非覆盖：同一个类可能分多次登记不同字段。
 */
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
  entry.directives.set(className, {
    ...entry.directives.get(className),
    ...record,
  });
}

/**
 * 登记 / 合并组件元数据。
 *
 * 合并语义很关键：host 绑定（listeners / properties / outputPath）由
 * `AddDeclarationMetaDataService` 扫 d.ts 登记，模板载荷（content / style /
 * useComponents）由 `SetupComponentDataService` 登记，两路写入同一个记录，
 * 谁先到都不能抹掉对方。
 */
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
  entry.components.set(className, {
    ...entry.components.get(className),
    ...record,
  });
}

/**
 * 只补局部字段，不动其他字段。
 *
 * 组件记录是两路写入的：
 *   - `AddDeclarationMetaDataService` 扫 d.ts → listeners / properties / outputPath
 *   - `SetupComponentDataService` 扫 JS 产物 → content / style / useComponents / id
 *
 * 两路顺序不确定，所以各自只写自己那几个字段，谁都不能抹掉对方。
 * `undefined` 的键直接跳过，避免「显式传 undefined」把已有值盖掉。
 */
export function patchLibraryComponentMeta(
  moduleId: string,
  className: string,
  patch: Partial<LibraryComponentMetaRecord>,
): void {
  const entry = ensureEntry(moduleId);
  const prev = entry.components.get(className);
  const next: Partial<LibraryComponentMetaRecord> = { ...prev };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) {
      continue;
    }
    (next as unknown as Record<string, unknown>)[key] = value;
  }
  conflictCheck('component', moduleId, className, prev, patch);
  entry.components.set(className, next as LibraryComponentMetaRecord);
}

/** 登记本 entry 的自引用模板（原 `$self_Global_Template`）。 */
export function setLibrarySelfTemplate(
  moduleId: string,
  record: LibraryGlobalTemplateRecord,
): void {
  ensureEntry(moduleId).selfTemplate = record;
}

/** 登记一个跨组件共享模板（原 `library_Global_Template` 的一项）。 */
export function setLibraryScopeTemplate(
  moduleId: string,
  scopeKey: string,
  record: LibraryGlobalTemplateRecord,
): void {
  ensureEntry(moduleId).scopeTemplates.set(scopeKey, record);
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
      if (!meta.outputPath) {
        // outputPath 由扫 d.ts 那一路登记。缺了意味着那个组件只被
        // SetupComponentDataService 碰过、没被 d.ts 扫描命中，产出的记录
        // 不完整，主构建会把组件放到空路径上。大声说，别静默。
        console.warn(
          `[library-meta] ${moduleId} 的组件 "${name}" 没有 outputPath（d.ts 扫描未登记），请检查库构建。`,
        );
      }
      // 兼容只登了部分字段的记录（patch 那一路可能先跑）：listeners /
      // properties 兼个默认空数组，落盘文件里缺字段很容易被误用。
      components[name] = {
        ...meta,
        listeners: meta.listeners ?? [],
        properties: meta.properties ?? [],
      };
    }
    const scopeTemplates: Record<string, LibraryGlobalTemplateRecord> = {};
    for (const [name, meta] of record.scopeTemplates) {
      scopeTemplates[name] = meta;
    }
    entries[record.typings] = {
      moduleId,
      typings: record.typings,
      ...(record.fesm ? { fesm: record.fesm } : {}),
      directives,
      components,
      ...(record.selfTemplate ? { selfTemplate: record.selfTemplate } : {}),
      ...(Object.keys(scopeTemplates).length ? { scopeTemplates } : {}),
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
