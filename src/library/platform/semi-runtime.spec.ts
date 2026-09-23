/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { getPageRefreshContext } from './default/component-template-hook.factory';
import { LVIEW } from './default/lview-layout';
import { initMiniProgramTestEnv } from './test-util/init-env';

@Component({
  selector: 'semi-cmp',
  standalone: true,
  template: `<div>
    hello<span>x</span>
    <p>y</p>
  </div>`,
})
class SemiComponent {}

/**
 * 半运行时测试：TestBed 真实创建组件 → 真实 lView → 真实 nodeList。
 *
 * ## 关键：要取「组件自己的视图」，不是宿主视图
 *
 * `componentRef.hostView._lView` 是**宿主视图**，它只有 1 个节点槽
 * （`bindingStartIndex - HEADER_OFFSET === 1`），组件真正的模板视图
 * 嵌在 `hostView._lView[HEADER_OFFSET]` 里，那里才有 decls 个节点。
 *
 * 取错视图会得到 nodeList.length === 1，看起来像「运行时少建节点」，
 * 其实只是取错了对象。
 */
describe('半运行时（TestBed）', () => {
  beforeEach(() => {
    initMiniProgramTestEnv();
  });

  /** 从 hostView 取出组件自己的 lView */
  function componentLView(fixture: any): any[] {
    const hostLView = (fixture.componentRef.hostView as any)._lView;
    const nested = hostLView[LVIEW.HEADER_OFFSET];
    return Array.isArray(nested) ? nested : hostLView;
  }

  it('组件视图的节点数应等于 decls（create pass 完整）', () => {
    const fixture = TestBed.createComponent(SemiComponent);
    fixture.detectChanges();

    const lView = componentLView(fixture);
    const tView = lView[1];
    const decls = (SemiComponent as any).ɵcmp.decls;
    const nodeCount = tView.bindingStartIndex - LVIEW.HEADER_OFFSET;

    console.log(
      `decls=${decls} bsi=${tView.bindingStartIndex} ` +
        `HEADER_OFFSET=${LVIEW.HEADER_OFFSET} nodeCount=${nodeCount}`
    );

    expect(nodeCount)
      .withContext(
        `节点数(${nodeCount}) 应等于模板声明(${decls})，否则 create pass 没跑完`
      )
      .toBe(decls);
  });

  it('getPageRefreshContext 产出的 nodeList 长度应等于节点数', () => {
    const fixture = TestBed.createComponent(SemiComponent);
    fixture.detectChanges();
    const lView = componentLView(fixture);
    const decls = (SemiComponent as any).ɵcmp.decls;

    const ctx: any = getPageRefreshContext(lView as any);
    expect(ctx.hasLoad).toBe(true);
    expect(ctx.nodeList.length)
      .withContext('nodeList 长度应等于模板节点数')
      .toBe(decls);
  });

  it('nodeList 每一项都应是真实渲染出来的节点（非空占位）', () => {
    const fixture = TestBed.createComponent(SemiComponent);
    fixture.detectChanges();
    const lView = componentLView(fixture);
    const ctx: any = getPageRefreshContext(lView as any);

    const empty: number[] = [];
    ctx.nodeList.forEach((item: any, i: number) => {
      if (!item || Object.keys(item).length === 0) {
        empty.push(i);
      }
    });
    expect(empty)
      .withContext(`这些下标产出了空节点，说明运行时没渲染到`)
      .toEqual([]);
  });
});
