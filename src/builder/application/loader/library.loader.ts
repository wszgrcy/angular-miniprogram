/* eslint-disable @typescript-eslint/no-explicit-any */
import { dirname, join, normalize, strings } from '@angular-devkit/core';

import { createCssSelectorForTs } from 'cyia-code-util';
import ts from 'typescript';
import * as webpack from 'webpack';
import {
  ExtraTemplateData,
  TemplateScopeOutside,
} from '../../application/library-template-scope.service';
import {
  LIBRARY_COMPONENT_METADATA_SUFFIX,
  LIBRARY_OUTPUT_ROOTDIR,
} from '../../library';
import type { ExportLibraryComponentMeta } from '../../library';
import { libraryTemplateScopeName, literalResolve } from '../../util';
import {
  ExportMiniProgramAssetsPluginSymbol,
  LibrarySymbol,
  TemplateScopeSymbol,
} from '../const';
import type { LibraryLoaderContext } from '../type';
import { LibraryTemplateLiteralConvertOptions } from '../type';
import { ComponentTemplateLoaderContext } from './type';

export default async function (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  this: webpack.LoaderContext<any>,
  data: string,
  map: string
) {
  const callback = this.async();
  const selector = createCssSelectorForTs(data);
  const list = selector.queryAll(
    `PropertyAccessExpression[name=ɵɵdefineComponent]~SyntaxList ObjectLiteralExpression PropertyAssignment[name=type]::initializer`
  );
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
    const componentName = element.getText();
    const extraNode = selector.queryOne(
      `VariableDeclaration[name="${componentName}_${LIBRARY_COMPONENT_METADATA_SUFFIX}"]`
    ) as ts.VariableDeclaration;
    if (!extraNode) {
      continue;
    }
    const content = extraNode.initializer!.getText();
    const meta: ExportLibraryComponentMeta = literalResolve(content);
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
        normalize(LIBRARY_OUTPUT_ROOTDIR),
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
      const libraryTemplateLiteralConvertOptions: LibraryTemplateLiteralConvertOptions =
        {
          directivePrefix:
            libraryLoaderContext.buildPlatform.templateTransform.getData()
              .directivePrefix,
          eventListConvert:
            libraryLoaderContext.buildPlatform.templateTransform
              .eventListConvert,
          templateInterpolation:
            libraryLoaderContext.buildPlatform.templateTransform
              .templateInterpolation,
          fileExtname: libraryLoaderContext.buildPlatform.fileExtname,
        };
      this.emitFile(
        join(
          normalize(LIBRARY_OUTPUT_ROOTDIR),
          item.libraryPath + fileExtname.content
        ),
        `<import src="${globalTemplatePath}"/>` +
          literalResolve(
            `\`${item.content}\``,
            libraryTemplateLiteralConvertOptions
          )
      );
      if (item.contentTemplate) {
        this.emitFile(
          join(
            normalize(LIBRARY_OUTPUT_ROOTDIR),
            dirname(normalize(item.libraryPath)),
            'template' + fileExtname.contentTemplate
          ),
          `<import src="${globalTemplatePath}"/>` +
            literalResolve(
              `\`${item.contentTemplate}\``,
              libraryTemplateLiteralConvertOptions
            )
        );
      }
      if (item.style) {
        this.emitFile(
          join(
            normalize(LIBRARY_OUTPUT_ROOTDIR),
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
