/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  R3ComponentMetadata,
  R3DirectiveDependencyMetadata,
  R3DirectiveMetadata,
  SelectorMatcher,
} from '@angular/compiler';

import type {
  ImportedFile,
  Reference,
} from '@angular/compiler-cli/src/ngtsc/imports';
import { Injectable } from 'static-injector';
import ts from 'typescript';
import * as t from '../../angular-internal/ast.type';
import { createCssSelector } from '../../angular-internal/template';
import { getAttrsForDirectiveMatching } from '../../angular-internal/util';
import type { DirectiveMetaFromLibrary, MetaFromLibrary } from '../type';
import type { MatchedDirective, MatchedMeta } from './type';

@Injectable()
export class ComponentContext {
  constructor(private directiveMatcher: SelectorMatcher | undefined) {}
  matchDirective(node: t.Element): MatchedMeta[] {
    if (!this.directiveMatcher) {
      return [];
    }
    const name: string = node.name;
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
          directive: R3DirectiveDependencyMetadata & {
            ref: Reference<ts.ClassDeclaration>;
            importedFile: ImportedFile;
          };
          componentMeta: R3ComponentMetadata<any>;
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
