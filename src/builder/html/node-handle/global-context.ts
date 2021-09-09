import { NgDefaultDirective, NgTemplateMeta } from './interface';
import { NgTemplate } from './template';

export class GlobalContext {
  private templateList: NgTemplateMeta<NgDefaultDirective>[] = [];
  addTemplate(template: NgTemplateMeta<NgDefaultDirective>) {
    this.templateList.push(template);
  }
  findTemplate(name: string) {
    return this.templateList.find((item) =>
      item.directive.name.some((item) => item.name === name)
    );
  }
}
