import { join, normalize, resolve, strings } from '@angular-devkit/core';
import { Inject, Injectable } from 'static-injector';
import { changeComponent } from '../component-template-inject/change-component';
import type { ExportLibraryComponentMeta } from '../library';
import { ResolvedDataGroup } from '../mini-program-compiler';
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
    const useComponentPath =
      this.dataGroup.useComponentPath.get(originFileName)!;
    const componentClassName = changedData.componentName;
    const componentDirName = strings.dasherize(
      strings.camelize(componentClassName)
    );
    const libraryPath = getComponentOutputPath(
      this.entryPoint,
      componentClassName
    );
    const styleUrlList = this.dataGroup.style.get(originFileName);
    const styleContentList: string[] = [];
    styleUrlList?.forEach((item) => {
      styleContentList.push(customStyleSheetProcessor.styleMap.get(item)!);
    });
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

    const insertComponentData: ExportLibraryComponentMeta = {
      id:
        strings.classify(this.entryPoint) +
        strings.classify(strings.camelize(componentDirName)),
      className: componentClassName,
      content:
        selfTemplateImportStr +
        this.dataGroup.outputContent.get(originFileName)!,
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

    let list = changedData.content.split(/\n|\r\n/g);
    list.splice(
      Math.max(list.length - 1, 0),
      0,
      `let ${componentClassName}_${LIBRARY_COMPONENT_METADATA_SUFFIX}=${JSON.stringify(
        insertComponentData
      )}`
    );

    return list.join('\n');
  }
}
