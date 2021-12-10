import { Tree } from '@angular-devkit/schematics';
import { CssSelectorForTs, DeleteChange } from 'cyia-code-util';
import ts from 'typescript';
import { createTsSelector } from '../../util/create-selector';
import { updateFile } from '../../util/update-file';

export function removeNgComponentOutletRuleFactory() {
  return (tree: Tree) => {
    const commonPath = `src/library/common/src/common.ts`;
    updateFile(
      commonPath,
      removeInCommon(createTsSelector(commonPath)(tree))
    )(tree);
    const indexPath = `src/library/common/src/directives/index.ts`;
    updateFile(
      indexPath,
      removeInIndex(createTsSelector(indexPath)(tree))
    )(tree);
  };
}
function removeInCommon(selector: CssSelectorForTs) {
  const ngTemplateOutletExport = selector.queryOne(
    `ExportSpecifier[name=NgTemplateOutlet]`
  ) as ts.ExportSpecifier;
  const ngComponentOutletExport = selector.queryOne(
    `ExportSpecifier[name=NgComponentOutlet]`
  ) as ts.ExportSpecifier;
  const list = [];
  list.push(
    new DeleteChange(
      ngTemplateOutletExport.end,
      ngComponentOutletExport.end - ngTemplateOutletExport.end
    )
  );
  return list;
}

function removeInIndex(selector: CssSelectorForTs) {
  const exportNgClassNode = selector.queryOne(`ExportSpecifier[name=NgClass]`);
  const exportNgComponentOutletNode = selector.queryOne(
    `ExportSpecifier[name=NgComponentOutlet]`
  );
  const list = [];
  list.push(
    new DeleteChange(
      exportNgClassNode.end,
      exportNgComponentOutletNode.end - exportNgClassNode.end
    )
  );
  const importNode = selector.queryOne(
    `ImportDeclaration[moduleSpecifier="'./ng_component_outlet'"]`
  );
  list.push(new DeleteChange(importNode.pos, importNode.end - importNode.pos));
  const exportList = selector.queryOne(
    `ArrayLiteralExpression`
  ) as ts.ArrayLiteralExpression;
  list.push(
    new DeleteChange(
      exportList.elements[0].end,
      exportList.elements[1].end - exportList.elements[0].end
    )
  );
  return list;
}
