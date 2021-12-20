/* eslint-disable @typescript-eslint/no-explicit-any */
import { dirname, join, normalize } from '@angular-devkit/core';
import { classify } from '@angular-devkit/core/src/utils/strings';
import { createCssSelectorForTs } from 'cyia-code-util';
import ts from 'typescript';
import * as webpack from 'webpack';
import {
  ExportMiniProgramAssetsPluginSymbol,
  LIBRARY_OUTPUT_PATH,
  LibrarySymbol,
} from '../const';
import { MetaCollection } from '../html/meta-collection';
import { ExportLibraryComponentMeta, LibraryLoaderContext } from '../type';
import { runScript } from '../util/run-script';
import { ComponentTemplateLoaderContext } from './type';

function resolveContent(
  content: string,
  directivePrefix: string,
  eventNameConvert: (name: string) => string,
  templateInterpolation: [string, string],
  fileExtname: any
): string {
  return runScript(`(()=>{return \`${content}\`})()`, {
    directivePrefix,
    eventNameConvert,
    templateInterpolation,
    fileExtname,
  });
}
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
  const otherMetaGroup = await context.otherMetaGroupPromise;
  for (let i = 0; i < list.length; i++) {
    const element = list[i] as ts.BinaryExpression;
    const componentName = (
      element.left as ts.PropertyAccessExpression
    ).expression.getText();
    const extraNode = selector.queryOne(
      `VariableDeclaration[name="${componentName}_ExtraData"]`
    ) as ts.VariableDeclaration;
    if (!extraNode) {
      callback(undefined, data, map);
      return;
    }
    const content = extraNode.initializer!.getText();
    const fn = new Function('', `return ${content}`);
    const meta: ExportLibraryComponentMeta = fn();
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
      const otherMetaCollection: MetaCollection =
        otherMetaGroup[classify(item.moduleId)];
      context.addExtraTemplateNameMapping(
        classify(item.moduleId),
        item.libraryPath
      );
      const globalTemplatePath = join(
        normalize('/library-template'),
        classify(item.moduleId) +
          libraryLoaderContext.buildPlatform.fileExtname.contentTemplate
      );
      this.emitFile(globalTemplatePath, '');
      this.emitFile(
        join(
          normalize(LIBRARY_OUTPUT_PATH),
          item.libraryPath + fileExtname.content
        ),
        `<import  src="${globalTemplatePath}"/>` +
          resolveContent(
            item.content,
            libraryLoaderContext.buildPlatform.templateTransform.getData()
              .directivePrefix,
            libraryLoaderContext.buildPlatform.templateTransform
              .eventNameConvert,
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
            resolveContent(
              item.contentTemplate,
              libraryLoaderContext.buildPlatform.templateTransform.getData()
                .directivePrefix,
              libraryLoaderContext.buildPlatform.templateTransform
                .eventNameConvert,
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
      this.emitFile(
        join(
          normalize(LIBRARY_OUTPUT_PATH),
          item.libraryPath + (fileExtname.config || '.json')
        ),
        JSON.stringify({
          component: true,
          usingComponents: {
            ...item.useComponents,
            ...[
              ...otherMetaCollection.localPath,
              ...otherMetaCollection.libraryPath,
            ].reduce((pre, cur) => {
              pre[cur.selector] = cur.path;
              return pre;
            }, {} as Record<string, string>),
          },
        })
      );
    });
  }
  callback(undefined, data, map);
}
