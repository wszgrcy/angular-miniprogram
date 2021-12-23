import type { AssetPattern } from '@angular-devkit/build-angular';
import { BuildPlatform } from './platform/platform';

export interface PagePattern extends Exclude<AssetPattern, string> {
  /** 入口名 */
  entryName: string;
  /** 匹配文件,相对于input */
  fileName: string;
  /** 要输出的js出口 */
  output: string;
  /** 绝对路径,path.join */
  src: string;
  outputFiles: {
    content: string;
    contentTemplate: string;
    style: string;
    logic: string;
    path: string;
    config: string;
  };
  inputFiles: {
    config: string;
  };
}

export interface ExportLibraryComponentMeta {
  id: string;
  content: string;
  contentTemplate?: string;
  style?: string;
  className: string;
  libraryPath: string;
  useComponents: Record<string, string>;
  moduleId: string;
}
export interface LibraryComponentEntryMeta extends ExportLibraryComponentMeta {
  importPath: string;
  context: string;
  contextPath: string;
}
export interface LibraryLoaderContext {
  libraryMetaList: LibraryComponentEntryMeta[];
  buildPlatform: BuildPlatform;
}
