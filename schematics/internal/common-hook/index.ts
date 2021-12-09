import { SchematicContext, Tree, chain } from '@angular-devkit/schematics';
import { getAngularSubDirRuleFactory } from '../rule/get-angular-sub-dir.rule';
import { CommonHookOptions } from '../type';
import { mergeSourceRuleFactory } from './rule/merge-source.rule';

export default function (options: CommonHookOptions) {
  options.schematicPath = __dirname;
  return (tree: Tree, context: SchematicContext) => {
    return chain([
      getAngularSubDirRuleFactory(options),
      mergeSourceRuleFactory(options),
    ]);
  };
}
