import { SchematicContext, Tree, chain } from '@angular-devkit/schematics';
import { getAngularFormsRuleFactory } from './rule/get-angular-forms.rule';
import { mergeSourceRuleFactory } from './rule/merge-source.rule';
import { FormsHookOptions } from './type';

export default function (options: FormsHookOptions) {
  options.schematicPath = __dirname;
  return (tree: Tree, context: SchematicContext) => {
    return chain([
      getAngularFormsRuleFactory(options),
      mergeSourceRuleFactory(options),
    ]);
  };
}
