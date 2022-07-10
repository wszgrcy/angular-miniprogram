import fs from 'fs-extra';
import { transformFromPromise } from 'ng-packagr/lib/graph/transform';
import { WRITE_PACKAGE_TRANSFORM } from 'ng-packagr/lib/ng-package/entry-point/write-package.di';
import {
  EntryPointNode,
  isEntryPointInProgress,
} from 'ng-packagr/lib/ng-package/nodes';
import { NgPackagrOptions } from 'ng-packagr/lib/ng-package/options.di';
import path from 'path';
import { of } from 'rxjs';

const oldFactory = WRITE_PACKAGE_TRANSFORM.useFactory;
export function hookWritePackage() {
  WRITE_PACKAGE_TRANSFORM.useFactory = myWritePackage;
  return WRITE_PACKAGE_TRANSFORM;
}
function myWritePackage(options: NgPackagrOptions) {
  return transformFromPromise(async (graph) => {
    // todo 这里理论上不应该这么做,因为rxjs非同依赖会有一些小问题.但是不涉及到unsubscribe遇不到这些小问题,所以先这么做,未来再想办法
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await oldFactory(options)(of(graph) as any).toPromise();
    const entryPoint: EntryPointNode = graph.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isEntryPointInProgress() as any
    )!;
    if (!entryPoint.data.entryPoint.isSecondaryEntryPoint) {
      const packageJsonPath = path.resolve(
        entryPoint.data.entryPoint.destinationPath,
        'package.json'
      );
      const packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath).toString()
      );
      delete packageJson.scripts.prepublishOnly;
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, undefined, 2)
      );
    }
  });
}
