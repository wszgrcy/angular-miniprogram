import { join, normalize, resolve, strings } from '@angular-devkit/core';
import * as path from 'path';
import { Inject, Injectable } from 'static-injector';
import { changeComponent } from '../component-template-inject/change-component';
import type { ExportLibraryComponentMeta } from '../library';
import { ResolvedDataGroup, makeComponentKey } from '../mini-program-compiler';
import { BuildPlatform } from '../platform/platform';
import {
  LIBRARY_COMPONENT_METADATA_SUFFIX,
  LIBRARY_OUTPUT_ROOTDIR,
} from './const';
import { getComponentOutputPath } from './get-library-path';
import { getUseComponents } from './merge-using-component-path';
import { OutputTemplateMetadataService } from './output-template-metadata.service';
import { CustomStyleSheetProcessor } from './stylesheet-processor';
import { ENTRY_POINT_TOKEN, RESOLVED_DATA_GROUP_TOKEN } from './token';

@Injectable()
export class SetupComponentDataService {
  constructor(
    @Inject(RESOLVED_DATA_GROUP_TOKEN)
    private dataGroup: ResolvedDataGroup,
    @Inject(ENTRY_POINT_TOKEN) private entryPoint: string,
    private addGlobalTemplateService: OutputTemplateMetadataService,
    private buildPlatform: BuildPlatform
  ) {}
  run(
    data: string,
    originFileName: string,
    customStyleSheetProcessor: CustomStyleSheetProcessor
  ) {
    const changedData = changeComponent(data);
    if (!changedData) {
      return data;
    }
    const componentNames = changedData.componentNames;
    if (!componentNames.length) {
      return data;
    }

    const selfTemplateImportStr = this.dataGroup.otherMetaCollectionGroup[
      '$self'
    ]
      ? `<import src="${resolve(
          normalize('/'),
          join(
            normalize(LIBRARY_OUTPUT_ROOTDIR),
            this.entryPoint,
            'self' + this.buildPlatform.fileExtname.contentTemplate
          )
        )}"/>`
      : '';

    const metadataLines: string[] = [];
    for (const componentClassName of componentNames) {
      const key = makeComponentKey(
        path.normalize(originFileName),
        componentClassName
      );
      const useComponentPath = this.dataGroup.useComponentPath.get(key);
      const content = this.dataGroup.outputContent.get(key);
      // 这个组件没参与本次模板编译（例如没有模板），跳过，
      // 不能拿别的组件的内容往上堆
      if (!useComponentPath || content === undefined) {
        continue;
      }
      const componentDirName = strings.dasherize(
        strings.camelize(componentClassName)
      );
      const libraryPath = getComponentOutputPath(
        this.entryPoint,
        componentClassName
      );
      const styleUrlList = this.dataGroup.style.get(key);
      const styleContentList: string[] = [];
      styleUrlList?.forEach((item) => {
        styleContentList.push(customStyleSheetProcessor.styleMap.get(item)!);
      });

      const insertComponentData: ExportLibraryComponentMeta = {
        id:
          strings.classify(this.entryPoint) +
          strings.classify(strings.camelize(componentDirName)),
        className: componentClassName,
        content: selfTemplateImportStr + content,
        libraryPath: libraryPath,
        useComponents: {
          ...getUseComponents(
            useComponentPath.libraryPath,
            useComponentPath.localPath,
            this.entryPoint
          ),
          ...this.addGlobalTemplateService.getSelfUseComponents(),
        },
        moduleId: this.entryPoint,
      };
      if (styleContentList.length) {
        insertComponentData.style = styleContentList.join('\n');
      }

      metadataLines.push(
        `let ${componentClassName}_${LIBRARY_COMPONENT_METADATA_SUFFIX}=${JSON.stringify(
          insertComponentData
        )}`
      );
    }

    if (!metadataLines.length) {
      return data;
    }

    const list = changedData.content.split(/\n|\r\n/g);
    list.splice(Math.max(list.length - 1, 0), 0, metadataLines.join('\n'));

    return list.join('\n');
  }
}
