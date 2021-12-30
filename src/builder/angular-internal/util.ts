/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type * as t from '@angular/compiler/src/render3/r3_ast';

/**
 * Extract a map of properties to values for a given element or template node, which can be used
 * by the directive matching machinery.
 *
 * @param elOrTpl the element or template in question
 * @return an object set up for directive matching. For attributes on the element/template, this
 * object maps a property name to its (static) value. For any bindings, this map simply maps the
 * property name to an empty string.
 */
export function getAttrsForDirectiveMatching(elOrTpl: t.Element): {
  [name: string]: string;
} {
  const attributesMap: { [name: string]: string } = {};

  elOrTpl.attributes.forEach((a: { name: string; value: string }) => {
    if (!isI18nAttribute(a.name)) {
      attributesMap[a.name] = a.value;
    }
  });

  elOrTpl.inputs.forEach((i: { name: string | number }) => {
    attributesMap[i.name] = '';
  });
  elOrTpl.outputs.forEach((o: { name: string | number }) => {
    attributesMap[o.name] = '';
  });

  return attributesMap;
}

/** Name of the i18n attributes **/
export const I18N_ATTR = 'i18n';
export const I18N_ATTR_PREFIX = 'i18n-';

export function isI18nAttribute(name: string): boolean {
  return name === I18N_ATTR || name.startsWith(I18N_ATTR_PREFIX);
}
