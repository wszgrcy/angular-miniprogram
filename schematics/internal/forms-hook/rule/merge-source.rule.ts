import {
  MergeStrategy,
  Tree,
  apply,
  chain,
  filter,
  mergeWith,
  move,
  template,
  url,
} from '@angular-devkit/schematics';
import path from 'path';
import { FormsHookOptions } from '../../type';
import {
  ANGULAR_FORMS_PATH,
  SCHEMATICS_FORMS_LIBRARY_HOOK_FILE_LIST,
  SCHEMATICS_FORMS_LIBRARY_PATH,
} from '../const';

export function mergeSourceRuleFactory(options: FormsHookOptions) {
  return (tree: Tree) => {
    const localSourceMap = new Map<string, Buffer>();
    for (let i = 0; i < SCHEMATICS_FORMS_LIBRARY_HOOK_FILE_LIST.length; i++) {
      const filePath = SCHEMATICS_FORMS_LIBRARY_HOOK_FILE_LIST[i];
      if (tree.exists(filePath)) {
        localSourceMap.set(filePath, tree.read(filePath));
      }
    }
    const angularFormsSource = apply(
      url(path.relative(options.schematicPath, ANGULAR_FORMS_PATH)),
      [
        filter((path) => {
          return path.endsWith('.ts') && !path.startsWith('/test');
        }),
        filter((path) => {
          return !path.endsWith('.spec.ts');
        }),
        move(SCHEMATICS_FORMS_LIBRARY_PATH),
      ]
    );
    return chain([
      mergeWith(angularFormsSource, MergeStrategy.Overwrite),
      (tree) => {
        localSourceMap.forEach((content, filePath) => {
          tree.overwrite(filePath, content);
        });
      },
    ]);
  };
}
