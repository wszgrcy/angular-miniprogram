/**
 * 库元数据 sidecar 的 schema。
 *
 * 应用构建时需要知道「库里那个指令有哪些 host 事件 / host 属性 / 组件产物路径」，
 * 这些信息只在库编译期拿得到，所以库构建把它落盘成 `<库根>/mp-library-meta.json`，`.d.ts` 一个字都不改。
 *
 * 主键是「扁平化 d.ts 相对库根的 posix 路径」：读取侧的唯一线索是 TS 实际解析到的那个 `.d.ts`，
 * 而 ng-packagr 把一个 entry point 扁平化成恰好一个 `.d.ts`，两者 1:1，读取侧只需一次 `path.relative` + 查表。
 */

/** sidecar 文件名，写在库根（`dist/`）下。 */
import { toModuleSpecifier } from '../util/path';

export const LIBRARY_META_FILE_NAME = 'mp-library-meta.json';

/** schema 版本。字段语义变化时必须 bump，读取侧据此拒绝吃错格式。 */
export const LIBRARY_META_SCHEMA_VERSION = 3;

/** 产出方标识，方便排查「这个文件是谁写的」。 */
export const LIBRARY_META_GENERATOR = 'angular-miniprogram';

/** 指令（含组件）的 host 绑定元数据。 */
export interface LibraryDirectiveMetaRecord {
  /** `@HostListener` 的事件名，如 `["bindinput", "bindblur"]` */
  listeners: string[];
  /** `@HostBinding` 的 property 名，如 `["value", "disabled"]` */
  properties: string[];
}

/**
 * 组件比指令多出来的东西：产物路径 + 模板载荷。
 * `content` / `contentTemplate` 是 `${}` 插值模板串（平台中立），平台相关部分写成插槽，
 * wxml 自己的 `{{hasLoad}}` 是静态文本原样进出。主构建用目标平台的 `LibraryTemplateValues` 渲染，
 * 所以一份库产物可以通吃各平台。
 */
export interface LibraryComponentMetaRecord extends LibraryDirectiveMetaRecord {
  /** 形如 `/angular-miniprogram/forms/default-value-accessor/default-value-accessor` */
  outputPath: string;
  /** 小程序侧组件唯一 id（`classify(moduleId) + classify(dasherize(className))`） */
  id?: string;
  /** 类名，主构建生成 entry chunk 时要拿它去 `lib.<className>` 上取值 */
  className?: string;
  /** `${}` 插值模板串（已含 `<import src=".../self..."/>` 前缀） */
  content?: string;
  /** 组件自带的 contentTemplate（递归/自引用模板场景） */
  contentTemplate?: string;
  /** 该组件模板用到的子组件映射，等价于小程序的 `usingComponents` */
  useComponents?: Record<string, string>;
  /** 编译后的样式文本 */
  style?: string;
}

/**
 * 全局模板：库构建把多个组件共用的模板片段聚合成一份，主构建按路径 emit 成一个可 `<import src="..."/>` 的文件。
 */
export interface LibraryGlobalTemplateRecord {
  /** `${}` 插值模板串 */
  template: string;
  /** emit 目标路径（不含扩展名），仅 self 模板带 */
  outputPath?: string;
  /** 该模板作用域内可用的组件映射 */
  useComponents?: Record<string, string>;
}

/** 一个 entry point 的元数据。 */
export interface LibraryMetaEntry {
  /** 模块 id，如 `angular-miniprogram/forms`。同时是主构建的 bare import 说明符 */
  moduleId: string;
  /** 扁平化 d.ts 相对库根的 posix 路径，**读取侧主键** */
  typings: string;
  /** 该 entry 的 fesm 产物相对库根的 posix 路径，用于把模块 id 对上实际文件 */
  fesm?: string;
  directives: Record<string, LibraryDirectiveMetaRecord>;
  components: Record<string, LibraryComponentMetaRecord>;
  /** 本 entry 的自引用模板 */
  selfTemplate?: LibraryGlobalTemplateRecord;
  /** 跨组件共享模板，key 为模板作用域 */
  scopeTemplates?: Record<string, LibraryGlobalTemplateRecord>;
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
 * 宽松校验。只做结构判定：读侧宁可拿到空集合，也不要因为一个字段形状不对就整包崩掉。
 * schemaVersion 不匹配时返回 false，让调用方决定报错还是降级。
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
  return toModuleSpecifier(p);
}

/** 取记录里的 listeners / properties，缺字段一律当空数组，绝不返回 undefined。 */
export function safeStringList(list: unknown): string[] {
  return Array.isArray(list)
    ? (list.filter((i) => typeof i === 'string') as string[])
    : [];
}

/**
 * 校验一个 entry 真的带了模板载荷，没带就显式抛错。sidecar 里有组件却一个 `content` 都没有，
 * 说明这个库不是用当前工具链构建的。宁可构建失败，也不要交一个白屏产物。
 */
export function assertLibraryTemplatePayload(
  entry: Pick<LibraryMetaEntry, 'moduleId' | 'components'>,
): void {
  const components = Object.values(entry.components ?? {});
  if (!components.length) {
    return;
  }
  const hasPayload = components.some(
    (c) => typeof c.content === 'string' && c.content.length > 0,
  );
  if (!hasPayload) {
    throw new Error(
      `[library-template] 库 "${entry.moduleId}" 的 sidecar 里所有组件都缺 content` +
        `（需要 schemaVersion v${LIBRARY_META_SCHEMA_VERSION}）。` +
        `该库必须用当前版本工具链重新构建，否则库组件不会有任何 wxml。`,
    );
  }
}
