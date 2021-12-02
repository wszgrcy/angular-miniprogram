import * as path from 'path';
import { ngPackagrFactory } from '../src/builder/library/ng-packagr-factory';
async function main() {
  let packagr = await ngPackagrFactory(
    path.resolve(process.cwd(), './src/library/ng-package.json'),
    path.resolve(process.cwd(), './tsconfig.library.json')
  );

  await packagr.build();
}
main();
