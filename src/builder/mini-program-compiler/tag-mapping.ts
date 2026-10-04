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

/**
 * 在小程序里统一渲染成 `view` 的 HTML 标签。
 *
 * 小程序只有 `view / text / image / button / input …` 这几个内置组件，
 * HTML 的语义标签直接写进 wxml 就是未知标签（不报错，但不渲染）。
 * 对齐 uni-app 的 `HTML_TO_MINI_PROGRAM_TAGS`：凡是语义上只是个
 * 「带样式的容器」的标签，一律落到 `view`。
 *
 * 不收录的：
 *   - `input` / `textarea` / `button` / `form` / `video` … 小程序同名组件，原样透传；
 *   - `a` / `select` / `option` 等：小程序对应物（`navigator` / `picker`）
 *     连属性名都不一样，静默换标签只会把错误藏得更深。
 */
const VIEW_TAGS = new Set<string>([
  // 块级 / 分区
  'div',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hgroup',
  'header',
  'footer',
  'main',
  'nav',
  'section',
  'article',
  'aside',
  'figure',
  'figcaption',
  'address',
  'blockquote',
  'details',
  'summary',
  'dialog',
  'fieldset',
  'legend',
  'iframe',
  'br',
  'hr',
  // 行内语义
  'span',
  'b',
  'strong',
  'i',
  'em',
  'u',
  's',
  'small',
  'mark',
  'code',
  'pre',
  'kbd',
  'samp',
  'var',
  'sub',
  'sup',
  'cite',
  'q',
  'abbr',
  'dfn',
  'time',
  'del',
  'ins',
  'bdi',
  'bdo',
  'ruby',
  'rp',
  'rt',
  'wbr',
  'output',
  // 列表
  'ul',
  'ol',
  'li',
  'dl',
  'dt',
  'dd',
  'menu',
  // 表格
  'table',
  'caption',
  'col',
  'colgroup',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
]);

/** 一对一改名：HTML 标签在小程序里有个名字不同但语义相同的组件 */
const TAG_RENAMES: Record<string, string> = {
  img: 'image',
};

/**
 * 把 Angular 模板里的标签映射成 wxml 里应出现的标签。
 *
 * 与 `parse-node/element.ts` 的 `getTagName()` 语义一致：
 *   VIEW_TAGS 里的标签      → view
 *   TAG_RENAMES 里的标签     → 对应的小程序组件
 *   ng-container            → block
 *   其余（含自定义组件标签）  → 原样
 */
export function mapAngularTagToWxml(tag: string): string {
  if (VIEW_TAGS.has(tag)) {
    return 'view';
  }
  if (tag === 'ng-container') {
    return 'block';
  }
  return TAG_RENAMES[tag] ?? tag;
}

/**
 * 「只在 HTML 里存在、wxml 里被换掉了」的标签名单。
 *
 * 样式产物要用它判 `div{}` 这类标签选择器在小程序里必然落空
 * （模板里那个位置已经是 `view` 了）。判定必须和 `mapAngularTagToWxml`
 * 同源，否则模板改了映射而样式告警还在按老名单走。
 */
export const HTML_ONLY_TAGS: ReadonlySet<string> = new Set<string>([
  ...VIEW_TAGS,
  ...Object.keys(TAG_RENAMES),
  'ng-container',
]);

/**
 * 文本节点在 wxml 里没有承载元素（是内联文本），
 * 不参与「标签 vs 下标承载体」的比对。
 */
export function isTextInstruction(instruction: string): boolean {
  return instruction === 'text' || instruction === 'domText';
}
