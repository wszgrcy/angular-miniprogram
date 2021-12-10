import { Tree } from '@angular-devkit/schematics';
import {
  Change,
  DeleteChange,
  InsertChange,
  ReplaceChange,
} from 'cyia-code-util';

export function updateFile(filePath: string, changeList: Change[]) {
  return (tree: Tree) => {
    const recorder = tree.beginUpdate(filePath);
    changeList
      .sort((a, b) => b.start - a.start)
      .forEach((change) => {
        if (change instanceof InsertChange) {
          recorder.insertRight(change.start, change.content);
        } else if (change instanceof ReplaceChange) {
          recorder.remove(change.start, change.length);
          recorder.insertRight(change.start, change.content);
        } else if (change instanceof DeleteChange) {
          recorder.remove(change.start, change.length);
        }
      });
    tree.commitUpdate(recorder);
  };
}
