import { InsertChange, TsChange, createCssSelectorForTs } from 'cyia-code-util';
import * as ts from 'typescript';
import { RawUpdater } from '../util/raw-updater';

export function changeComponent(data: string, meta: Record<string, any>) {
  const sf = ts.createSourceFile('', data, ts.ScriptTarget.Latest, true);
  const selector = createCssSelectorForTs(sf);
  const componentɵcmpNode = selector.queryOne(
    `BinaryExpression[left$=ɵcmp]`
  ) as ts.BinaryExpression;
  if (!componentɵcmpNode) {
    return undefined;
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
    return undefined;
  }
  const updateIfNode = selector.queryOne(
    templateNode,
    `IfStatement[expression="rf & 2"]`
  ) as ts.IfStatement;
  const initBlock = initIfNode.thenStatement as ts.Block;

  const initContent = `amp.pageBind(ctx);`;
  const change = new TsChange(sf);
  const extraMetaChange = change.insertNode(
    componentɵcmpNode,
    `;${componentɵcmpNode.left.getText()}ExtraMeta=${JSON.stringify(meta)}`,
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
  return {
    content: RawUpdater.update(data, changeList),
    componentName: (
      componentɵcmpNode.left as ts.PropertyAccessExpression
    ).expression.getText(),
  };
}
