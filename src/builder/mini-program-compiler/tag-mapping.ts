/**
 * HTML 标签 → 小程序标签的映射（唯一真相源）。
 * 等价性测试要用它交叉校验「Angular 指令里的标签」与「wxml 里承载该下标的标签」，
 * 所以测试不能自己再写一份。`element.ts` 与本模块走同一套规则，且有单测锁住。
 */

/**
 * 在小程序里统一渲染成 `view` 的 HTML 标签。HTML 的语义标签直接写进 wxml 就是未知标签
 * （不报错，但不渲染），凡是语义上只是个「带样式的容器」的标签一律落到 `view`。
 *
 * 不收录的：
 *   - `input` / `textarea` / `button` / `form` / `video` 等小程序同名组件，原样透传；
 *   - `a` / `select` / `option` 等：小程序对应物连属性名都不一样，静默换标签只会把错误藏得更深。
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
 * 把 Angular 模板里的标签映射成 wxml 里应出现的标签，与 `element.ts` 的 `getTagName()` 语义一致：
 *   VIEW_TAGS → view；TAG_RENAMES → 对应的小程序组件；ng-container → block；其余原样。
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
 * `tag-name-<原标签>` 标记的输出策略。用途是「标签被换掉了，但仍要按原名字选中它」。
 * - `mapped`（默认）：只在映射改写了标签时输出
 * - `all`：每个元素都输出
 * - `off`：一律不输出
 */
export type TagNameClassMode = 'mapped' | 'all' | 'off';

/**
 * 算出某个元素该带的 `tag-name-*` 标记，不需要则空串。
 * 由编译期决定而不是运行时补：运行时不知道映射，只能给每个节点都挂一份并靠数据通道运过去。
 */
export function tagNameClassOf(
  sourceTag: string,
  wxmlTag: string,
  mode: TagNameClassMode,
): string {
  if (mode === 'off') {
    return '';
  }
  if (mode === 'mapped' && wxmlTag === sourceTag) {
    return '';
  }
  return `tag-name-${sourceTag}`;
}

/**
 * 「只在 HTML 里存在、wxml 里被换掉了」的标签名单。样式产物用它判 `div{}` 这类标签选择器
 * 在小程序里必然落空。判定必须和 `mapAngularTagToWxml` 同源。
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
