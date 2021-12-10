import {
  SchematicContext,
  Tree,
  chain,
  forEach,
} from '@angular-devkit/schematics';
import { getAngularSubDirRuleFactory } from '../rule/get-angular-sub-dir.rule';
import { CommonHookOptions } from '../type';
import { changeStructuralDirectiveRuleFactory } from './rule/change-structual-directive.rule';
import { mergeSourceRuleFactory } from './rule/merge-source.rule';
import { removeNgComponentOutletRuleFactory } from './rule/remove-ng-component-outlet.rule';

export default function (options: CommonHookOptions) {
  options.schematicPath = __dirname;
  return (tree: Tree, context: SchematicContext) => {
    return chain([
      getAngularSubDirRuleFactory(options),
      mergeSourceRuleFactory(options),
      changeStructuralDirectiveRuleFactory(options),
      removeNgComponentOutletRuleFactory(),
      forEach((entry) => {
        if (
          entry.path.startsWith('/src/library/common') &&
          entry.path.endsWith('.ts')
        ) {
          return {
            content: Buffer.from(
              entry.content
                .toString()
                .replace(/@angular\/common/g, `angular-miniprogram/common`)
            ),
            path: entry.path,
          };
        }
        return entry;
      }),
    ]);
  };
}
