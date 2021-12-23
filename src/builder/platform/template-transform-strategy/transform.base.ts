/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from 'static-injector';
import { MetaCollection } from '../../html/meta-collection';
import type { NgNodeMeta } from '../../html/node-handle/interface';
import { UseComponent } from '../../html/type';

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
