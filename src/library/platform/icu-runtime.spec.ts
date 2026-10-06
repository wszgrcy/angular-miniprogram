/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { getPageRefreshContext } from './default/component-template-hook.factory';
import { LVIEW } from './default/lview-layout';
import { initMiniProgramTestEnv } from './test-util/init-env';

/**
 * ICU 的半运行时验收。
 *
 * ## 为什么必须走半运行时
 *
 * ICU 的文案不在构建产物里 —— `ɵɵi18n` 到运行时才把分支建成节点，挂在
 * expando 下标上。构建期测试（下标等价性）只能证明「槽位对得上」，
 * 证明不了「槽里填的是当前分支的文字」。只有真实 lView 能回答。
 *
 * ## 断言的对象
 *
 * 取 `getPageRefreshContext` 的产物，也就是真正喂给 `setData` 的那份
 * `nodeList`。wxml 在那个位置读的就是 `nodeList[i].value`。
 *
 * ## 改完属性必须标脏组件自己的视图
 *
 * 同 `renderer-class-style.spec.ts` 记的那个坑：`fixture.detectChanges()`
 * 只保证刷宿主视图，组件视图没标脏就整个跳过。必须从**组件 injector**
 * 取 `ChangeDetectorRef`。少了这步，「切分支不更新」会被误当成 ICU 的 bug。
 */

@Component({
  selector: 'icu-basic',
  standalone: true,
  template: `<p>{gender, select, male {他} female {她} other {TA}}</p>`,
})
class BasicComponent {
  gender = 'other';
}

@Component({
  selector: 'icu-interp',
  standalone: true,
  template: `<p>{count, plural, =1 {一条} other {{{count}} 条}}</p>`,
})
class InterpComponent {
  count = 0;
}

@Component({
  selector: 'icu-inline',
  standalone: true,
  template: `<p>前 {g, select, m {他} other {TA}} 后</p>`,
})
class InlineComponent {
  g = 'other';
}

@Component({
  selector: 'icu-two',
  standalone: true,
  template: `<p>{g, select, m {甲}}</p>
    <p>{h, select, m {乙}}</p>`,
})
class TwoComponent {
  g = 'm';
  h = 'm';
}

@Component({
  selector: 'icu-nested',
  standalone: true,
  // prettier-ignore
  // 必须单行：ICU 前后的空白会被并进消息本体，折行就变成渲染出 " 一个 "。
  template: `<p>{a, select, x {{b, plural, one {一个} other {{{b}} 个}}} other {n}}</p>`,
})
class NestedComponent {
  a = 'x';
  b = 1;
}

@Component({
  selector: 'icu-mixed',
  standalone: true,
  template: `<p>共</p>
    <p>{g, select, m {他} other {TA}}</p>
    <p>条</p>`,
})
class MixedComponent {}

describe('ICU 半运行时', () => {
  beforeEach(() => {
    initMiniProgramTestEnv();
  });

  function componentLView(fixture: any): any[] {
    const hostLView = (fixture.componentRef.hostView as any)._lView;
    const nested = hostLView[LVIEW.HEADER_OFFSET];
    return Array.isArray(nested) ? nested : hostLView;
  }

  /** 喂给 setData 的那份 nodeList */
  function render(fixture: any): any[] {
    return (getPageRefreshContext(componentLView(fixture) as never) as any)
      .nodeList;
  }

  /**
   * 按 wxml 的口径把模板渲染结果拼出来。
   *
   * 元素槽带 `class`/`style`、文本槽带 `value`，wxml 就是逐槽内联的，
   * 所以拼起来只看 `value` 即等价于页面上看到的文字。
   */
  function renderedText(fixture: any): string {
    return render(fixture)
      .map((n: any) => (typeof n?.value === 'string' ? n.value : ''))
      .join('');
  }

  /** 标脏**组件自己的**视图，否则第二次 detectChanges 是空转 */
  function refresh(fixture: any) {
    fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();
  }

  function show(cmp: any, props: Record<string, unknown> = {}): any {
    const fixture: any = TestBed.createComponent(cmp);
    Object.assign(fixture.componentInstance, props);
    refresh(fixture);
    return fixture;
  }

  it('select：按取值选分支', () => {
    expect(renderedText(show(BasicComponent, { gender: 'male' }))).toBe('他');
    expect(renderedText(show(BasicComponent, { gender: 'female' }))).toBe('她');
    expect(renderedText(show(BasicComponent, { gender: 'other' }))).toBe('TA');
    // 未列举的取值必须落到 other，而不是渲染成空
    expect(renderedText(show(BasicComponent, { gender: 'zzz' }))).toBe('TA');
  });

  it('select 换分支后不留旧分支残字', () => {
    const fixture = show(BasicComponent, { gender: 'male' });
    expect(renderedText(fixture)).toBe('他');

    fixture.componentInstance.gender = 'other';
    refresh(fixture);
    expect(
      renderedText(fixture),
      'Angular 不会把旧分支节点从 lView 摘掉，只按当前分支下标取才会干净',
    ).toBe('TA');
  });

  it('plural：=N 精确匹配与 other 兜底', () => {
    expect(renderedText(show(InterpComponent, { count: 1 }))).toBe('一条');
    expect(renderedText(show(InterpComponent, { count: 3 }))).toBe('3 条');
    expect(renderedText(show(InterpComponent, { count: 0 }))).toBe('0 条');
  });

  it('plural 换值后同步', () => {
    const fixture = show(InterpComponent, { count: 1 });
    expect(renderedText(fixture)).toBe('一条');
    fixture.componentInstance.count = 12;
    refresh(fixture);
    expect(renderedText(fixture)).toBe('12 条');
  });

  it('ICU 前后的文字各占一槽，拼接后完整', () => {
    expect(renderedText(show(InlineComponent, { g: 'm' }))).toBe('前 他 后');
    expect(renderedText(show(InlineComponent, { g: 'other' }))).toBe(
      '前 TA 后',
    );
  });

  it('同模板多个 ICU 各填各的槽', () => {
    expect(renderedText(show(TwoComponent))).toBe('甲乙');
  });

  it('嵌套 ICU 只走活跃分支', () => {
    expect(renderedText(show(NestedComponent, { a: 'x', b: 1 }))).toBe('一个');
    expect(renderedText(show(NestedComponent, { a: 'x', b: 5 }))).toBe('5 个');
    expect(renderedText(show(NestedComponent, { a: 'zzz', b: 5 }))).toBe('n');
  });

  it('嵌套 ICU 换值后同步', () => {
    const fixture = show(NestedComponent, { a: 'x', b: 1 });
    expect(renderedText(fixture)).toBe('一个');
    fixture.componentInstance.b = 7;
    refresh(fixture);
    expect(renderedText(fixture)).toBe('7 个');
  });

  it('ICU 与普通元素混排互不干扰', () => {
    expect(renderedText(show(MixedComponent))).toBe('共TA条');
  });
});
