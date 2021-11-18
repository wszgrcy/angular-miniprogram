import { InsertChange, TsChange, createCssSelectorForTs } from 'cyia-code-util';
import * as path from 'path';
import * as ts from 'typescript';
import * as webpack from 'webpack';
import { ExportMiniProgramAssetsPluginSymbol } from '../const';
import { RawUpdater } from '../util/raw-updater';
import { ComponentTemplateLoaderContext } from './type';

export default async function (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const componentɵcmpNode = selector.queryOne(
    `BinaryExpression[left$=ɵcmp]`
  ) as ts.BinaryExpression;
  if (!componentɵcmpNode) {
    callback(undefined, data, map);
    return;
  }
  const templateNode = selector.queryOne(
    componentɵcmpNode,
    `CallExpression ObjectLiteralExpression PropertyAssignment[name=template]`
  ) as ts.PropertyAssignment;
  const initIfNode = selector.queryOne(
    templateNode,
    `IfStatement[expression="rf & 1"]`
  ) as ts.IfStatement;
  if (!initIfNode) {
    callback(undefined, data, map);
    return;
  }
  const updateIfNode = selector.queryOne(
    templateNode,
    `IfStatement[expression="rf & 2"]`
  ) as ts.IfStatement;
  const initBlock = initIfNode.thenStatement as ts.Block;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context: ComponentTemplateLoaderContext = (this._compilation! as any)[
    ExportMiniProgramAssetsPluginSymbol
  ];
  const meta = (await context.metaMapPromise).get(
    path.normalize(this.resourcePath)
  )!;
  const initContent = `amp.pageBind(ctx);`;
  const change = new TsChange(sf);
  const extraMetaChange = change.insertNode(
    componentɵcmpNode,
    `;${componentɵcmpNode.left.getText()}ExtraMeta=${meta}`,
    'end'
  );
  const initInsertChange = change.insertNode(
    initBlock.statements[initBlock.statements.length - 1],
    initContent,
    'end'
  );
  let updateInsertChange: InsertChange;
  const changeList = [
    initInsertChange,
    new InsertChange(0, `import * as amp from 'angular-miniprogram';\n`),
    extraMetaChange,
  ];
  const updateContent = `amp.propertyChange(ctx);`;
  if (updateIfNode) {
    const updateBlock = updateIfNode.thenStatement as ts.Block;
    updateInsertChange = change.insertNode(
      updateBlock.statements[updateBlock.statements.length - 1],
      `;${updateContent}`,
      'end'
    );
  } else {
    updateInsertChange = change.insertNode(
      initIfNode,
      `if(rf & 2){${updateContent}}`,
      'end'
    );
  }
  changeList.push(updateInsertChange);
  data = RawUpdater.update(data, changeList);
  callback(undefined, data);
}
