import {
  MergeStrategy,
  Tree,
  apply,
  chain,
  filter,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';
import path from 'path';
import { FormsHookOptions } from '../../type';
import { ANGULAR_COMMON_PATH, SCHEMATICS_COMMON_LIBRARY_PATH } from '../const';

const filterFileList = ['i18n_plural_pipe.ts', 'i18n_select_pipe.ts'];
export function mergeSourceRuleFactory(options: FormsHookOptions) {
  return (tree: Tree) => {
    const angularFormsSource = apply(
      url(path.relative(options.schematicPath, ANGULAR_COMMON_PATH)),
      [
        // todo 过滤掉所有i18n文件
        filter((path) => {
          return path.endsWith('.ts') && !path.startsWith('/test');
        }),
        // filter((path) => {
        //   return !path.includes('i18n/');
        // }),
        // filter((path) => {
        //   return !filterFileList.some((item) => path.includes(item));
        // }),
        move(SCHEMATICS_COMMON_LIBRARY_PATH),
      ]
    );
    return chain([mergeWith(angularFormsSource, MergeStrategy.Overwrite)]);
  };
}
