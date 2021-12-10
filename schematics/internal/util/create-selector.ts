import { Tree } from '@angular-devkit/schematics';
import { createCssSelectorForTs } from 'cyia-code-util';
import ts from 'typescript';

export function createTsSelector(filePath: string) {
  return (tree: Tree) => {
    const sf = ts.createSourceFile(
      filePath,
      tree.read(filePath).toString(),
      ts.ScriptTarget.Latest,
      true
    );
    return createCssSelectorForTs(sf);
  };
}
