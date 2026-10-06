import { template } from 'es-toolkit/compat';

/**
 * 库模板渲染：把库构建产出的 **`${}` 插值模板串** 渲染成目标平台文本。
 *
 * 渲染引擎是 `es-toolkit/compat` 的 `template`，只是把分隔符自定义成 `${x}`。
 *
 * ## 为什么是 `${}`
 *
 * 库构建期不知道目标平台（wx / zfb / bd / qq…），凡平台相关的地方都得留成
 * 「待填」。这就是插值问题 —— 插值有现成实现，不该自己造。
 *
 * 选 `${}` 而不是 `{{}}`：**wxml 自己就用 `{{ }}`**。若拿 `{{}}` 当我们的
 * 分隔符，库模板里那些 `{{hasLoad}}` / `{{nodeList[0].class}}` 会被当成待填
 * 变量吃掉，只能靠转义绕。`${}` 和 wxml 井水不犯河水，**一个转义都不需要**。
 *
 * ## 语法
 *
 * ```
 * ${directivePrefix}                → wx / a / …
 * ${eventListConvert(["tap"])}      → bind:tap / onTap
 * ${fileExtname.contentTemplate}    → .wxml / .axml
 * ```
 *
 * wxml 自己的插值 `{{hasLoad}}` 是**静态文本**，原样进出。
 *
 * ## 分隔符配置里必须知道的坑（均实测）
 *
 * 我们只要「插值」这一个能力，lodash 的另外两个分隔符必须盖掉：
 *
 *   - `<%- x %>` → HTML 转义，把 wxml 属性里的 `<` `&` 改成实体
 *   - `<% x %>`  → **构建期执行任意 JS**
 *
 * 但盖掉它们有个陷阱：**替换正则必须恰好带 1 个捕获组**。
 * lodash 把三个正则并成一个交替式，靠「第几个捕获组命中」区分三者；
 * 写成 `/(?!)/g`（0 组）会让组号整体左移，`interpolate` 的捕获落到
 * `escape` 位上，于是我们的插值被 `_.escape` 转义。
 * 见下面 `NEVER` 的注释。
 */

/** 平台可提供的文件扩展名键。 */
export type MpFileExtnameKey =
  | 'style'
  | 'logic'
  | 'content'
  | 'contentTemplate';

/** 主构建侧提供的平台值，用来填插值。 */
export interface LibraryTemplateValues {
  directivePrefix: string;
  fileExtname: Record<MpFileExtnameKey, string>;
  eventListConvert: (events: string[]) => string;
}

/**
 * 永不匹配，但**带 1 个捕获组**。
 *
 * 为什么不能写成 `/(?!)/g`：lodash 会把 escape / interpolate / evaluate
 * 三个正则**并成一个交替式**，靠「第几个捕获组命中」来区分三者。
 * `/(?!)/g` 捕获组是 0 个，组号会整体左移，`interpolate` 的捕获就落到
 * `escape` 位上 —— 于是我们的插值被 `_.escape` 做了 HTML 转义。
 *
 * 所以约束是：**恰好 1 个捕获组，且永不匹配**。开头的空组 `()` 就是为了
 * 凑这个组，它永远捕获到空串。
 */
const NEVER: RegExp = /()(?!)/g;

const TEMPLATE_OPTIONS = {
  /** 唯一真正干活的：我们的 `${x}` 插值。 */
  interpolate: /\$\{([\s\S]+?)\}/g,
  /**
   * 以下两项在真实模板里命中次数恒为 0，生成码里也不会出现任何调用。
   * 它们存在的唯一目的是**盖掉 lodash 默认分隔符**（实测，不盖则）：
   *   - `<%- x %>` → HTML 转义，污染 wxml 属性
   *   - `<% x %>`  → **构建期执行任意 JS**
   */
  escape: NEVER,
  evaluate: NEVER,
};

/**
 * 我们允许的插值形状（封闭集），与 `LibraryTransform` /
 * `LibraryBuildPlatform` 的产出严格一一对应。
 */
const KNOWN_PLACEHOLDER =
  /\$\{(?:directivePrefix|fileExtname\.(?:style|logic|content|contentTemplate)|eventListConvert\(\s*\[[^\]]*\]\s*\))\}/g;

/**
 * 渲染前预检：源码里每一个 `${` 都必须属于已知形状。
 *
 * 为什么不能只靠「未定义变量会 ReferenceError」：
 *   - `${Math.random()}` 之类能逃到全局，**静默**渲染出一个数
 *   - `${100}` 是合法表达式，用户 wxml 里的字面 `${100}` 会被**静默**求值
 * 这两种都不响。所以先把已知占位符摘掉，残留的 `${` 一律视为不同步，直接抛。
 */
function assertKnownPlaceholders(source: string): void {
  const residue = source.replace(KNOWN_PLACEHOLDER, '');
  const at = residue.indexOf('${');
  if (at !== -1) {
    throw new Error(
      `[library-template] 模板里存在未登记的插值：` +
        `${JSON.stringify(residue.slice(at, at + 40))}。` +
        `允许的只有：\${directivePrefix}、` +
        `\${fileExtname.style|logic|content|contentTemplate}、` +
        `\${eventListConvert([...])}。` +
        `库与主构建的插槽集合不同步，请检查版本。`,
    );
  }
}

/**
 * 建一个绑定目标平台的渲染器。编译结果按模板源码缓存，同一份模板只编译一次。
 */
export function createLibraryTemplateRenderer(
  values: LibraryTemplateValues,
): (source: string) => string {
  const cache = new Map<string, (data: unknown) => string>();

  return (source: string): string => {
    if (typeof source !== 'string') {
      throw new TypeError(
        `[library-template] 模板必须是字符串，收到 ${typeof source}`,
      );
    }
    let compiled = cache.get(source);
    if (!compiled) {
      // 预检在编译之前：来路不明的 ${ 要响，不能让它静默求值
      assertKnownPlaceholders(source);
      compiled = template(source, TEMPLATE_OPTIONS) as (
        data: unknown,
      ) => string;
      cache.set(source, compiled);
    }
    return compiled(values);
  };
}

/**
 * 一步渲染：库模板串 + 目标平台值 → 目标平台文本。
 *
 * 批量渲染同一平台时优先用 `createLibraryTemplateRenderer`，可复用编译缓存。
 */
export function renderLibraryTemplate(
  source: string,
  values: LibraryTemplateValues,
): string {
  return createLibraryTemplateRenderer(values)(source);
}
