import { pathKey } from '../util/path';
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
 * 三个 map 的 key 分隔符。用 `#` 是因为 POSIX / Windows 路径里都不会出现这个字符。
 */
export const COMPONENT_KEY_SEPARATOR = '#';

/**
 * 三个 map 的 key 统一用 `源文件路径#组件类名` 的复合格式：同文件多组件时
 * 只按文件路径做 key 会互相覆盖。
 *
 * 源文件段在这里统一过 `pathKey`：这个 key 跨好几个模块生产与消费，
 * 各处自己归一只要有一处形态不同就整批查不中，而且只是查不中、不报错。
 * 归一收在这一个函数里，调用方直接传原始 fileName。
 */
export function makeComponentKey(
  sourceFile: string,
  componentClassName: string,
): string {
  return `${pathKey(sourceFile)}${COMPONENT_KEY_SEPARATOR}${componentClassName}`;
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

/**
 * 一条内联样式：`@Component.styles` 数组里的一项，或模板里的 `<style>`。
 * 存的是未编译的原文，得交给样式管线编译，不能直接当 css 落盘。
 */
export interface InlineStyleSource {
  /** 样式原文 */
  text: string;
  /**
   * 编译产物在 `styleProcessor.styleMap` 里的 key。必须每个组件每条样式各不相同，
   * 而目录部分必须留在组件源文件所在目录——css 里的相对 `url()` 按 `dirname(key)` 解析。
   */
  key: string;
}

export interface ResolvedDataGroup {
  /** key: `源文件#组件类名`，value: 样式**源文件**绝对路径 */
  style: Map<string, string[]>;
  /** key: `源文件#组件类名`，value: 内联样式（未编译） */
  inlineStyle: Map<string, InlineStyleSource[]>;
  /** key: `源文件#组件类名` */
  outputContent: Map<string, string>;
  /**
   * key: `源文件#组件类名`，value: 该组件模板里的 wxs 声明（module + src）。
   * 存声明而非光一个模块名：`src` 相对组件源文件解析，带着它才能支持共享脚本。
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
 * wxs-strip 插件与分析层共享的那份引用。清单就是「哪些组件的模板被改写过、必须换一份给 Angular」。
 */
export type WxsAnalysisRef = {
  wxsModules?: ReadonlyMap<string, unknown>;
} | null;
