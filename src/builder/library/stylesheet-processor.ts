import { StylesheetProcessor } from 'ng-packagr/lib/styles/stylesheet-processor';

export class CustomStyleSheetProcessor extends StylesheetProcessor {
  styleMap = new Map<string, string>();
  async process({
    filePath,
    content,
  }: {
    filePath: string;
    content: string;
  }): Promise<string> {
    const result = await super.process({ filePath, content });
    this.styleMap.set(filePath, content);
    return result;
  }
}
