import type {
  R3ComponentMetadata,
  R3DirectiveMetadata,
} from '@angular/compiler';
import { createCssSelectorForTs } from 'cyia-code-util';
import { Inject, Injectable } from 'static-injector';
import ts from 'typescript';
import { MiniProgramCompilerService } from '../mini-program-compiler';
import {
  LIBRARY_COMPONENT_OUTPUT_PATH_SUFFIX,
  LIBRARY_DIRECTIVE_LISTENERS_SUFFIX,
  LIBRARY_DIRECTIVE_PROPERTIES_SUFFIX,
} from './const';
import { getComponentOutputPath } from './get-library-path';
import { ENTRY_POINT_TOKEN } from './token';

@Injectable()
export class AddDeclarationMetaDataService {
  private directiveMap: Map<ts.ClassDeclaration, R3DirectiveMetadata>;
  private componentMap: Map<ts.ClassDeclaration, R3ComponentMetadata>;

  constructor(
    @Inject(ENTRY_POINT_TOKEN) private entryPoint: string,
    miniProgramCompilerService: MiniProgramCompilerService
  ) {
    this.directiveMap = miniProgramCompilerService.getDirectiveMap();
    this.componentMap = miniProgramCompilerService.getComponentMap();
  }
  run(dTsFileName: string, data: string): string {
    const list = createCssSelectorForTs(data).queryAll(
      `ClassDeclaration`
    ) as ts.ClassDeclaration[];
    return (
      data +
      this.addComponentMetaDataDeclaration(list) +
      this.addDirectiveMetaDataDeclaration(list)
    );
  }
  private addComponentMetaDataDeclaration(list: ts.ClassDeclaration[]) {
    const metaList = ['\n'];
    for (let i = 0; i < list.length; i++) {
      const classDeclaration = list[i];
      const isComponentClassDeclaration = classDeclaration.members.some(
        (item) =>
          ts.isPropertyDeclaration(item) &&
          item.modifiers?.some((modifier) => modifier.getText() === 'static') &&
          item.name.getText() === 'ɵcmp'
      );
      if (!isComponentClassDeclaration) {
        continue;
      }
      metaList.push(
        ...this.getPropertyAndListener(classDeclaration, this.componentMap)
      );
      const className = classDeclaration.name!.getText();

      metaList.push(
        `declare const ${className}_${LIBRARY_COMPONENT_OUTPUT_PATH_SUFFIX}:"${getComponentOutputPath(
          this.entryPoint,
          className
        )}";`
      );
    }
    return metaList.join('\n');
  }
  private addDirectiveMetaDataDeclaration(list: ts.ClassDeclaration[]) {
    const metaList = ['\n'];
    for (let i = 0; i < list.length; i++) {
      const classDeclaration = list[i];
      const isDirectiveClassDeclaration = classDeclaration.members.some(
        (item) =>
          ts.isPropertyDeclaration(item) &&
          item.modifiers?.some((modifier) => modifier.getText() === 'static') &&
          item.name.getText() === 'ɵdir'
      );
      if (!isDirectiveClassDeclaration) {
        continue;
      }
      metaList.push(
        ...this.getPropertyAndListener(classDeclaration, this.directiveMap)
      );
    }
    return metaList.join('\n');
  }
  private getPropertyAndListener(
    classDeclaration: ts.ClassDeclaration,
    map: Map<ts.ClassDeclaration, R3DirectiveMetadata>
  ) {
    const className: string = classDeclaration.name!.getText();
    const list: string[] = [];
    for (const [key, meta] of map.entries()) {
      const directiveClassName = meta.name;
      if (directiveClassName === className) {
        const listeners = meta.host.listeners as Record<string, string>;
        list.push(
          `declare const ${className}_${LIBRARY_DIRECTIVE_LISTENERS_SUFFIX}:${JSON.stringify(
            Object.keys(listeners)
          )};`
        );
        const properties = meta.host.properties as Record<string, string>;
        list.push(
          `declare const ${className}_${LIBRARY_DIRECTIVE_PROPERTIES_SUFFIX}:${JSON.stringify(
            Object.keys(properties)
          )};`
        );
        break;
      }
    }
    return list;
  }
}
