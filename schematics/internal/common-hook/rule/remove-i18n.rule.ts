import { Tree } from '@angular-devkit/schematics';
import { Change, CssSelectorForTs, DeleteChange } from 'cyia-code-util';
import ts from 'typescript';
import { createTsSelector } from '../../util/create-selector';
import { removeExportNamed } from '../../util/remove-export-named';
import { updateFile } from '../../util/update-file';

export function removeI18nRuleFactory() {
  return (tree: Tree) => {
    const commonPath = `src/library/common/src/common.ts`;
    updateFile(
      commonPath,
      removeInCommon(createTsSelector(commonPath)(tree))
    )(tree);
    const pipePath = `src/library/common/src/pipes/index.ts`;

    updateFile(pipePath, removeInPipe(createTsSelector(pipePath)(tree)))(tree);
  };
}

function removeInCommon(selector: CssSelectorForTs) {
  const changeList: Change[] = [];
  const exportList = selector.queryAll(
    `ExportDeclaration[moduleSpecifier*="i18n"]`
  ) as ts.ExportDeclaration[];
  exportList.forEach((item) => {
    changeList.push(new DeleteChange(item.pos, item.end - item.pos));
  });

  changeList.push(
    removeExportNamed(
      selector,
      selector.queryOne(`ExportDeclaration[moduleSpecifier*="./pipes/index"]`),
      'I18nSelectPipe',
      'DATE_PIPE_DEFAULT_TIMEZONE'
    )
  );
  return changeList;
}
function removeInPipe(selector: CssSelectorForTs) {
  const changeList: Change[] = [];
  changeList.push(
    removeExportNamed(
      selector,
      selector.queryOne(`ExportDeclaration NamedExports`),
      'I18nSelectPipe',
      'DecimalPipe'
    )
  );
  const exportList = selector.queryOne(
    `ArrayLiteralExpression`
  ) as ts.ArrayLiteralExpression;

  changeList.push(
    new DeleteChange(
      exportList.elements[9].end,
      exportList.elements[11].end - exportList.elements[9].end
    )
  );
  const importList = selector.queryAll(
    `ImportDeclaration[moduleSpecifier*="i18n"]`
  );
  importList.forEach((item) => {
    changeList.push(new DeleteChange(item.pos, item.end - item.pos));
  });
  return changeList;
}
