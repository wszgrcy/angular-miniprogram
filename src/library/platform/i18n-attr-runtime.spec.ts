/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { getPageRefreshContext } from './default/component-template-hook.factory';
import { LVIEW } from './default/lview-layout';
import { initMiniProgramTestEnv } from './test-util/init-env';

/**
 * `i18n-*` 属性的半运行时验收。
 *
 * ## 值落在哪
 *
 * 带插值的 `i18n-alt` 由 `ɵɵi18nAttributes` + `ɵɵi18nApply` 在运行时写回，
 * 走的是 **`setProperty`**，所以值在元素 AgentNode 的 `property` 上，
 * 而 `lViewToWXView` 对元素槽本来就会序列化 `property` —— 运行时这条路
 * 不需要新代码，需要的是构建侧把 `ɵɵi18nAttributes` 那个声明槽数对。
 *
 * 纯静态的 `i18n-title` 走 `setAttribute`（译文烘进 consts，建元素时写），
 * 落在 `attribute` 上，不占声明槽。
 *
 * ## 改属性同样要标脏组件自己的视图
 *
 * 见 `icu-runtime.spec.ts` 顶部那条坑。
 */

@Component({
  selector: 'i18n-attr',
  standalone: true,
  template: `<img i18n-alt="照片 {{ name }}" alt="photo {{ name }}" />
    <span>尾巴</span>`,
})
class AttrComponent {
  name = '世界';
}

@Component({
  selector: 'i18n-attr-static',
  standalone: true,
  template: `<img i18n-title="标题" title="Settings" /><span>尾巴</span>`,
})
class StaticAttrComponent {}

@Component({
  selector: 'i18n-attr-two',
  standalone: true,
  // prettier-ignore
  // 单行：折行会引入空白文本节点，把下标搅乱
  template: `<img i18n-alt="照片 {{ name }}" alt="photo {{ name }}" i18n-title="标 {{ name }}" title="t {{ name }}" /><span>尾巴</span>`,
})
class TwoAttrComponent {
  name = '世界';
}

describe('i18n 属性半运行时', () => {
  beforeEach(() => initMiniProgramTestEnv());

  function componentLView(fixture: any): any[] {
    const hostLView = (fixture.componentRef.hostView as any)._lView;
    const nested = hostLView[LVIEW.HEADER_OFFSET];
    return Array.isArray(nested) ? nested : hostLView;
  }

  function render(fixture: any): any[] {
    return (getPageRefreshContext(componentLView(fixture) as never) as any)
      .nodeList;
  }

  /** 直接取某个槽上的 AgentNode，`attribute` 不进 nodeList，只能这么看 */
  function agentAt(fixture: any, slot: number): any {
    return componentLView(fixture)[LVIEW.HEADER_OFFSET + slot];
  }

  function show(cmp: any, props: Record<string, unknown> = {}): any {
    const fixture: any = TestBed.createComponent(cmp);
    Object.assign(fixture.componentInstance, props);
    fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();
    return fixture;
  }

  it('带插值的 i18n 属性写进 property，且后续节点不被顶偏', () => {
    const fixture = show(AttrComponent, { name: '世界' });
    const list = render(fixture);
    // 0=img, 1=属性 TI18n, 2=span, 3=文本
    expect(list[0]?.property?.alt).toBe('photo 世界');
    expect(
      list[3]?.value,
      'img 之后还有 `ɵɵi18nAttributes` 一个槽，span 及其文本必须整体后移',
    ).toBe('尾巴');
  });

  it('换值后属性跟着更新', () => {
    const fixture = show(AttrComponent, { name: '甲' });
    expect(render(fixture)[0]?.property?.alt).toBe('photo 甲');
    fixture.componentInstance.name = '乙';
    fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();
    expect(render(fixture)[0]?.property?.alt).toBe('photo 乙');
  });

  it('多个 i18n 属性只多占一个槽', () => {
    const list = render(show(TwoAttrComponent, { name: '世界' }));
    expect(list[0]?.property).toEqual({
      alt: 'photo 世界',
      title: 't 世界',
    });
    expect(list[3]?.value).toBe('尾巴');
  });

  it('纯静态 i18n 属性走 setAttribute，不占声明槽', () => {
    const fixture = show(StaticAttrComponent);
    // 译文（没装翻译包时就是源文案）由建元素时 setAttribute 写，落在
    // AgentNode.attribute 上；nodeList 只序列化 class/style/property，
    // 静态属性由 wxml 直接内联，所以这里看 AgentNode。
    expect(agentAt(fixture, 0).attribute.title).toBe('Settings');
    // wxml 把静态 i18n 属性写成 `{{nodeList[i].attribute.title}}` 的绑定，
    // 所以它必须出现在序列化结果里，否则渲染出来是空
    expect(render(fixture)[0]?.attribute).toEqual({ title: 'Settings' });
    // 没有多余的 TI18n 槽：span 在 1，文本在 2
    const list = render(fixture);
    // span 自己没碰 class / style，空串不发，所以它就是一个空元素槽
    expect(list[1]).toEqual({ property: {}, attribute: {} });
    expect(list[2]?.value).toBe('尾巴');
  });
});
