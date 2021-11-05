import { SelectorMatcher } from '@angular/compiler';
import { Element, Template } from '@angular/compiler/src/render3/r3_ast';
import { createCssSelector } from '@angular/compiler/src/render3/view/template';
import { getAttrsForDirectiveMatching } from '@angular/compiler/src/render3/view/util';
import { isTemplate } from '../type-protection';
import { NgDefaultDirective, NgTemplateMeta } from './interface';

export class TemplateGlobalContext {
  bindIndex = 0;
  directiveIndex = 0;
  private templateList: NgTemplateMeta<NgDefaultDirective>[] = [];

  constructor(private directiveMatcher: SelectorMatcher | null) {}
  addTemplate(template: NgTemplateMeta<NgDefaultDirective>) {
    this.templateList.push(template);
  }
  findTemplate(name: string) {
    return this.templateList.find((item) =>
      item.directive
        .filter((item) => item.type === 'none')
        .find((directive) => directive.name.some((item) => item.name === name))
    );
  }
  getBindIndex() {
    return this.bindIndex++;
  }
  matchDirective(node: Element | Template): any | undefined {
    if (!this.directiveMatcher) {
      return undefined;
    }
    let name: string;
    if (isTemplate(node)) {
      name = 'ng-template';
    } else {
      name = node.name;
    }
    const selector = createCssSelector(
      name,
      getAttrsForDirectiveMatching(node)
    );
    const result: any[] = [];
    const hasMatch = this.directiveMatcher.match(
      selector,
      (selector, staticType) => {
        result.push({ selector, staticType });
      }
    );
    if (hasMatch) {
      return result;
    }
    return undefined;
  }
}
