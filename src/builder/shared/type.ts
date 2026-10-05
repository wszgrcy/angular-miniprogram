import type { AssetPattern } from '@angular-devkit/build-angular';
import type { MpEntryType } from './entry-component';

/**
 * `subpackages` 的一项：入口范围 + 这个分包是不是独立分包。
 *
 * `output` 就是分包 root（约定：root 同时是源码目录与产物目录）。
 */
export type MpSubPackagePattern = Exclude<AssetPattern, string> & {
  /** 独立分包：不依赖主包即可运行 */
  independent?: boolean;
};

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
  /** 入口类型，决定构建器注入哪个注册函数 */
  type: MpEntryType;
  /** 分包 pattern 上声明的「独立分包」，只有 subpackages 来源的入口有 */
  independent?: boolean;
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
