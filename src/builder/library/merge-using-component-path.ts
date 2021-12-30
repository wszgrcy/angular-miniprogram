import { join, normalize, resolve } from '@angular-devkit/core';
import { UseComponent } from '../mini-program-compiler';
import { LIBRARY_OUTPUT_ROOTDIR } from './const';
import { getComponentOutputPath } from './get-library-path';

export function getUseComponents(
  libraryPath: UseComponent[],
  localPath: UseComponent[],
  moduleId: string
) {
  const list = [...libraryPath];
  list.push(
    ...localPath.map((item) => {
      item.path = getComponentOutputPath(moduleId, item.className);
      return item;
    })
  );
  return list.reduce((pre, cur) => {
    pre[cur.selector] = resolve(
      normalize('/'),
      join(normalize(LIBRARY_OUTPUT_ROOTDIR), cur.path)
    );
    return pre;
  }, {} as Record<string, string>);
}
