import { join, normalize, resolve } from '@angular-devkit/core';
import { Inject, Injectable } from 'static-injector';
import ts from 'typescript';
import { MetaCollection, ResolvedDataGroup } from '../mini-program-compiler';
import { GLOBAL_TEMPLATE_SUFFIX, LIBRARY_OUTPUT_ROOTDIR } from './const';
import { getUseComponents } from './merge-using-component-path';
import {
  ENTRY_FILE_TOKEN,
  ENTRY_POINT_TOKEN,
  RESOLVED_DATA_GROUP_TOKEN,
} from './token';
import { ExtraTemplateData } from './type';

@Injectable()
export class OutputTemplateMetadataService {
  private selfUseComponents!: Record<string, string>;
  private selfMetaCollection!: MetaCollection;
  constructor(
    @Inject(ENTRY_FILE_TOKEN) private entryFile: string,
    @Inject(RESOLVED_DATA_GROUP_TOKEN)
    private dataGroup: ResolvedDataGroup,
    @Inject(ENTRY_POINT_TOKEN) private entryPoint: string
  ) {}

  run(fileName: string, data: string, sourceFile: ts.SourceFile) {
    return `${data}\n${this.getSelfTemplate()};${this.getLibraryTemplate()}`;
  }
  private getSelfTemplate() {
    const selfMetaCollection = this.dataGroup.otherMetaCollectionGroup['$self'];
    if (!selfMetaCollection) {
      return '';
    }
    this.selfMetaCollection = selfMetaCollection;
    const templateStr = selfMetaCollection.templateList
      .map((item) => item.content)
      .join('');

    const extraTemplateData: ExtraTemplateData = {
      template: templateStr,
      outputPath: resolve(
        normalize('/'),
        join(normalize(LIBRARY_OUTPUT_ROOTDIR), this.entryPoint, 'self')
      ),
    };

    delete this.dataGroup.otherMetaCollectionGroup['$self'];

    return `let $self_${GLOBAL_TEMPLATE_SUFFIX}=${JSON.stringify(
      extraTemplateData
    )}`;
  }
  private getLibraryTemplate() {
    if (!Object.keys(this.dataGroup.otherMetaCollectionGroup).length) {
      return '';
    }
    const obj: Record<string, ExtraTemplateData> = {};
    for (const key in this.dataGroup.otherMetaCollectionGroup) {
      if (
        Object.prototype.hasOwnProperty.call(
          this.dataGroup.otherMetaCollectionGroup,
          key
        )
      ) {
        const element = this.dataGroup.otherMetaCollectionGroup[key];
        const templateStr = element.templateList
          .map((item) => item.content)
          .join('');

        const useComponents = getUseComponents(
          Array.from(element.libraryPath),
          Array.from(element.localPath),
          this.entryPoint
        );
        const extraTemplateData: ExtraTemplateData = {
          template: templateStr,
          useComponents: useComponents,
        };
        obj[key] = extraTemplateData;
      }
    }
    return `let library_${GLOBAL_TEMPLATE_SUFFIX}=${JSON.stringify(obj)}`;
  }

  getSelfUseComponents() {
    if (!this.selfUseComponents) {
      const selfMetaCollection =
        this.selfMetaCollection ||
        this.dataGroup.otherMetaCollectionGroup['$self'];
      if (!selfMetaCollection) {
        return {};
      }
      const useComponents = getUseComponents(
        Array.from(selfMetaCollection.libraryPath),
        Array.from(selfMetaCollection.localPath),
        this.entryPoint
      );
      this.selfUseComponents = useComponents;
    }
    return this.selfUseComponents;
  }
}
