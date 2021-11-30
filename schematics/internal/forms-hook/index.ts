import { SchematicContext, Tree } from '@angular-devkit/schematics';

export default function () {
  return (tree: Tree, context: SchematicContext) => {
    console.log('测试调用');
  };
}
