/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { CssSelector } from './selector';
import { splitNsName } from './tags';

/**
 * Creates a `CssSelector` given a tag name and a map of attributes
 */
export function createCssSelector(
  elementName: string,
  attributes: { [name: string]: string }
): CssSelector {
  const cssSelector = new CssSelector();
  const elementNameNoNs = splitNsName(elementName)[1];

  cssSelector.setElement(elementNameNoNs);

  Object.getOwnPropertyNames(attributes).forEach((name) => {
    const nameNoNs = splitNsName(name)[1];
    const value = attributes[name];

    cssSelector.addAttribute(nameNoNs, value);
    if (name.toLowerCase() === 'class') {
      const classes = value.trim().split(/\s+/);
      classes.forEach((className) => cssSelector.addClassName(className));
    }
  });

  return cssSelector;
}
