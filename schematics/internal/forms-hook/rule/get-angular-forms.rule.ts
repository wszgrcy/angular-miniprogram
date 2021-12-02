import { join, normalize } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import cp from 'child_process';
import { FormsHookOptions } from '../type';

export function getAngularFormsRuleFactory(options: FormsHookOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const dirs = tree.getDir(
      join(normalize(options.sourceInSchematicsPath), 'packages/forms')
    );
    if (dirs.subdirs.length && dirs.subfiles.length) {
      return;
    }
    cp.spawnSync('rm', ['-rf', options.savePath]);
    const gitClone = cp.spawn(
      'git',
      [
        'clone',
        '--filter=blob:none',
        '--no-checkout',
        '--sparse',
        options.source,
        '--depth',
        '1',
        '--branch',
        options.branch,
        options.savePath,
      ],
      {}
    );
    await new Promise((res) => {
      gitClone.on('close', (code) => {
        res(undefined);
      });
    });
    cp.spawnSync('git', ['sparse-checkout', 'set', 'packages/forms'], {
      cwd: options.savePath,
    });
    cp.spawnSync('git', ['checkout'], { cwd: options.savePath });
  };
}
