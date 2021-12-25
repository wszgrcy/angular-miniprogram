import { CssSelectorForTs, DeleteChange } from 'cyia-code-util';
import ts from 'typescript';

export function removeExportNamed(
  selector: CssSelectorForTs,
  rangeNode: ts.Node,
  deleteNodeName: string,
  beforeNodeName: string
) {
  const beforeNode = selector.queryOne(
    rangeNode,
    `ExportSpecifier[name=${beforeNodeName}]`
  );
  const deleteNode = selector.queryOne(
    rangeNode,
    `ExportSpecifier[name=${deleteNodeName}]`
  );
  return new DeleteChange(beforeNode.end, deleteNode.end - beforeNode.end);
}
