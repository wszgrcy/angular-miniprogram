/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { normalizeCacheOptions } from '@angular-devkit/build-angular/src/utils/normalize-cache';
import { COMPILE_NGC_TRANSFORM } from 'ng-packagr/lib/ng-package/entry-point/compile-ngc.di';
import { STYLESHEET_PROCESSOR } from 'ng-packagr/lib/styles/stylesheet-processor.di';
import { join, resolve } from 'path';
import { Observable, from, of } from 'rxjs';
import { catchError, mapTo, switchMap, tap } from 'rxjs/operators';
import { myCompileNgcTransformFactory } from './compile-ngc.transform';
import { hookWritePackage } from './remove-publish-only';
import { CustomStyleSheetProcessor } from './stylesheet-processor';
/**
 * @experimental Direct usage of this function is considered experimental.
 */
export function execute(
  options: any,
  context: BuilderContext
): Observable<BuilderOutput> {
  return from(
    (async () => {
      const root = context.workspaceRoot;
      const packager = (await import('ng-packagr')).ngPackagr();

      packager.forProject(resolve(root, options.project));

      if (options.tsConfig) {
        packager.withTsConfig(resolve(root, options.tsConfig));
      }

      const projectName = context.target?.project;
      if (!projectName) {
        throw new Error('The builder requires a target.');
      }
      COMPILE_NGC_TRANSFORM.useFactory = myCompileNgcTransformFactory;
      STYLESHEET_PROCESSOR.useFactory = () => CustomStyleSheetProcessor;
      packager.withProviders([COMPILE_NGC_TRANSFORM, hookWritePackage()]);

      const metadata = await context.getProjectMetadata(projectName);
      const { enabled: cacheEnabled, path: cacheDirectory } =
        normalizeCacheOptions(metadata, context.workspaceRoot);

      const ngPackagrOptions = {
        cacheEnabled,
        cacheDirectory: join(cacheDirectory, 'ng-packagr'),
      };

      return { packager, ngPackagrOptions };
    })()
  ).pipe(
    switchMap(({ packager, ngPackagrOptions }) =>
      options.watch
        ? packager.watch(ngPackagrOptions)
        : packager.build(ngPackagrOptions)
    ),
    mapTo({ success: true, workspaceRoot: context.workspaceRoot }),
    catchError((err) => of({ success: false, error: err.message }))
  );
}

export default createBuilder<Record<string, string> & any>(execute);
