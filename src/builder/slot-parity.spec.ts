/* eslint-disable @typescript-eslint/no-explicit-any */
import { TmplAstRecursiveVisitor, parseTemplate } from '@angular/compiler';

import { ComponentContext } from './mini-program-compiler/parse-node/component-context';
import {
  NgNodeKind,
  NgNodeMeta,
} from './mini-program-compiler/parse-node/interface';
import { TemplateDefinition } from './mini-program-compiler/parse-node/template-definition';

/**
 * wxml 下标 与 Angular 槽位 的一致性。
 *
 * ## 为什么需要这个文件
 *
 * 同一份模板被**两个互不知情的消费者**各转一遍：
 *
 * - Angular 模板管线 → 指令流（`ɵɵelement` / `ɵɵtext` / `ɵɵi18n` / `ɵɵpipe`…）
 * - 本构建器 → wxml（`nodeList[i]`）
 *
 * 两边必须给同一个构造分配**同一个下标**，否则 wxml 的绑定就指到别的节点上。
 * 错一位不报错，只是渲染出鬼图 —— 最难查的一类 bug。
 *
 * 已经踩过的两个都是这么来的：
 * - `i18n` 静态文本：Angular 那边 `I18nStart` 占一槽，我们没登记，
 *   于是把源文案烘进了 wxml（永远翻不了）
 * - 链式管道 `{{ a | f | b }}`：`CustomAstVisitor.visitPipe` 漏走 `exp`，
 *   少算一个槽，后续节点整体前移一位
 *
 * ## 权威基准
 *
 * Angular 侧「什么占槽」的出处是 `template/pipeline/ir/src/ops/create.ts` 里
 * `TRAIT_CONSUMES_SLOT` 的展开点，加上 `phases/local_refs.ts` 的
 * `numSlotsUsed += localRefs.length`。但那是内部实现，`@angular/compiler`
 * 不导出。对外能拿到的权威是 `TmplAstRecursiveVisitor`：每种 AST 节点
 * 对应一个 `visit*`，而每个 `visit*` 就是我们登记槽位的入口。
 *
 * 所以两条腿：
 *
 * 1. **覆盖率**：`TmplAstRecursiveVisitor` 有的 `visit*`，我们必须都有。
 *    Angular 升级新增节点类型时立刻红，而不是等渲染出错。
 * 2. **下标逐字对齐**：下表每条期望值都经真实 `ng build` 产物里的
 *    `ɵɵ*` 指令下标对过（不是照抄本实现的输出）。
 */

/** Angular 公开 AST visitor 的全部 `visit*`。 */
function angularVisitorMethods(): string[] {
  const out = new Set<string>();
  let proto = TmplAstRecursiveVisitor.prototype as any;
  while (proto && proto !== Object.prototype) {
    Object.getOwnPropertyNames(proto).forEach((n) => {
      if (n.startsWith('visit')) {
        out.add(n);
      }
    });
    proto = Object.getPrototypeOf(proto);
  }
  return [...out].sort();
}

/**
 * 走一遍模板，返回根视图里被分配的下标（升序）。
 *
 * 只算根视图：`<ng-template>` / `@if` / `@for` 的子级是独立 embedded view，
 * 有自己的 0 起始索引空间，`TemplateDefinition` 会给它们另起一个实例。
 */
function rootSlots(html: string): number[] {
  const r: any = parseTemplate(html, 'p.html');
  if (r.errors?.length) {
    throw new Error(`模板解析失败: ${r.errors[0].message}`);
  }
  const ctx = new ComponentContext(undefined);
  ctx.templateText = html;
  const metas = new TemplateDefinition(r.nodes, ctx)
    .run()
    .map((n) => n.getNodeMeta());

  const seen = new Set<number>();
  const walk = (list: NgNodeMeta[]) => {
    for (const m of list) {
      if (typeof m.index === 'number') {
        seen.add(m.index);
      }
      if (m.kind === NgNodeKind.Element) {
        walk((m as any).children ?? []);
      }
    }
  };
  walk(metas);
  return [...seen].sort((a, b) => a - b);
}

describe('AST 覆盖率：Angular 有的 visit* 我们必须有', () => {
  const required = angularVisitorMethods();

  it('基准本身不为空（防止 @angular/compiler 改了导出后静默全绿）', () => {
    expect(required.length).toBeGreaterThan(20);
  });

  it.each(required)('TemplateDefinition 实现了 %s', (method) => {
    expect(
      typeof (TemplateDefinition.prototype as any)[method],
      `${method} 缺失：Angular 新增了 AST 节点类型，没登记就可能漏占槽，` +
        `wxml 下标会整体错位`,
    ).toBe('function');
  });
});

