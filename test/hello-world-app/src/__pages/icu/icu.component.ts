import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';

/**
 * ICU 样例页面。
 *
 * ICU 由 Angular 原生 `ɵɵi18n` 在运行时渲染，`select` 与 `plural` 都支持
 * （分支选择走 Angular 自己的 `getCurrentICUCaseIndex`，不区分两者编码）。
 *
 * 覆盖点：
 * - 分支内插值（`{{count}}` 这类占位符）
 * - `other` 兜底、`plural` 的 `=N` 精确匹配
 * - 嵌套 ICU（消息里以 `<!--\uFFFDn\uFFFD-->` 注释形式出现）
 * - 分支插值里带管道（额外占用声明槽位）
 * - 控制流里的 ICU
 * - `i18n-*` 属性：动态那半（`i18n-alt`）多发一条 `ɵɵi18nAttributes`，
 *   占一个独立声明槽；静态那半（`i18n-title`）烘进 consts，不占槽
 *
 * ⚠️ ICU 前后的空白会被并进消息本体，所以带 ICU 的那行**不能折行**。
 *
 * 已知不支持：分支里带标签（`<b>他</b>`）——i18n 分支解析要真 HTML 解析器，
 * 小程序没有，标签会被当文本、渲染出来丢结构。
 */
@Component({
  standalone: true,
  imports: [DecimalPipe],
  selector: 'app-icu',
  templateUrl: './icu.component.html',
})
export class IcuComponent {
  count = 3;
  gender = 'female';
  show = true;
}
