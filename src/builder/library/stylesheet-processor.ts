import { StylesheetProcessor } from 'ng-packagr/src/lib/styles/stylesheet-processor';
import { InlineStyleSource } from '../mini-program-compiler/type';

export class CustomStyleSheetProcessor extends StylesheetProcessor {
  styleMap = new Map<string, string>();

  /**
   * ng-packagr 19 用 `bundleFile` / `bundleInline` 取代了 18 的 `process()`。
   *
   * 这里拦截编译结果：把编译后的样式内容暂存到 styleMap（后续由
   * SetupComponentDataService 读取并输出到小程序样式文件），
   * 组件 JS 里不再内联样式，因此 contents 置空。
   */
  async bundleFile(entry: string) {
    const result = await super.bundleFile(entry);
    this.styleMap.set(entry, result.contents);
    return { ...result, contents: '' };
  }

  async bundleInline(data: string, filename: string, language?: string) {
    const result = await super.bundleInline(data, filename, language);
    this.styleMap.set(filename, result.contents);
    return { ...result, contents: '' };
  }
}

/** 一条待编译的样式。 */
export interface StyleCompileEntry {
  /**
   * `styleMap` 的 key：样式源文件是磁盘绝对路径，内联样式是合成的组件级 key。
   * 它同时是 `bundle` 写 `styleMap` 时用的那个 key，两边必须一致。
   */
  key: string;
  /** 真正的编译动作：`bundleFile` 或 `bundleInline` */
  bundle: () => Promise<unknown>;
}

/**
 * 内联样式 → 编译条目。
 *
 * 语言必须显式传：`bundleInline` 没有扩展名可看，默认只能当 css，
 * 写 scss 嵌套的组件会静默产出一份缺样式的 wxss。
 */
export function inlineStyleEntries(
  styleProcessor: CustomStyleSheetProcessor,
  sources: Iterable<InlineStyleSource>,
  language: string | undefined,
): StyleCompileEntry[] {
  return [...sources].map((s) => ({
    key: s.key,
    bundle: () => styleProcessor.bundleInline(s.text, s.key, language ?? 'css'),
  }));
}

/**
 * 把一批样式编译成 css，返回 key -> css。
 *
 * 为什么入口要由调用方给：`bundleFile` / `bundleInline` 是 ng-packagr 两条
 * 不同的管线，不是同一函数的两种入参 —— 前者走 `#fileContexts`，语言按真
 * 扩展名选、watch 失效和 `referencedFiles`（库的依赖图）都挂在它身上；
 * 后者走 `#inlineContexts`，语言得显式传。把路径也摄进 inline 那条会
 * 同时碎掉这三样，所以只共用下面这段「取结果 + 容错」。
 *
 * 结果只能从 `styleMap` 取 —— `CustomStyleSheetProcessor` 把两个入口的返回值
 * 都故意置空了（组件 JS 不内联样式），读返回值会拿到空串。
 *
 * 单条失败只交给 `onError` 并落空串，不中断整轮构建。
 */
export async function compileStyles(
  styleProcessor: CustomStyleSheetProcessor,
  entries: Iterable<StyleCompileEntry>,
  onError?: (error: unknown, key: string) => void,
): Promise<Map<string, string>> {
  const compiled = new Map<string, string>();
  for (const { key, bundle } of entries) {
    if (compiled.has(key)) {
      continue;
    }
    try {
      await bundle();
    } catch (error) {
      onError?.(error, key);
    }
    compiled.set(key, styleProcessor.styleMap.get(key) ?? '');
  }
  return compiled;
}
