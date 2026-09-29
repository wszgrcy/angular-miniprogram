import { join, normalize, resolve, strings } from '@angular-devkit/core';
import * as path from 'path';
import { Inject, Injectable } from 'static-injector';
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
 * 把组件的**模板载荷**登记进 sidecar 暂存区。
 *
 * **不再改写 JS 产物。**
 *
 * 旧实现在这里调 `changeComponent(data)` 注 `amp.propertyChange`，再把
 * `let X_ExtraData={...}` 拼到文件尾巴上 —— 等于把库的 JS bundle 当成
 * key-value 存储用，还顺手把运行时 hook 烘进了库产物，导致：
 *
 *   - 库产物不是 vanilla ng-packagr 输出，不能直接给别的工具链用
 *   - 运行时 hook 与库版本死锁（老库 + 新 runtime 直接不刷新）
 *   - 顶层 `let X_ExtraData` 本模块内无人引用，全靠 ng-packagr 不 DCE 才活着
 *
 * 现在这里只做「读 JS → 认出组件 → 写 sidecar」，`run()` 原样返回输入。
 * 注入 `amp.propertyChange` 与 wxml 产出都归主构建
 * （`vite/plugins/component-transform.plugin.ts` /
 * `vite/plugins/library-template.plugin.ts`）。
 */
@Injectable()
export class SetupComponentDataService {
  constructor(
    @Inject(RESOLVED_DATA_GROUP_TOKEN)
    private dataGroup: ResolvedDataGroup,
    @Inject(ENTRY_POINT_TOKEN) private entryPoint: string,
    private addGlobalTemplateService: OutputTemplateMetadataService,
    private buildPlatform: BuildPlatform,
  ) {}

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
      const key = makeComponentKey(
        path.normalize(originFileName),
        componentClassName,
      );
      const useComponentPath = this.dataGroup.useComponentPath.get(key);
      const content = this.dataGroup.outputContent.get(key);
      // 这个组件没参与本次模板编译（例如没有模板），跳过，
      // 不能拿别的组件的内容往上堆
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

      patchLibraryComponentMeta(this.entryPoint, componentClassName, {
        id:
          strings.classify(this.entryPoint) +
          strings.classify(strings.camelize(componentDirName)),
        className: componentClassName,
        // transform 吐回来的就是 `${}` 插值模板串（插槽已就位，wxml 的 {{}}
        // 是静态文本不需要动），直接存，不需要任何转换。
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
