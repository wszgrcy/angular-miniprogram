import { GlobalContext } from '../html/node-handle/global-context';
import { NgNodeMeta } from '../html/node-handle/interface';

export abstract class TemplateTransformBase {
  protected globalContext!: GlobalContext;
  abstract compile(nodes: NgNodeMeta[]): string;
  abstract getExportTemplate(): string;
  setGlobalContext(globalContext: GlobalContext) {
    this.globalContext = globalContext;
  }
}
