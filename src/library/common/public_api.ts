/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * `angular-miniprogram/common` —— 薄再导出层。
 *
 * ## 为什么不再 vendor
 *
 * 以前这个 entry point 由 `npm run sync`（code-recycle）从 angular/angular
 * 同步整份 `packages/common`（约 16600 行）。但那些改动经实测**全部不必要**：
 *
 *   - DOCUMENT：官方 22 的 `@angular/common` 本身就是
 *     `import { DOCUMENT } from '@angular/core'` 再导出，同一个 token。
 *     `ɵsetDocument()` 天然覆盖，「必须重定根」不成立。
 *     （磁盘上那个 `new InjectionToken` 的 dom_tokens.ts 是 17.3.1
 *     那次 sync 的 stale 残留，v22 已无此模块所以没被覆盖。）
 *
 *   - zone.js：官方 22 里 `zone.js` 出现 0 次，无需剥离。
 *
 *   - `__templateName` 注入：实测 `tView.declTNode ===
 *     TemplateRef._declarationTContainer`（同一个 TNode），
 *     在 fork 自己的 `lViewToWXView` 里用
 *     `declTNode.localNames[0]` 即可等价取得，不必改 4 个指令。
 *
 *   - 删 i18n / NgComponentOutlet：那是「摘除不支持的东西」，
 *     不影响平台正确性；小程序里不用即可。
 *
 * 所以直接依赖 `@angular/common`，本文件只做转发，对外 API 不变。
 */
export * from '@angular/common';
