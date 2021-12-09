import {
  MergeStrategy,
  Tree,
  apply,
  chain,
  filter,
  forEach,
  mergeWith,
  move,
  template,
  url,
} from '@angular-devkit/schematics';
import path from 'path';
import { FormsHookOptions } from '../../type';
import {
  ANGULAR_COMMON_PATH,
  SCHEMATICS_ANGULAR_COMMON_PATH,
  SCHEMATICS_COMMON_LIBRARY_PATH,
} from '../const';

export function mergeSourceRuleFactory(options: FormsHookOptions) {
  return (tree: Tree) => {
    const angularFormsSource = apply(
      url(path.relative(options.schematicPath, ANGULAR_COMMON_PATH)),
      [
        filter((path) => {
          return path.endsWith('.ts') && !path.startsWith('/test');
        }),
        move(SCHEMATICS_COMMON_LIBRARY_PATH),
      ]
    );
    return chain([
      // filter((file) => !file.startsWith(SCHEMATICS_COMMON_LIBRARY_PATH)),
      mergeWith(angularFormsSource, MergeStrategy.Overwrite),
    ]);
  };
}
