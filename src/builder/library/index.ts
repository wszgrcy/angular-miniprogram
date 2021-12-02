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
import { join, resolve } from 'path';
import { Observable, from, of } from 'rxjs';
import { catchError, mapTo, switchMap } from 'rxjs/operators';
import { ngPackagrFactory } from './ng-packagr-factory';

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
      let tsConfig: string | undefined;

      if (options.tsConfig) {
        tsConfig = resolve(root, options.tsConfig);
      }
      const packager = await ngPackagrFactory(
        resolve(root, options.project),
        tsConfig
      );

      const projectName = context.target?.project;
      if (!projectName) {
        throw new Error('The builder requires a target.');
      }

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
