import { TestProjectHost } from '@angular-devkit/architect/testing';
import { join, json, normalize } from '@angular-devkit/core';
export const workspaceRoot = join(normalize(__dirname), `../hello-world-app/`);
export const host = new TestProjectHost(workspaceRoot);
import { BuilderHandlerFn } from '@angular-devkit/architect';
import { readFileSync } from 'fs';
import { BuilderHarness } from '@angular-devkit/build-angular/src/testing/builder-harness';
import {
  HarnessFileMatchers,
  expectFile,
} from '@angular-devkit/build-angular/src/testing/jasmine-helpers';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const optionSchemaCache = new Map<string, json.schema.JsonSchema>();

export function describeBuilder<T>(
  builderHandler: BuilderHandlerFn<T & json.JsonObject>,
  options: { name?: string; schemaPath: string },
  specDefinitions: (harness: JasmineBuilderHarness<T>) => void
): void {
  let optionSchema = optionSchemaCache.get(options.schemaPath);
  if (optionSchema === undefined) {
    optionSchema = JSON.parse(
      readFileSync(options.schemaPath, 'utf8')
    ) as json.schema.JsonSchema;
    optionSchemaCache.set(options.schemaPath, optionSchema);
  }
  const harness = new JasmineBuilderHarness<T>(builderHandler, host, {
    builderName: options.name,
    optionSchema,
  });

  describe(options.name || builderHandler.name, () => {
    beforeEach(() => host.initialize().toPromise());

    afterEach(() => host.restore().toPromise());

    specDefinitions(harness);
  });
}

class JasmineBuilderHarness<T> extends BuilderHarness<T> {
  expectFile(path: string): HarnessFileMatchers {
    return expectFile(path, this);
  }
}
