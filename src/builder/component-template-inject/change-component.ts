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

  const ɵcmpNodeList = selector.queryAll(
    `BinaryExpression[left$=ɵcmp]`
  ) as ts.BinaryExpression[];
  if (!componentNodeList.length && !ɵcmpNodeList.length) {
    return undefined;
  }
  const isLibrary = ɵcmpNodeList.length > 0 && componentNodeList.length === 0;
  const changeList: Change[] = [];
  for (const componentNode of isLibrary ? ɵcmpNodeList : componentNodeList) {
    const ɵcmpNode = isLibrary
      ? (componentNode as ts.BinaryExpression)
      : (selector.queryOne(
          componentNode,
          `PropertyDeclaration[name=ɵcmp]`
        ) as ts.BinaryExpression);
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
    componentName: isLibrary
      ? (
          ɵcmpNodeList[0].left as ts.PropertyAccessExpression
        ).expression.getText()
      : componentNodeList[0].name!.getText(),
  };
}
