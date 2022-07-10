import type { AssetPattern } from '@angular-devkit/build-angular';
import { LibraryComponentEntryMeta } from '../library';
import { BuildPlatform, PlatformFileExtname } from '../platform';

export interface LibraryTemplateLiteralConvertOptions {
  directivePrefix: string;
  eventListConvert: (name: string[]) => string;
  templateInterpolation: [string, string];
  fileExtname: PlatformFileExtname;
}

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
    style: string;
    logic: string;
    path: string;
    config: string;
  };
  inputFiles: {
    config: string;
  };
  type: 'component' | 'page';
}

export interface LibraryLoaderContext {
  libraryMetaList: LibraryComponentEntryMeta[];
  buildPlatform: BuildPlatform;
}
