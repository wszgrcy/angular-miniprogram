/**
 * 库元数据 sidecar 的 schema。
 *
 * ## 背景
 *
 * 应用构建时，`MiniProgramCompilerService` 需要知道「库里那个指令有哪些 host
 * 事件 / host 属性 / 组件产物路径」，才能在 wxml 里生成
 * `bind:input` / `bind:change` 之类的绑定。这些信息只在**库编译期**拿得到
 * （`R3DirectiveMetadata`），所以库构建必须把它落盘带给应用侧。
 *
 * 旧做法是把这些信息拼成 `declare const X_Listeners:[...]` 追加进 `.d.ts`，
 * 等于把类型契约文件当成 key-value 存储用，还得跟 ng-packagr 的 d.ts 扁平化
 * （会把未导出的 `declare const` tree-shake 掉）搏斗，构建完再补写一次。
 *
 * 现在改成独立的 sidecar：`.d.ts` 一个字都不改，元数据全部进
 * `<库根>/mp-library-meta.json`。
 *
 * ## 主键为什么是「扁平化 d.ts 相对库根的 posix 路径」
 *
 * 读取侧的唯一线索是 `classDeclaration.getSourceFile().fileName`，
 * 也就是 TS 实际解析到的那个 `.d.ts`。ng-packagr 把一个 entry point 扁平化成
 * **恰好一个** `.d.ts`，所以「d.ts 相对路径」和「entry point」是 1:1，
 * 拿它当 key 可以让读取侧只做一次 `path.relative` + 查表，
 * 不用解析 `exports` map，也不用猜模块 id。
 *
 * 旧方案「把全部标记写进每一个 entry 的 d.ts」那种散弹枪在这里不再需要，
 * 因为文件身份本身就是键，天然精确。
 */

/** sidecar 文件名，写在库根（`dist/`）下。 */
export const LIBRARY_META_FILE_NAME = 'mp-library-meta.json';

/** schema 版本。字段语义变化时必须 bump，读取侧据此拒绝吃错格式。 */
export const LIBRARY_META_SCHEMA_VERSION = 1;

/** 产出方标识，方便排查「这个文件是谁写的」。 */
export const LIBRARY_META_GENERATOR = 'angular-miniprogram';

/** 指令（含组件）的 host 绑定元数据。 */
export interface LibraryDirectiveMetaRecord {
  /** `@HostListener` 的事件名，如 `["bindinput", "bindblur"]` */
  listeners: string[];
  /** `@HostBinding` 的 property 名，如 `["value", "disabled"]` */
  properties: string[];
}

/** 组件比指令多一个「小程序自定义组件产物路径」。 */
export interface LibraryComponentMetaRecord extends LibraryDirectiveMetaRecord {
  /** 形如 `/angular-miniprogram/forms/default-value-accessor/default-value-accessor` */
  outputPath: string;
}

/** 一个 entry point 的元数据。 */
export interface LibraryMetaEntry {
  /** 模块 id，如 `angular-miniprogram/forms`。仅用于人读与日志 */
  moduleId: string;
  /** 扁平化 d.ts 相对库根的 posix 路径，**读取侧主键** */
  typings: string;
  directives: Record<string, LibraryDirectiveMetaRecord>;
  components: Record<string, LibraryComponentMetaRecord>;
}

/** sidecar 文件整体结构。 */
export interface LibraryMetaFile {
  schemaVersion: number;
  generator: string;
  /** 库 package.json 的 version，用于人肉核对「元数据对得上哪个版本」 */
  libVersion?: string;
  entries: Record<string, LibraryMetaEntry>;
}

/**
 * 宽松校验。
 *
 * 只做结构判定，不做深度校验：读侧宁可拿到空集合，也不要因为一个字段
 * 形状不对就整包崩掉。schemaVersion 不匹配时返回 false，让调用方决定
 * 是报错还是降级。
 */
export function isLibraryMetaFile(value: unknown): value is LibraryMetaFile {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<LibraryMetaFile>;
  if (typeof candidate.schemaVersion !== 'number') {
    return false;
  }
  if (!candidate.entries || typeof candidate.entries !== 'object') {
    return false;
  }
  return true;
}

/** 把路径统一成 key 形态：正斜杠、去掉前导 `./`。 */
export function normalizeMetaKey(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\.\//, '');
}

/** 取记录里的 listeners / properties，缺字段一律当空数组，绝不返回 undefined。 */
export function safeStringList(list: unknown): string[] {
  return Array.isArray(list)
    ? (list.filter((i) => typeof i === 'string') as string[])
    : [];
}
