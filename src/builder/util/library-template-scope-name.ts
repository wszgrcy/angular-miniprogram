import { strings } from '@angular-devkit/core';

export function libraryTemplateScopeName(library: string) {
  return strings.classify(library.replace(/[@/]/g, ''));
}
