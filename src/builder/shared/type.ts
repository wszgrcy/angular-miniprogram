import { LibraryComponentEntryMeta } from '../library';
import { BuildPlatform, PlatformFileExtname } from '../platform';
import type { AssetPattern } from './asset-pattern';

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

/**
 * 分析服务真正需要的 compiler 宿主能力。
 *
 * 原先签名是 webpack 的 `Compiler`，但实际只读两处：
 *   - watchMode
 *   - inputFileSystem?.purge()
 * vite 侧由 `createStubWebpackCompiler` 提供最小实现，
 * 所以这里用结构类型即可，不必依赖 webpack 的类型。
 */
export interface CompilerHostLike {
  watchMode: boolean;
  inputFileSystem?: { purge?: (path: string) => void };
}
