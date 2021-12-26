/* eslint-disable @typescript-eslint/no-explicit-any */
import { dirname, join, normalize, strings } from '@angular-devkit/core';

import { createCssSelectorForTs } from 'cyia-code-util';
import ts from 'typescript';
import * as webpack from 'webpack';
import {
  ExportMiniProgramAssetsPluginSymbol,
  LIBRARY_OUTPUT_PATH,
  LibrarySymbol,
  TemplateScopeSymbol,
} from '../const';
import {
  ExtraTemplateData,
  TemplateScopeOutside,
} from '../html/library-template-scope.service';
import { ExportLibraryComponentMeta, LibraryLoaderContext } from '../type';
import { libraryTemplateResolve } from '../util/library-template-resolve';
import { libraryTemplateScopeName } from '../util/library-template-scope-name';
import { stringConfigToObjectConfig } from '../util/string-config-to-object-config';
import { ComponentTemplateLoaderContext } from './type';

export default async function (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  this: webpack.LoaderContext<any>,
  data: string,
  map: string
) {
  const callback = this.async();
  const selector = createCssSelectorForTs(data);
  const list = selector.queryAll(`BinaryExpression[left$=ɵcmp]`);
  if (!list.length) {
    callback(undefined, data, map);
    return;
  }
  const context: ComponentTemplateLoaderContext = (this._compilation! as any)[
    ExportMiniProgramAssetsPluginSymbol
  ];
  const templateScopeOutside = (this._compilation as any)[
    TemplateScopeSymbol
  ] as TemplateScopeOutside;
  const scopeLibraryObj: Record<string, ExtraTemplateData[]> = {};
  for (let i = 0; i < list.length; i++) {
    const element = list[i] as ts.BinaryExpression;
    const componentName = (
      element.left as ts.PropertyAccessExpression
    ).expression.getText();
    const extraNode = selector.queryOne(
      `VariableDeclaration[name="${componentName}_ExtraData"]`
    ) as ts.VariableDeclaration;
    if (!extraNode) {
      continue;
    }
    const content = extraNode.initializer!.getText();
    const meta: ExportLibraryComponentMeta =
      stringConfigToObjectConfig(content);
    (this._compilation as any)[LibrarySymbol] =
      (this._compilation as any)[LibrarySymbol] || {};
    const libraryLoaderContext: LibraryLoaderContext = (
      this._compilation as any
    )[LibrarySymbol];
    libraryLoaderContext.libraryMetaList =
      libraryLoaderContext.libraryMetaList || [];
    libraryLoaderContext.libraryMetaList.push({
      ...meta,
      context: this.context,
      importPath: this.resourcePath,
      contextPath: this.utils.contextify(this.rootContext, this.resourcePath),
    });
    const fileExtname = libraryLoaderContext.buildPlatform.fileExtname;
    libraryLoaderContext.libraryMetaList.forEach((item) => {
      const globalTemplatePath = join(
        normalize('/library-template'),
        strings.classify(item.moduleId) +
          libraryLoaderContext.buildPlatform.fileExtname.contentTemplate
      );
      const LIBRARY_SCOPE_ID = libraryTemplateScopeName(item.moduleId);
      const configPath = join(
        normalize(LIBRARY_OUTPUT_PATH),
        item.libraryPath + fileExtname.config
      );
      const list = scopeLibraryObj[LIBRARY_SCOPE_ID] || [];
      list.push({
        configPath: configPath,
        useComponents: item.useComponents,
        templateList: [],
        templatePath: globalTemplatePath,
      });

      scopeLibraryObj[LIBRARY_SCOPE_ID] = list;

      this.emitFile(
        join(
          normalize(LIBRARY_OUTPUT_PATH),
          item.libraryPath + fileExtname.content
        ),
        `<import  src="${globalTemplatePath}"/>` +
          libraryTemplateResolve(
            item.content,
            libraryLoaderContext.buildPlatform.templateTransform.getData()
              .directivePrefix,
            libraryLoaderContext.buildPlatform.templateTransform
              .eventListConvert,
            libraryLoaderContext.buildPlatform.templateTransform
              .templateInterpolation,
            libraryLoaderContext.buildPlatform.fileExtname
          )
      );
      if (item.contentTemplate) {
        this.emitFile(
          join(
            normalize(LIBRARY_OUTPUT_PATH),
            dirname(normalize(item.libraryPath)),
            'template' + fileExtname.contentTemplate
          ),
          `<import  src="${globalTemplatePath}"/>` +
            libraryTemplateResolve(
              item.contentTemplate,
              libraryLoaderContext.buildPlatform.templateTransform.getData()
                .directivePrefix,
              libraryLoaderContext.buildPlatform.templateTransform
                .eventListConvert,
              libraryLoaderContext.buildPlatform.templateTransform
                .templateInterpolation,
              libraryLoaderContext.buildPlatform.fileExtname
            )
        );
      }
      if (item.style) {
        this.emitFile(
          join(
            normalize(LIBRARY_OUTPUT_PATH),
            item.libraryPath + fileExtname.style
          ),
          item.style
        );
      }
    });
  }
  for (const key in scopeLibraryObj) {
    if (Object.prototype.hasOwnProperty.call(scopeLibraryObj, key)) {
      const element = scopeLibraryObj[key];
      templateScopeOutside.setScopeLibraryUseComponents(key, element);
    }
  }
  callback(undefined, data, map);
}
