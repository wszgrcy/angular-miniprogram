import type { R3UsedDirectiveMetadata } from '@angular/compiler/src/compiler_facade_interface';
import type { Element, Template } from '@angular/compiler/src/render3/r3_ast';
import { Injectable } from 'static-injector';
import type { SelectorMatcher } from '../../angular-internal/selector';
import { createCssSelector } from '../../angular-internal/template';
import { getAttrsForDirectiveMatching } from '../../angular-internal/util';
import { isTemplate } from '../type-protection';
import type { NgDefaultDirective, NgTemplateMeta } from './interface';
import type { MatchedDirective } from './type';

@Injectable()
export class ComponentContext {
  private templateIndex = 0;
  private templateList: NgTemplateMeta<NgDefaultDirective>[] = [];

  constructor(private directiveMatcher: SelectorMatcher | undefined) {}
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
    return this.templateIndex++;
  }
  matchDirective(node: Element | Template): MatchedDirective[] {
    if (!this.directiveMatcher) {
      return [];
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
    const result: MatchedDirective[] = [];
    this.directiveMatcher.match(
      selector,
      (
        selector,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        meta: { directive: R3UsedDirectiveMetadata; directiveMeta: any }
      ) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isComponent: boolean = (meta.directive as any).isComponent;
        if (isComponent) {
          result.push({
            isComponent,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            outputs: (meta.directive as any).outputs,
          });
        } else {
          result.push({
            isComponent,
            listeners: Object.keys(
              meta.directiveMeta?.meta?.host?.listeners || []
            ),
          });
        }
      }
    );
    return result;
  }
}
