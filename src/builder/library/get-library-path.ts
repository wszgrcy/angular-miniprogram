import { join, normalize } from '@angular-devkit/core';
import { camelize, dasherize } from '@angular-devkit/core/src/utils/strings';

export function getLibraryPath(entry: string, className: string) {
  return join(
    normalize(entry),
    dasherize(camelize(className)),
    dasherize(camelize(className))
  );
}
