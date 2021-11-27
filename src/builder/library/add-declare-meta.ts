import { join, normalize } from '@angular-devkit/core';
import { camelize, dasherize } from '@angular-devkit/core/src/utils/strings';
import { CssSelectorForTs, createCssSelectorForTs } from 'cyia-code-util';
import { Inject, Injectable } from 'static-injector';
import ts from 'typescript';
import {
  LIBRARY_COMPONENT_EXPORT_PATH_SUFFIX,
  LIBRARY_DIRECTIVE_LISTENERS_SUFFIX,
  LIBRARY_DIRECTIVE_PROPERTIES_SUFFIX,
} from '../const';
import { DIRECTIVE_MAP, LIBRARY_ENTRY_POINT, RESOLVED_META_MAP } from './token';

@Injectable()
export class AddDeclareMetaService {
  constructor(
    @Inject(RESOLVED_META_MAP)
    resolvedMetaMap: {
      style: Map<string, string[]>;
      outputContent: Map<string, string>;
      outputContentTemplate: Map<string, string>;
      meta: Map<string, string>;
    },
    @Inject(LIBRARY_ENTRY_POINT) private libraryEntryPoint: string,
    @Inject(DIRECTIVE_MAP) private directiveMap: Map<ts.ClassDeclaration, any>
  ) {}
  run(dTsFileName: string, data: string, sourceFile: ts.SourceFile): string {
    const selector = createCssSelectorForTs(data);
    return (
      data +
      this.addComponentDeclare(selector) +
      this.addDirectiveMeta(selector)
    );
  }
  private addComponentDeclare(selector: CssSelectorForTs) {
    const list = selector.queryAll(`ClassDeclaration`) as ts.ClassDeclaration[];
    const metaList = ['\n'];
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const isClassDeclaration = element.members.some(
        (item) =>
          ts.isPropertyDeclaration(item) &&
          item?.modifiers?.some(
            (modifier) => modifier.getText() === 'static'
          ) &&
          item.name.getText() === 'ɵcmp'
      );
      if (!isClassDeclaration) {
        continue;
      }
      const className = element.name!.getText();

      metaList.push(
        `declare const ${className}_${LIBRARY_COMPONENT_EXPORT_PATH_SUFFIX}:"${join(
          normalize(this.libraryEntryPoint),
          dasherize(camelize(className)),
          dasherize(camelize(className))
        )}";`
      );
    }
    return metaList.join('\n');
  }
  // todo 需要元数据支持
  private addDirectiveMeta(selector: CssSelectorForTs) {
    const list = selector.queryAll(`ClassDeclaration`) as ts.ClassDeclaration[];
    const metaList = ['\n'];
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      const isClassDeclaration = element.members.some(
        (item) =>
          ts.isPropertyDeclaration(item) &&
          item?.modifiers?.some(
            (modifier) => modifier.getText() === 'static'
          ) &&
          item.name.getText() === 'ɵdir'
      );
      if (!isClassDeclaration) {
        continue;
      }
      const className = element.name!.getText();
      for (const [key, value] of this.directiveMap.entries()) {
        const directiveClassName = value.meta.name;
        if (directiveClassName === className) {
          const listeners = value.meta.host.listeners as Record<string, string>;
          metaList.push(
            `declare const ${className}_${LIBRARY_DIRECTIVE_LISTENERS_SUFFIX}:${JSON.stringify(
              Object.keys(listeners)
            )};`
          );
          const properties = value.meta.host.properties as Record<
            string,
            string
          >;
          metaList.push(
            `declare const ${className}_${LIBRARY_DIRECTIVE_PROPERTIES_SUFFIX}:${JSON.stringify(
              Object.keys(properties)
            )};`
          );
        }
      }
    }
    return metaList.join('\n');
  }
}
