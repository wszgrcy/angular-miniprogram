/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NgNodeMeta } from '../../mini-program-compiler';
import { MetaCollection, UseComponent } from '../../mini-program-compiler';
import type { TagNameClassMode } from '../../mini-program-compiler/tag-mapping';

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
   * `tag-name-*` 标记的输出策略，由构建选项写入。放在基类上是因为
   * `BuildPlatform.templateTransform` 的静态类型就是 `TemplateTransformBase`，构建器得能不分平台地设进去。
   */
  tagNameClass: TagNameClassMode = 'mapped';

  /**
   * 共享渲染层脚本的输出目录（相对产物根）。不支持渲染层脚本的平台可不管。
   */
  wxsSharedDir = 'common';
}
