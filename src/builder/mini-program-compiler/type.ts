import type { WxsDeclaration } from '../wxs/wxs-declare';
import { MetaCollection } from './meta-collection';

export interface ComponentMetaFromLibrary {
  isComponent: true;
  exportPath: string;
  listeners: string[];
  properties: string[];
}
export interface DirectiveMetaFromLibrary {
  isComponent: false;
  listeners: string[];
  properties: string[];
}
export type MetaFromLibrary =
  | ComponentMetaFromLibrary
  | DirectiveMetaFromLibrary;

export interface UseComponent {
  selector: string;
  className: string;
  path: string;
}

/**
 * 三个 map 的 key 统一用 `源文件路径#组件类名` 的复合格式。
 *
 * 以前只按源文件路径做 key，同文件多组件时后编译的会把先编译的覆盖掉：
 * 实测两个组件共用一个源文件时，先那个组件的模板直接丢失（A=0 个 wxml），
 * 且所有引用该文件的 entry 都渲染成最后那个组件的模板。
 *
 * 用 `#` 分隔是因为 POSIX / Windows 路径里都不会出现这个字符。
 */
export const COMPONENT_KEY_SEPARATOR = '#';

export function makeComponentKey(
  sourceFile: string,
  componentClassName: string,
): string {
  return `${sourceFile}${COMPONENT_KEY_SEPARATOR}${componentClassName}`;
}

export function splitComponentKey(key: string): {
  sourceFile: string;
  componentClassName?: string;
} {
  const idx = key.lastIndexOf(COMPONENT_KEY_SEPARATOR);
  if (idx === -1) {
    return { sourceFile: key };
  }
  return {
    sourceFile: key.slice(0, idx),
    componentClassName: key.slice(idx + 1),
  };
}

export interface ResolvedDataGroup {
  /** key: `源文件#组件类名` */
  style: Map<string, string[]>;
  /** key: `源文件#组件类名` */
  outputContent: Map<string, string>;
  /**
   * key: `源文件#组件类名`，value: 该组件模板里的 wxs 声明（module + src）。
   *
   * 存**声明**而非光一个模块名：`src` 是相对组件源文件解析的，
   * 只有带着它才能支持共享脚本（`../common/format.wxs`）。
   * 来自主动改写阶段的返回值，而不是事后从 wxml 反推 ——
   * 前者是权威信息，后者要靠字符串解析，经不起格式变化。
   */
  wxsModules: Map<string, WxsDeclaration[]>;
  /** key: `源文件#组件类名` */
  useComponentPath: Map<
    string,
    {
      localPath: UseComponent[];
      libraryPath: UseComponent[];
    }
  >;
  otherMetaCollectionGroup: Record<string, MetaCollection>;
}

/**
 * wxs-strip 插件与分析层共享的那份引用。
 *
 * 清单就是「哪些组件的模板被改写过、必须换一份给 Angular」。
 */
export type WxsAnalysisRef = {
  wxsModules?: ReadonlyMap<string, unknown>;
} | null;
