import { join, normalize } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { HookOptions } from '../type';
import { cloneSpecifiedDir } from '../util/clone-specified-dir';

export function getAngularSubDirRuleFactory(options: HookOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const dirs = tree.getDir(
      join(normalize(options.sourceInSchematicsPath), options.subDir)
    );
    if (dirs.subdirs.length && dirs.subfiles.length) {
      return;
    }
    await cloneSpecifiedDir(options);
  };
}
