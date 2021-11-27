import type { R3UsedDirectiveMetadata } from '@angular/compiler/src/compiler_facade_interface';
import type { Element, Template } from '@angular/compiler/src/render3/r3_ast';
import { Injectable } from 'static-injector';
import ts from 'typescript';
import type { SelectorMatcher } from '../../angular-internal/selector';
import { createCssSelector } from '../../angular-internal/template';
import { getAttrsForDirectiveMatching } from '../../angular-internal/util';
import type { DirectiveMetaFromLibrary, MetaFromLibrary } from '../type';
import { isTemplate } from '../type-protection';
import type { NgDefaultDirective, NgTemplateMeta } from './interface';
import type { MatchedDirective, MatchedMeta } from './type';

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
  matchDirective(node: Element | Template): MatchedMeta[] {
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
    const result: MatchedMeta[] = [];
    this.directiveMatcher.match(
      selector,
      (
        selector,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        meta: {
          directive: R3UsedDirectiveMetadata;
          directiveMeta: any;
          libraryMeta: MetaFromLibrary;
        }
      ) => {
        let item: Partial<MatchedMeta>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isComponent: boolean = (meta.directive as any).isComponent;
        if (isComponent) {
          item = {
            isComponent,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            outputs: (meta.directive as any).outputs,
            filePath: ((meta.directive as any).importedFile as ts.SourceFile)
              .fileName,
            selector: (meta.directive as any).selector,
            className: (
              (meta.directive as any).ref.node as ts.ClassDeclaration
            ).name!.getText(),
          };
          if (meta.libraryMeta?.isComponent) {
            item.exportPath = meta.libraryMeta.exportPath;
          }
        } else {
          item = {
            isComponent,
            listeners: Object.keys(
              meta.directiveMeta?.meta?.host?.listeners || []
            ),
            properties: Object.keys(
              meta.directiveMeta?.meta?.host?.properties || []
            ),
          };
          if (meta.libraryMeta && !meta.libraryMeta.isComponent) {
            (item as MatchedDirective).listeners = (
              meta.libraryMeta as DirectiveMetaFromLibrary
            ).listeners!;
            (item as MatchedDirective).properties = (
              meta.libraryMeta as DirectiveMetaFromLibrary
            ).properties!;
          }
        }
        result.push(item as MatchedMeta);
      }
    );
    return result;
  }
}
