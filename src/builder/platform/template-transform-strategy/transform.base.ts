/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from 'static-injector';
import type { NgNodeMeta } from '../../mini-program-compiler';
import { MetaCollection, UseComponent } from '../../mini-program-compiler';

@Injectable()
export abstract class TemplateTransformBase {
  abstract init(): any;
  abstract compile(nodes: NgNodeMeta[]): {
    template: string;
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
