import {
  HTML_ONLY_TAGS,
  mapAngularTagToWxml,
} from '../mini-program-compiler/tag-mapping';

/**
 * 小程序端样式产物的兼容处理，三件事：
 *
 *  1. `@import` / `@charset` 置顶 —— 一个 wxss 由「样式文件 + 内联样式」多份
 *     拼接，`@import` 落在文件中间、`@charset` 不在首行，小程序都不认。
 *  2. `@import"x"` 补回空格 —— 压缩会把 `@import "x"` 的空格吃掉，支付宝不认。
 *  3. HTML 标签选择器告警 —— 模板里 `div` 已经渲染成 `view`，`div{}` 选不中
 *     任何东西。只告警不改写：换选择器是语义决策，编译器不替用户改语义。
 */
export interface MiniProgramStyleOptions {
  /** 告警通道，一般是 `context.logger.warn` 或 rollup 的 `this.warn` */
  warn?: (message: string) => void;
}

const MULTILINE_COMMENTS_RE = /\/\*[\s\S]*?\*\//g;
const blankReplacer = (s: string) => ' '.repeat(s.length);
/**
 * 注释换成等长空白：总长不变，所以在掩码上算出的下标可以直接切原文。
 */
function emptyCssComments(raw: string): string {
  return raw.replace(MULTILINE_COMMENTS_RE, blankReplacer);
}

/** `@import` 语句，允许带 media query 尾巴 */
const AT_IMPORT_RE =
  /@import\s*(?:url\([^)]*\)|"([^"]|(?<=\\)")*"|'([^']|(?<=\\)')*'|[^;]*).*?;/gm;
const AT_CHARSET_RE =
  /@charset\s*(?:"([^"]|(?<=\\)")*"|'([^']|(?<=\\)')*'|[^;]*).*?;/gm;
/** 压缩产物里 `@import"x"` 少了空格，支付宝不认 */
const IMPORT_WITHOUT_SPACE_RE = /@import(?=["'])/g;

/**
 * 找「前面是起始/空白/逗号/花括号、后面紧跟 `,` 或 `{`」的小程序不存在的标签。
 *
 * - 第一个分支整体吞掉注释（`match[1]` 为空即跳过），注释里的标签不会误报
 * - 要求标签后紧跟 `,` 或 `{`，所以 `.div` / `[data-div]` / `div.foo` 不会误报
 */
const HTML_TAG_SELECTOR_RE = new RegExp(
  `/\\*[\\s\\S]*?(?:\\*/|$)|(?:^|[\\s,}{])(${[...HTML_ONLY_TAGS].join('|')})\\s*(?=,|\\{)`,
  'g',
);

export function transformMiniProgramStyle(
  css: string,
  options: MiniProgramStyleOptions = {},
): string {
  if (!css) {
    return css;
  }
  warnHtmlTagSelectors(css, options.warn);
  return hoistAtRules(css.replace(IMPORT_WITHOUT_SPACE_RE, '@import '));
}

/**
 * `@import` 全部提到最前并保持原有相对顺序；`@charset` 只保留第一条且放在最前。
 */
function hoistAtRules(css: string): string {
  const cleanCss = emptyCssComments(css);
  const removals: [number, number][] = [];
  const imports: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = AT_IMPORT_RE.exec(cleanCss))) {
    removals.push([match.index, match.index + match[0].length]);
    imports.push(match[0]);
  }
  let charset = '';
  while ((match = AT_CHARSET_RE.exec(cleanCss))) {
    removals.push([match.index, match.index + match[0].length]);
    if (!charset) {
      charset = match[0];
    }
  }
  if (!removals.length) {
    return css;
  }
  // 摘掉原位的那几段，再把 charset / imports 按顺序拼回开头
  return `${charset}${imports.join('')}${removeRanges(css, removals)}`;
}

function removeRanges(css: string, ranges: [number, number][]): string {
  ranges.sort((a, b) => a[0] - b[0]);
  let out = '';
  let last = 0;
  for (const [start, end] of ranges) {
    out += css.slice(last, start);
    last = end;
  }
  return out + css.slice(last);
}

function warnHtmlTagSelectors(css: string, warn?: (message: string) => void) {
  if (!warn) {
    return;
  }
  HTML_TAG_SELECTOR_RE.lastIndex = 0;
  const reported = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = HTML_TAG_SELECTOR_RE.exec(css))) {
    const tag = match[1];
    // 注释分支没有捕获组，跳过
    if (!tag || reported.has(tag)) {
      continue;
    }
    reported.add(tag);
    warn(
      `样式里的 ${tag} 标签选择器在小程序里选不中任何元素` +
        `（模板里渲染成 ${mapAngularTagToWxml(tag)}），请改用 class 选择器`,
    );
  }
}
