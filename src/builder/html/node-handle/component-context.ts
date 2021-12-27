/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  R3ComponentMetadata,
  R3DirectiveMetadata,
  R3UsedDirectiveMetadata,
  SelectorMatcher,
} from '@angular/compiler';
import type {
  ImportedFile,
  Reference,
} from '@angular/compiler-cli/src/ngtsc/imports';
import type { Element, Template } from '@angular/compiler/src/render3/r3_ast';
import { Injectable } from 'static-injector';
import ts from 'typescript';
import { createCssSelector } from '../../angular-internal/template';
import { getAttrsForDirectiveMatching } from '../../angular-internal/util';
import type { DirectiveMetaFromLibrary, MetaFromLibrary } from '../type';
import { isTemplate } from '../type-protection';
import type { MatchedDirective, MatchedMeta } from './type';

@Injectable()
export class ComponentContext {
  constructor(private directiveMatcher: SelectorMatcher | undefined) {}
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
        meta: {
          directive: R3UsedDirectiveMetadata & {
            ref: Reference<ts.ClassDeclaration>;
            importedFile: ImportedFile;
          };
          componentMeta: R3ComponentMetadata;
          directiveMeta: R3DirectiveMetadata;
          libraryMeta: MetaFromLibrary;
        }
      ) => {
        let item: Partial<MatchedMeta>;
        const isComponent: boolean = !!meta.directive.isComponent;
        if (isComponent) {
          item = {
            isComponent,
            outputs: meta.directive.outputs,
            filePath: (meta.directive.importedFile as ts.SourceFile).fileName,
            selector: meta.directive.selector,
            className: meta.directive.ref.node.name!.getText(),
            listeners:
              Object.keys(meta.componentMeta?.host?.listeners || {}) || [],
            inputs: meta.directive.inputs,
          };
          if (meta.libraryMeta?.isComponent) {
            item.exportPath = meta.libraryMeta.exportPath;
            item.listeners = meta.libraryMeta.listeners;
            item.properties = meta.libraryMeta.properties;
          }
        } else {
          item = {
            isComponent,
            listeners:
              Object.keys(meta.directiveMeta?.host?.listeners || {}) || [],
            properties:
              Object.keys(meta.directiveMeta?.host?.properties || {}) || [],
            inputs: meta.directive.inputs,
            outputs: meta.directive.outputs,
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
