/**
 * wxml 具名模板分块（平衡匹配）
 *
 * ## 为什么不能用正则
 *
 * 之前用 `/<template name="x">[\s\S]*?<\/template>/g` 去切具名模板，
 * 但 wxml 里具名模板**可以嵌套**：
 *
 *   <template name="Case_18_Template">
 *     <view>
 *       <template name="Case_18_Conditional_1_Template"> ... </template>
 *     </view>
 *   </template>
 *
 * 非贪婪的 `*?` 会在**第一个** `</template>` 处停下，于是外层模板的
 * 闭合标签 `</block></view></template>` 残留在"根区"里，把不属于根视图
 * 的 nodeList 下标算了进来——这正是 ControlFlowComponent 根块校验
 * 失败的成因。
 *
 * 必须做**标签深度平衡**的扫描，而不是正则。
 */

export interface WxmlBlock {
  /** 具名模板名；根区用 '__root__' */
  name: string;
  /** 该块自身的内容（不含外层 <template> 标签） */
  content: string;
}

const OPEN_TAG = /<template\b[^>]*\bname="([^"]+)"[^>]*>/g;
const ANY_OPEN = /<template\b/g;
const CLOSE = /<\/template>/g;

/**
 * 把 wxml 拆成：所有**顶层**具名模板块 + 根区。
 *
 * 嵌套的具名模板会随其外层块一起返回（作为 content 的一部分），
 * 不再单独拆出来——因为嵌套块的下标空间属于其父块渲染上下文，
 * 混进顶层反而会造成根区污染。
 */
export function splitWxmlTopLevelBlocks(wxml: string): WxmlBlock[] {
  const blocks: WxmlBlock[] = [];
  const skipRanges: [number, number][] = [];

  OPEN_TAG.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = OPEN_TAG.exec(wxml)) !== null) {
    const start = m.index;
    // 若该起点已被前一个块覆盖（即嵌套），跳过——由父块带走
    if (skipRanges.some(([s, e]) => start > s && start < e)) {
      continue;
    }
    const contentStart = start + m[0].length;

    // 从 contentStart 起做标签深度平衡
    let depth = 1;
    let i = contentStart;
    while (i < wxml.length && depth > 0) {
      ANY_OPEN.lastIndex = i;
      CLOSE.lastIndex = i;
      const o = ANY_OPEN.exec(wxml);
      const c = CLOSE.exec(wxml);

      if (o && (!c || o.index < c.index)) {
        depth += 1;
        i = o.index + o[0].length;
      } else if (c) {
        depth -= 1;
        if (depth === 0) {
          blocks.push({
            name: m[1],
            content: wxml.slice(contentStart, c.index),
          });
          // 整块标记为已覆盖
          skipRanges.push([start, c.index + c[0].length]);
          i = c.index + c[0].length;
          // 同步 OPEN_TAG 游标，避免再匹配到嵌套的定义
          if (OPEN_TAG.lastIndex < i) {
            OPEN_TAG.lastIndex = i;
          }
          break;
        }
        i = c.index + c[0].length;
      } else {
        break; // 没有更多标签，异常结构，收工
      }
    }
  }

  // 根区：移除所有顶层具名模板块后的剩余
  let root = '';
  let cursor = 0;
  const sorted = [...skipRanges].sort((a, b) => a[0] - b[0]);
  for (const [s, e] of sorted) {
    root += wxml.slice(cursor, s);
    cursor = e;
  }
  root += wxml.slice(cursor);
  blocks.push({ name: '__root__', content: root });

  return blocks;
}

/** 内容里引用的所有 nodeList 下标 */
export function nodeListIndices(content: string): Set<number> {
  const s = new Set<number>();
  for (const m of content.matchAll(/nodeList\[(\d+)\]/g)) {
    s.add(Number(m[1]));
  }
  return s;
}

/**
 * 提取「下标 → 承载该下标的 wxml 标签」。
 *
 * wxml 里每个可渲染元素都带 `class="{{nodeList[i].class}}"`，
 * 该元素的标签名就是这个下标在 wxml 侧的**类型**。
 *
 * 用途：与 Angular `ɵɵelementStart(i, tag)` 的 tag（经映射）交叉校验，
 * 抓住「下标对但节点类型错」——纯下标断言抓不到这类问题。
 */
export function wxmlTagsByIndex(content: string): Map<number, string> {
  const map = new Map<number, string>();
  // 开标签：标签名 + 属性区（属性值里的引号内容不吞掉 `>`）
  const tagRe = /<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(content)) !== null) {
    const tag = m[1];
    const attrs = m[2];
    const idx = /nodeList\[(\d+)\]\.class/.exec(attrs);
    if (idx) {
      const n = Number(idx[1]);
      // 同一 index 若出现多次（如 wx:for 包裹），保留首个承载元素
      if (!map.has(n)) {
        map.set(n, tag);
      }
    }
  }
  return map;
}
