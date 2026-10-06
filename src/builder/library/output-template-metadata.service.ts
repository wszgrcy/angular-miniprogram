import { join, normalize, resolve } from '@angular-devkit/core';
import { inject } from 'static-injector';
import { MetaCollection, ResolvedDataGroup } from '../mini-program-compiler';
import { LIBRARY_OUTPUT_ROOTDIR } from './const';
import {
  setLibraryScopeTemplate,
  setLibrarySelfTemplate,
} from './library-meta-store';
import { getUseComponents } from './merge-using-component-path';
import {
  ENTRY_FILE_TOKEN,
  ENTRY_POINT_TOKEN,
  RESOLVED_DATA_GROUP_TOKEN,
} from './token';

/**
 * 把「全局模板」（自引用模板 + 跨组件共享模板）登记进 sidecar 暂存区。不改写 JS 产物，
 * 直接进 `mp-library-meta.json` 的 `selfTemplate` / `scopeTemplates`，库 JS 一个字都不改。
 */
export class OutputTemplateMetadataService {
  private entryFile = inject(ENTRY_FILE_TOKEN);
  private dataGroup = inject<ResolvedDataGroup>(RESOLVED_DATA_GROUP_TOKEN);
  private entryPoint = inject(ENTRY_POINT_TOKEN);
  private selfUseComponents!: Record<string, string>;
  private selfMetaCollection!: MetaCollection;

  /** 返回原样 `data`；副作用是把全局模板登记进 sidecar。 */
  run(fileName: string, data: string): string {
    this.registerSelfTemplate();
    this.registerScopeTemplates();
    return data;
  }

  private registerSelfTemplate(): void {
    const selfMetaCollection = this.dataGroup.otherMetaCollectionGroup['$self'];
    if (!selfMetaCollection) {
      return;
    }
    this.selfMetaCollection = selfMetaCollection;
    const templateStr = selfMetaCollection.templateList
      .map((item) => item.content)
      .join('');

    setLibrarySelfTemplate(this.entryPoint, {
      template: templateStr,
      outputPath: resolve(
        normalize('/'),
        join(normalize(LIBRARY_OUTPUT_ROOTDIR), this.entryPoint, 'self'),
      ),
    });

    delete this.dataGroup.otherMetaCollectionGroup['$self'];
  }

  private registerScopeTemplates(): void {
    for (const key of Object.keys(this.dataGroup.otherMetaCollectionGroup)) {
      if (
        !Object.prototype.hasOwnProperty.call(
          this.dataGroup.otherMetaCollectionGroup,
          key,
        )
      ) {
        continue;
      }
      const element = this.dataGroup.otherMetaCollectionGroup[key];
      const templateStr = element.templateList
        .map((item) => item.content)
        .join('');

      setLibraryScopeTemplate(this.entryPoint, key, {
        template: templateStr,
        useComponents: getUseComponents(
          Array.from(element.libraryPath),
          Array.from(element.localPath),
          this.entryPoint,
        ),
      });
    }
  }

  getSelfUseComponents(): Record<string, string> {
    if (!this.selfUseComponents) {
      const selfMetaCollection =
        this.selfMetaCollection ||
        this.dataGroup.otherMetaCollectionGroup['$self'];
      if (!selfMetaCollection) {
        return {};
      }
      this.selfUseComponents = getUseComponents(
        Array.from(selfMetaCollection.libraryPath),
        Array.from(selfMetaCollection.localPath),
        this.entryPoint,
      );
    }
    return this.selfUseComponents;
  }
}
