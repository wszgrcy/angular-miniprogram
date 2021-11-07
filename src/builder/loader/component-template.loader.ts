import { TsChange, createCssSelectorForTs } from 'cyia-code-util';
import * as path from 'path';
import * as ts from 'typescript';
import * as webpack from 'webpack';
import { ExportWeiXinAssetsPluginSymbol } from '../const';
import { RawUpdater } from '../util/raw-updater';
import { ComponentTemplateLoaderContext } from './type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (this: webpack.LoaderContext<any>, data: string) {
  const sf = ts.createSourceFile(
    this.resourcePath,
    data,
    ts.ScriptTarget.Latest,
    true
  );
  const selector = createCssSelectorForTs(sf);
  const node = selector.queryOne(
    'BinaryExpression[left$=ɵcmp] CallExpression ObjectLiteralExpression PropertyAssignment[name=template] IfStatement[expression="rf & 1"]'
  ) as ts.IfStatement;
  if (!node) {
    return data;
  }
  const initBlock = node.thenStatement as ts.Block;
  // todo 修改更新逻辑
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const context: ComponentTemplateLoaderContext = (this._compilation! as any)[
  //   ExportWeiXinAssetsPluginSymbol
  // ];

  // const logic = context.updateLogicMap.get(path.normalize(this.resourcePath))!;
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
  data = RawUpdater.update(data, [inserChange]);

  return data;
}
