import { TsChange, createCssSelectorForTs } from 'cyia-code-util';
import * as path from 'path';
import * as ts from 'typescript';
import * as webpack from 'webpack';
import { ExportWeiXinAssetsPluginSymbol } from '../const';
import { RawUpdater } from '../util/raw-updater';
import { ComponentTemplateLoaderContext } from './type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function (
  this: webpack.LoaderContext<any>,
  data: string,
  map: string
) {
  const callback = this.async();
  const sf = ts.createSourceFile(
    this.resourcePath,
    data,
    ts.ScriptTarget.Latest,
    true
  );
  const selector = createCssSelectorForTs(sf);
  const templateNode = selector.queryOne(
    `BinaryExpression[left$=ɵcmp] CallExpression ObjectLiteralExpression PropertyAssignment[name=template]`
  );
  const initIfNode = selector.queryOne(
    templateNode,
    `IfStatement[expression="rf & 1"]`
  ) as ts.IfStatement;
  const updateIfNode = selector.queryOne(
    templateNode,
    `IfStatement[expression="rf & 2"]`
  ) as ts.IfStatement;
  const node = initIfNode as ts.IfStatement;
  if (!node) {
    callback(undefined, data, map);
    return;
  }
  const initBlock = node.thenStatement as ts.Block;
  const updateBlock = updateIfNode.thenStatement as ts.Block;
  // todo 修改更新逻辑
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context: ComponentTemplateLoaderContext = (this._compilation! as any)[
    ExportWeiXinAssetsPluginSymbol
  ];

  const logic = (await context.updateLogicMapPromise).get(
    path.normalize(this.resourcePath)
  )!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  const content = `wx.__window.__pageBind()`;
  const change = new TsChange(sf);
  let inserChange;
  if (!initBlock.statements.length) {
    inserChange = change.replaceNode(initBlock, `{${content}}`);
  } else {
    inserChange = change.insertNode(
      initBlock.statements[initBlock.statements.length - 1],
      content,
      'end'
    );
  }
  let updateChange;
  if (!updateBlock.statements.length) {
    updateChange = change.replaceNode(
      updateBlock,
      `{${logic};wx.__window.__propertyChange(wxContainerMain({originVar:ctx}))}`
    );
  } else {
    updateChange = change.insertNode(
      updateBlock.statements[updateBlock.statements.length - 1],
      `${logic};wx.__window.__propertyChange(wxContainerMain({originVar:ctx}))`,
      'end'
    );
  }
  data = RawUpdater.update(data, [updateChange, inserChange]);
  callback(undefined, data);
}
