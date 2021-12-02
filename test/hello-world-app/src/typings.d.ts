/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* SystemJS module definition */
import 'miniprogram-api-typings';
// declare var module: NodeModule;
interface NodeModule {
  id: string;
}
// declare interface Type<T> extends Function {
//   new (...args: any[]): T;
// }
// declare function ngStartPage<M, C>(module: Type<M>, component: Type<C>): C;
declare global {
  const ngDevMode: null | any;
}
