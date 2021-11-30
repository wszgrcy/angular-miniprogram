import { ngPackagr } from 'ng-packagr';
import * as path from 'path';
import { provideTransform } from 'ng-packagr/lib/graph/transform.di';
import { WRITE_PACKAGE_TRANSFORM_TOKEN } from 'ng-packagr/lib/ng-package/entry-point/write-package.di';
import {
  NgPackagrOptions,
  OPTIONS_TOKEN,
} from 'ng-packagr/lib/ng-package/options.di';
import { transformFromPromise } from 'ng-packagr/lib/graph/transform';
import { hookWritePackage } from '../src/builder/library/remove-publish-only';
async function main() {
  let packagr = ngPackagr();
  packagr.forProject(
    path.resolve(process.cwd(), './src/library/ng-package.json')
  );
  packagr.withTsConfig(path.resolve(process.cwd(), './tsconfig.library.json'));
  packagr.withProviders([hookWritePackage()]);
  await packagr.build();
}
main();
