import { join, normalize } from '@angular-devkit/core';
import { createCssSelectorForTs } from 'cyia-code-util';
import ts from 'typescript';
import * as webpack from 'webpack';
import { LIBRARY_OUTPUT_PATH, LibrarySymbol } from '../const';
import { ExportLibraryComponentMeta, LibraryLoaderContext } from '../type';

export default function (
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
    let fileExtname = libraryLoaderContext.buildPlatform.fileExtname;
    libraryLoaderContext.libraryMetaList.forEach((item) => {
      item;
      this.emitFile(
        join(
          normalize(LIBRARY_OUTPUT_PATH),
          item.libraryPath + fileExtname.content
        ),
        item.content
      );
      if (item.contentTemplate) {
        this.emitFile(
          join(
            normalize(LIBRARY_OUTPUT_PATH),
            item.libraryPath + fileExtname.contentTemplate
          ),
          item.contentTemplate
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
        JSON.stringify({ component: true, usingComponents: item.useComponents })
      );
    });
  }
  callback(undefined, data, map);
}
