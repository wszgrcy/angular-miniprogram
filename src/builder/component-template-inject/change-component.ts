import {
  Change,
  InsertChange,
  TsChange,
  createCssSelectorForTs,
} from 'cyia-code-util';
import * as ts from 'typescript';
import { RawUpdater } from '../util/raw-updater';

export function changeComponent(data: string) {
  const sf = ts.createSourceFile('', data, ts.ScriptTarget.Latest, true);
  const selector = createCssSelectorForTs(sf);
  const ɵcmpNodeList = selector.queryAll(
    `BinaryExpression[left$=ɵcmp]`
  ) as ts.BinaryExpression[];
  if (!ɵcmpNodeList.length) {
    return undefined;
  }
  const changeList: Change[] = [];
  for (const ɵcmpNode of ɵcmpNodeList) {
    const templateNode = selector.queryOne(
      ɵcmpNode,
      `CallExpression ObjectLiteralExpression PropertyAssignment[name=template]`
    ) as ts.PropertyAssignment;
    const initIfNode = selector.queryOne(
      templateNode,
      `IfStatement[expression="rf & 1"]`
    ) as ts.IfStatement;
    if (!initIfNode) {
      continue;
    }
    const initBlock = initIfNode.thenStatement as ts.Block;
    const change = new TsChange(sf);
    const initInsertChange = change.insertNode(
      initBlock.statements[initBlock.statements.length - 1],
      `;amp.pageBind(ctx);`,
      'end'
    );
    let updateInsertChange: InsertChange;
    changeList.push(
      new InsertChange(0, `import * as amp from 'angular-miniprogram';\n`),
      initInsertChange
    );
    const updateIfNode = selector.queryOne(
      templateNode,
      `IfStatement[expression="rf & 2"]`
    ) as ts.IfStatement;
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
  }
  return {
    content: RawUpdater.update(data, changeList),
    // todo library可否支持同文件多组件
    componentName: (
      ɵcmpNodeList[0].left as ts.PropertyAccessExpression
    ).expression.getText(),
  };
}
