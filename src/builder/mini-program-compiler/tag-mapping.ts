/**
 * HTML 标签 → 小程序标签 的映射（**唯一真相源**）
 *
 * 之前这个映射内联在 `parse-node/element.ts` 的 `getTagName()` 里。
 * 抽出来的原因：等价性测试需要用它来交叉校验「Angular 指令里的标签」
 * 与「wxml 里承载该下标的标签」是否一致。若测试自己再写一份，
 * 两边各自漂移就失去意义了。
 *
 * `element.ts` 与本模块必须走同一套规则，且有单测锁住。
 */

/** 这些 HTML 标签在小程序里统一渲染成 `view` */
const VIEW_TAGS = /^(div|p|h1|h2|h3|h4|h5|h6|span)$/;

/**
 * 把 Angular 模板里的标签映射成 wxml 里应出现的标签。
 *
 * 与 `parse-node/element.ts` 的 `getTagName()` 语义一致：
 *   div / p / h1..h6 / span → view
 *   ng-container            → block
 *   其余（含自定义组件标签）  → 原样
 */
export function mapAngularTagToWxml(tag: string): string {
  if (VIEW_TAGS.test(tag)) {
    return 'view';
  }
  if (tag === 'ng-container') {
    return 'block';
  }
  return tag;
}

/**
 * 文本节点在 wxml 里没有承载元素（是内联文本），
 * 不参与「标签 vs 下标承载体」的比对。
 */
export function isTextInstruction(instruction: string): boolean {
  return instruction === 'text' || instruction === 'domText';
}
