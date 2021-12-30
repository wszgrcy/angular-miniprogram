/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from 'static-injector';
import * as webpack from 'webpack';
import { TemplateScopeSymbol } from './const';

export type TemplateScopeOutside = Omit<
  LibraryTemplateScopeService,
  Exclude<
    keyof LibraryTemplateScopeService,
    'setScopeLibraryUseComponents' | 'setScopeExtraUseComponents'
  >
>;
export interface ExtraTemplateData {
  useComponents: Record<string, string>;
  templateList: string[];
  configPath?: string;
  templatePath?: string;
}

@Injectable()
export class LibraryTemplateScopeService {
  private scopeExtraUseComponentsMap = new Map<string, ExtraTemplateData>();
  private scopeLibraryUseComponentsMap = new Map<string, ExtraTemplateData[]>();
  // 追加模板
  constructor() {}
  register(compilation: webpack.Compilation) {
    (compilation as any)[TemplateScopeSymbol] = {
      setScopeExtraUseComponents: this.setScopeExtraUseComponents,
      setScopeLibraryUseComponents: this.setScopeLibraryUseComponents,
    } as TemplateScopeOutside;
  }

  exportLibraryComponentConfig() {
    const list: {
      filePath: string;
      content: { component: boolean; usingComponents: Record<string, string> };
    }[] = [];
    this.scopeLibraryUseComponentsMap.forEach((obj, libraryScope) => {
      const extraData = this.scopeExtraUseComponentsMap.get(libraryScope) || {
        useComponents: {},
      };
      // if (!extraData) {
      //   throw new Error(`没有找到${libraryScope}对应的配置`);
      // }
      for (const item of obj) {
        const configPath = item.configPath!;
        const usingComponents = {
          ...item.useComponents,
          ...extraData.useComponents,
        };
        list.push({
          filePath: configPath,
          content: { component: true, usingComponents: usingComponents },
        });
      }
    });
    return list;
  }
  exportLibraryTemplate() {
    const fileGroup: Record<string, string> = {};
    this.scopeLibraryUseComponentsMap.forEach((obj, libraryScope) => {
      const extraData = this.scopeExtraUseComponentsMap.get(libraryScope) || {
        templateList: [],
      };
      // if (!extraData) {
      //   throw new Error(`没有找到${libraryScope}对应的配置`);
      // }
      for (const item of obj) {
        if (fileGroup[item.templatePath!]) {
          continue;
        }
        fileGroup[item.templatePath!] = extraData.templateList.join('');
      }
    });
    return fileGroup;
  }
  setScopeExtraUseComponents = (
    libraryScope: string,
    extraData: ExtraTemplateData
  ) => {
    const data: ExtraTemplateData = this.scopeExtraUseComponentsMap.get(
      libraryScope
    ) || { useComponents: {}, templateList: [] };
    this.scopeExtraUseComponentsMap.set(libraryScope, {
      useComponents: { ...data.useComponents, ...extraData.useComponents },
      templateList: [...data.templateList, ...extraData.templateList],
    });
  };

  setScopeLibraryUseComponents = (
    libraryScope: string,
    libraryUseComponents: ExtraTemplateData[]
  ) => {
    this.scopeLibraryUseComponentsMap.set(libraryScope, libraryUseComponents);
  };
}
