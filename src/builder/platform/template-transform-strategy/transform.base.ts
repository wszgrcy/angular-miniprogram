import { Injectable } from 'static-injector';
import { NgNodeMeta } from '../../html/node-handle/interface';

@Injectable()
export abstract class TemplateTransformBase {
  abstract compile(nodes: NgNodeMeta[]): {
    template: string;
    meta: string;
    content: string;
  };
}
