import { Inject, Injectable } from 'static-injector';
import ts from 'typescript';
import { GLOBAL_TEMPLATE_SUFFIX } from '../const';
import { MetaCollection } from '../html/meta-collection';
import { getUseComponents } from './merge-using-component-path';
import {
  ENTRY_FILE_TOKEN,
  LIBRARY_ENTRY_POINT,
  RESOLVED_META_MAP,
} from './token';
import { ExtraTemplateData } from './type';

@Injectable()
export class AddGlobalTemplateService {
  private selfUseComponents!: Record<string, string>;
  private selfMetaCollection!: MetaCollection;
  constructor(
    @Inject(ENTRY_FILE_TOKEN) private entryFile: string,
    @Inject(RESOLVED_META_MAP)
    private resolvedMetaMap: {
      otherMetaCollectionGroup: Record<string, MetaCollection>;
    },
    @Inject(LIBRARY_ENTRY_POINT) private libraryEntryPoint: string
  ) {}

  run(fileName: string, data: string, sourceFile: ts.SourceFile) {
    return `${data}\n;${[
      this.getSelfTemplate(),
      this.getLibraryTemplate(),
    ].join(';')}`;
  }
  private getSelfTemplate() {
    const selfMetaCollection =
      this.resolvedMetaMap.otherMetaCollectionGroup['$self'];
    this.selfMetaCollection = selfMetaCollection;
    const templateStr = selfMetaCollection.templateList
      .map((item) => item.content)
      .join('');

    const extraTemplateData: ExtraTemplateData = {
      template: templateStr,
      moduleId: this.libraryEntryPoint,
    };

    delete this.resolvedMetaMap.otherMetaCollectionGroup['$self'];

    return `let $self_${GLOBAL_TEMPLATE_SUFFIX}=${JSON.stringify(
      extraTemplateData
    )}`;
  }
  private getLibraryTemplate() {
    const obj: Record<string, any> = {};
    for (const key in this.resolvedMetaMap.otherMetaCollectionGroup) {
      if (
        Object.prototype.hasOwnProperty.call(
          this.resolvedMetaMap.otherMetaCollectionGroup,
          key
        )
      ) {
        const element = this.resolvedMetaMap.otherMetaCollectionGroup[key];
        const templateStr = element.templateList
          .map((item) => item.content)
          .join('');

        const useComponents = getUseComponents(
          Array.from(element.libraryPath),
          Array.from(element.localPath),
          this.libraryEntryPoint
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
      const currentSelf =
        this.selfMetaCollection ||
        this.resolvedMetaMap.otherMetaCollectionGroup['$self'];
      const useComponents = getUseComponents(
        Array.from(currentSelf.libraryPath),
        Array.from(currentSelf.localPath),
        this.libraryEntryPoint
      );
      this.selfUseComponents = useComponents;
    }
    return this.selfUseComponents;
  }
}
