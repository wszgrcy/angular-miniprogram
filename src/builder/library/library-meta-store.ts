/* eslint-disable no-console */
import fs from 'fs-extra';
import * as path from 'path';
import { relativePosix } from '../util/path';
import {
  LIBRARY_META_FILE_NAME,
  LIBRARY_META_GENERATOR,
  LIBRARY_META_SCHEMA_VERSION,
  LibraryComponentMetaRecord,
  LibraryDirectiveMetaRecord,
  LibraryGlobalTemplateRecord,
  LibraryMetaEntry,
  LibraryMetaFile,
  assertLibraryMetaFileShape,
  normalizeMetaKey,
} from './library-meta-schema';

/**
 * 库构建期的元数据暂存区（写侧）。
 * 生命周期：每写完一个中间 `.d.ts` 就把这个文件里的指令/组件登记进来；每个 entry
 * 编译完再落一次盘。落盘是全量重写，天然幂等。
 * 这里只存结构化数据，不存文本，避免存储格式和载体格式绑死。
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
 * 由 `compile-ngc.transform` 调用，那里能直接拿到绝对路径。
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
  return normalizeMetaKey(relativePosix(root, absPath));
}

/**
 * 同 key 重复登记且重叠字段不一致时告警。只比 `next` 里实际带的字段：
 * 组件记录是多个地方分次合并的，整体比会假报警。
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

/** 登记 / 合并指令的 host 元数据。合并而非覆盖：同一个类可能分多次登记不同字段。 */
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
 * 登记 / 合并组件元数据。合并语义很关键：host 绑定与模板载荷由两路写入同一个记录，
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
 * 只补局部字段，不动其他字段。组件记录由两路写入（host 绑定 / 模板载荷），
 * 顺序不确定，各自只写自己那几个字段。`undefined` 的键直接跳过。
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

/** 登记本 entry 的自引用模板。 */
export function setLibrarySelfTemplate(
  moduleId: string,
  record: LibraryGlobalTemplateRecord,
): void {
  ensureEntry(moduleId).selfTemplate = record;
}

/** 登记一个跨组件共享模板的一项。 */
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
  // 写盘前过一次形状：工具链自己写坏了就当场炸，别产出一个没有 wxml 的库
  assertLibraryMetaFileShape(file);
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
