import { join, normalize } from '@angular-devkit/core';
import { createCssSelectorForTs } from 'cyia-code-util';
import ts from 'typescript';
import * as webpack from 'webpack';
import { LibrarySymbol, LIBRARY_OUTPUT_PATH } from '../const';
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
    libraryLoaderContext.libraryMetaList.forEach((item) => {
      item;
      this.emitFile(
        join(normalize(LIBRARY_OUTPUT_PATH), item.content.path),
        item.content.content
      );
      if (item.contentTemplate) {
        this.emitFile(
          join(normalize(LIBRARY_OUTPUT_PATH), item.contentTemplate.path),
          item.contentTemplate.content
        );
      }
      if (item.style) {
        this.emitFile(
          join(normalize(LIBRARY_OUTPUT_PATH), item.style.path),
          item.style.content
        );
      }
    });
  }
  callback(undefined, data, map);
}
