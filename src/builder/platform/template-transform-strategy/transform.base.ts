/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NgNodeMeta } from '../../mini-program-compiler';
import { MetaCollection, UseComponent } from '../../mini-program-compiler';

export abstract class TemplateTransformBase {
  abstract init(): any;
  abstract compile(nodes: NgNodeMeta[]): {
    content: string;
    useComponentPath: {
      localPath: UseComponent[];
      libraryPath: UseComponent[];
    };
    otherMetaGroup: Record<string, MetaCollection>;
  };
  abstract getData(): any;

  abstract templateInterpolation: [string, string];
  abstract eventListConvert: (list: string[]) => string;

  /**
   * 共享渲染层脚本的输出目录（相对产物根）。
   * 不支持渲染层脚本的平台可不管。
   */
  wxsSharedDir = 'common';
}
