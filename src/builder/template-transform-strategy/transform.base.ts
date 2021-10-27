import { Injectable } from 'static-injector';
import { TemplateGlobalContext } from '../html/node-handle/global-context';
import { NgNodeMeta } from '../html/node-handle/interface';

@Injectable()
export abstract class TemplateTransformBase {
  protected globalContext!: TemplateGlobalContext;
  abstract compile(nodes: NgNodeMeta[]): string;
  abstract getExportTemplate(): string;
  abstract getLogic(): string;
  setGlobalContext(globalContext: TemplateGlobalContext) {
    this.globalContext = globalContext;
  }
}
