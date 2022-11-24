import {
  Change,
  InsertChange,
  TsChange,
  createCssSelectorForTs,
} from 'cyia-code-util';
import * as ts from 'typescript';
import { RawUpdater } from '../util';

export function changeComponent(data: string) {
  const sf = ts.createSourceFile('', data, ts.ScriptTarget.Latest, true);
  const selector = createCssSelectorForTs(sf);
  const componentNodeList = selector
    .queryAll(`ClassDeclaration`)
    .filter((item) =>
      selector.queryOne(item, `PropertyDeclaration[name=ɵcmp]`)
    ) as ts.ClassDeclaration[];

  if (!componentNodeList.length) {
    return undefined;
  }
  const changeList: Change[] = [];
  for (const componentNode of componentNodeList) {
    const ɵcmpNode = selector.queryOne(
      componentNode,
      `PropertyDeclaration[name=ɵcmp]`
    ) as ts.BinaryExpression;
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
    const change = new TsChange(sf);

    let updateInsertChange: InsertChange;
    changeList.push(
      new InsertChange(0, `import * as amp from 'angular-miniprogram';\n`)
    );
    changeList.push(
      new InsertChange(0, `import * as ampNgCore from '@angular/core';\n`)
    );
    const updateIfNode = selector.queryOne(
      templateNode,
      `IfStatement[expression="rf & 2"]`
    ) as ts.IfStatement;
    const updateContent = `amp.propertyChange(ampNgCore.ɵɵgetCurrentView());`;
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
    componentName: componentNodeList[0].name!.getText(),
  };
}
