import { join, normalize, resolve, strings } from '@angular-devkit/core';
import { inject } from 'static-injector';
import { detectComponentNames } from '../component-template-inject/change-component';
import { ResolvedDataGroup, makeComponentKey } from '../mini-program-compiler';
import { BuildPlatform } from '../platform/platform';
import { LIBRARY_OUTPUT_ROOTDIR } from './const';
import { getComponentOutputPath } from './get-library-path';
import { patchLibraryComponentMeta } from './library-meta-store';
import { getUseComponents } from './merge-using-component-path';
import { OutputTemplateMetadataService } from './output-template-metadata.service';
import { CustomStyleSheetProcessor } from './stylesheet-processor';
import { ENTRY_POINT_TOKEN, RESOLVED_DATA_GROUP_TOKEN } from './token';

/**
 * 把组件的模板载荷登记进 sidecar 暂存区。不改写 JS 产物：库产物必须是 vanilla 的
 * ng-packagr 输出，运行时 hook 与 wxml 产出都归主构建
 * （`vite/plugins/component-transform.plugin.ts` / `vite/plugins/library-template.plugin.ts`）。
 * 这里只做「读 JS → 认出组件 → 写 sidecar」，`run()` 原样返回输入。
 */
export class SetupComponentDataService {
  private dataGroup = inject<ResolvedDataGroup>(RESOLVED_DATA_GROUP_TOKEN);
  private entryPoint = inject(ENTRY_POINT_TOKEN);
  private addGlobalTemplateService = inject(OutputTemplateMetadataService);
  private buildPlatform = inject(BuildPlatform);

  /** 返回原样 `data`；副作用是把本文件的组件载荷登记进 sidecar。 */
  run(
    data: string,
    originFileName: string,
    customStyleSheetProcessor: CustomStyleSheetProcessor,
  ): string {
    const componentNames = detectComponentNames(data);
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
            'self' + this.buildPlatform.fileExtname.contentTemplate,
          ),
        )}"/>`
      : '';

    for (const componentClassName of componentNames) {
      const key = makeComponentKey(originFileName, componentClassName);
      const useComponentPath = this.dataGroup.useComponentPath.get(key);
      const content = this.dataGroup.outputContent.get(key);
      // 这个组件没参与本次模板编译（例如没有模板），跳过，不能拿别的组件的内容往上堆
      if (!useComponentPath || content === undefined) {
        continue;
      }
      const componentDirName = strings.dasherize(
        strings.camelize(componentClassName),
      );
      const libraryPath = getComponentOutputPath(
        this.entryPoint,
        componentClassName,
      );
      const styleUrlList = this.dataGroup.style.get(key);
      const styleContentList: string[] = [];
      styleUrlList?.forEach((item) => {
        styleContentList.push(customStyleSheetProcessor.styleMap.get(item)!);
      });
      // 内联样式已在 compileSourceFiles 里编译完，这里只负责收集
      this.dataGroup.inlineStyle.get(key)?.forEach((item) => {
        styleContentList.push(
          customStyleSheetProcessor.styleMap.get(item.key) ?? '',
        );
      });

      patchLibraryComponentMeta(this.entryPoint, componentClassName, {
        id:
          strings.classify(this.entryPoint) +
          strings.classify(strings.camelize(componentDirName)),
        className: componentClassName,
        // transform 吐回来的就是 `${}` 插值模板串（插槽已就位），直接存，不需要任何转换
        content: selfTemplateImportStr + content,
        outputPath: libraryPath,
        useComponents: {
          ...getUseComponents(
            useComponentPath.libraryPath,
            useComponentPath.localPath,
            this.entryPoint,
          ),
          ...this.addGlobalTemplateService.getSelfUseComponents(),
        },
        ...(styleContentList.length
          ? { style: styleContentList.join('\n') }
          : {}),
      });
    }

    return data;
  }
}
