import { createCssSelectorForTs } from 'cyia-code-util';
import ts from 'typescript';
import * as webpack from 'webpack';
import { LibrarySymbol } from '../const';
import { ExportLibraryComponentMeta, LibraryLoaderContext } from '../type';

export default function (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  this: webpack.LoaderContext<any>,
  data: string,
  map: string
) {
  const callback = this.async();
  console.log(this.resourcePath);
  let selector = createCssSelectorForTs(data);
  let list = selector.queryAll(`BinaryExpression[left$=ɵcmp]`);
  if (!list.length) {
    callback(undefined, data, map);
    return;
  }
  for (let i = 0; i < list.length; i++) {
    const element = list[i] as ts.BinaryExpression;
    let componentName = (
      element.left as ts.PropertyAccessExpression
    ).expression.getText();
    let extraNode = selector.queryOne(
      `VariableDeclaration[name="${componentName}_ExtraData"]`
    ) as ts.VariableDeclaration;
    if (!extraNode) {
      callback(undefined, data, map);
      return;
    }
    let content = extraNode.initializer!.getText();
    let fn = new Function('', `return ${content}`);
    let meta: ExportLibraryComponentMeta = fn();
    meta.componentName = componentName;
    (this._compilation as any)[LibrarySymbol] =
      (this._compilation as any)[LibrarySymbol] || {};
    let libraryLoaderContext: LibraryLoaderContext = (this._compilation as any)[
      LibrarySymbol
    ];
    libraryLoaderContext.libraryMetaList =
      libraryLoaderContext.libraryMetaList || [];
    libraryLoaderContext.libraryMetaList.push(meta);
  }
  callback(undefined, data, map);
}
