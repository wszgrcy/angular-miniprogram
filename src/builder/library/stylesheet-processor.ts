import { StylesheetProcessor } from 'ng-packagr/src/lib/styles/stylesheet-processor';

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