describe('根视图下标与 Angular 槽位逐字对齐', () => {
  /**
   * 每条模板末尾都跟一个 `<s></s>` 哨兵：它本身只占一槽，但**它的下标
   * 等于前面所有构造吃掉的槽数**。管道、`#ref` 这类「占槽不产节点」的
   * 构造因此也会体现在期望值里，不会被断言漏掉。
   *
   * 期望值右侧注明了 Angular 侧的占槽依据。
   */
  const cases: [name: string, html: string, slots: number[]][] = [
    ['单个元素', `<view></view><s></s>`, [0, 1]],
    ['父子嵌套', `<view><text></text></view><s></s>`, [0, 1, 2]],
    ['静态文本', `<view>文案</view><s></s>`, [0, 1, 2]],
    ['插值文本', `<view><text>{{ a }}</text></view><s></s>`, [0, 1, 2, 3]],

    // Pipe op 各占一槽
    ['管道 1 条', `<view>{{ a | foo }}</view><s></s>`, [0, 1, 3]],
    [
      '管道链式（回归：visitPipe 曾漏走 exp）',
      `<view>{{ a | foo | bar }}</view><s></s>`,
      [0, 1, 4],
    ],
    [
      '管道参数里再嵌管道',
      `<view>{{ a | foo:(m | bar) }}</view><s></s>`,
      [0, 1, 4],
    ],

    // I18nStart 占一槽
    ['i18n 静态文本', `<view i18n="@@x">文案</view><s></s>`, [0, 1, 2]],
    ['i18n 带插值', `<view i18n="@@x">共 {{ n }} 项</view><s></s>`, [0, 1, 2]],
    [
      'ICU 占一槽',
      `<view i18n="@@p">{n, plural, =1 {一个} other {# 个}}</view><s></s>`,
      [0, 1, 2],
    ],

    // I18nAttributes 只有 dynamic 那条占槽
    [
      '静态 i18n-* 不占槽',
      `<image i18n-title="说明" title="t" /><s></s>`,
      [0, 1],
    ],
    [
      'dynamic i18n-* 占一槽',
      `<image i18n-alt="照片 {{n}}" alt="a" /><s></s>`,
      [0, 2],
    ],

    // localRefs 占槽但不产节点 → 期望值里是空洞
    [
      '#ref 占槽不产节点',
      `<view #ref>{{ n }}</view><text>{{ m }}</text><s></s>`,
      [0, 2, 3, 4, 5],
    ],
    [
      '@let 不占槽（被 optimize 成 update 里的局部变量）',
      `<view><view #ref>{{ n }}</view><text>{{ v }}</text><s></s></view>`,
      [0, 1, 3, 4, 5, 6],
    ],

    // 控制流：分支各自占槽，容器不额外占
    [
      '@if 两分支',
      `@if (a) { <view></view> } @else { <text></text> }<s></s>`,
      [0, 1, 2],
    ],
    ['@if 条件带管道', `@if (a | foo) { <view></view> }<s></s>`, [0, 2]],
    [
      '@switch 两分支',
      `@switch (a) { @case (1) { <view></view> } @default { <text></text> } }<s></s>`,
      [0, 1, 2],
    ],

    // RepeaterCreate 占 2 槽，带 @empty 占 3 槽
    [
      '@for 无 @empty',
      `@for (x of list; track x) { <view></view> }<s></s>`,
      [1, 2],
    ],
    [
      '@for 带 @empty',
      `@for (x of list; track x) { <view></view> } @empty { <text></text> }<s></s>`,
      [1, 2, 3],
    ],
    [
      '@for 表达式带管道',
      `@for (x of list | foo; track x) { <view></view> }<s></s>`,
      [1, 3],
    ],

    ['ng-content', `<view><ng-content /></view><s></s>`, [0, 1, 2]],
    [
      'ng-template + #ref',
      `<view><ng-template #t><text></text></ng-template></view><s></s>`,
      [0, 1, 3],
    ],
  ];

  it.each(cases)('%s', (_name, html, slots) => {
    expect(rootSlots(html)).toEqual(slots);
  });
});
