/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * 拆 Angular 的「带命名空间元素名」（`:ns:name` 形态）。
 *
 * 本 fork 只用到这一个函数：模板里没有真正的命名空间元素，
 * 但 `createCssSelector` 需要把 `:svg:circle` 这类名字拆开。
 * 其余 Angular 原有的标签工具（isNgContainer / getNsPrefix 等）
 * 在小程序链路上没有调用点，已删。
 */
export function splitNsName(elementName: string): [string | null, string] {
  if (elementName[0] != ':') {
    return [null, elementName];
  }

  const colonIndex = elementName.indexOf(':', 1);

  if (colonIndex === -1) {
    throw new Error(
      `Unsupported format "${elementName}" expecting ":namespace:name"`,
    );
  }

  return [elementName.slice(1, colonIndex), elementName.slice(colonIndex + 1)];
}
