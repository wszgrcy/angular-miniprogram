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
}
