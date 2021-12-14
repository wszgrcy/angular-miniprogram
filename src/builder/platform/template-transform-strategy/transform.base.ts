import { Injectable } from 'static-injector';
import type { NgNodeMeta } from '../../html/node-handle/interface';
import { UseComponent } from '../../html/type';

@Injectable()
export abstract class TemplateTransformBase {
  abstract init(): any;
  abstract compile(nodes: NgNodeMeta[]): {
    template: string;
    meta: string;
    content: string;
    useComponentPath: {
      localPath: UseComponent[];
      libraryPath: UseComponent[];
    };
  };
  abstract getData(): any;
  abstract eventNameConvert(name: string): string;
}
