/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 探针：不 patch NgTemplateOutlet，能否在 fork 自己的代码里
 * 从 viewRef 侧算出 wxml 需要的 __templateName。
 *
 * patch 读的是：
 *   this.ngTemplateOutlet._declarationTContainer.localNames[0]
 *
 * 候选替代（lViewToWXView 已持有 viewRef）：
 *   viewRef._lView[1].declTNode.localNames[0]
 *
 * 这里直接验证两者指向同一个 TNode —— 若同一，则取值必然相同，
 * patch 可用 fork 内一行替代。
 */
import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { LVIEW } from './default/lview-layout';
import { initMiniProgramTestEnv } from './test-util/init-env';

@Component({
  selector: 'probe-outlet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-template #alpha let-greeting="greeting"><span>A:{{ greeting }}</span></ng-template>
    <ng-template #beta><span>B</span></ng-template>
  `,
})
class ProbeOutletComponent {
  @ViewChild('alpha') alpha!: TemplateRef<any>;
  @ViewChild('beta') beta!: TemplateRef<any>;
}

describe('__templateName 推导：不 patch NgTemplateOutlet 的替代方案', () => {
  beforeEach(() => initMiniProgramTestEnv());

  it('#alpha 的 declTNode 与 _declarationTContainer 是同一个 TNode', () => {
    const fixture = TestBed.createComponent(ProbeOutletComponent);
    fixture.detectChanges();

    const tpl: any = fixture.componentInstance.alpha;
    const declT: any = tpl._declarationTContainer;

    // 用 TemplateRef 直接建一个 embedded view，拿它的 lView
    const viewRef: any = tpl.createEmbeddedView({} as any);
    const inner: any[] = viewRef._lView;
    const tView = inner[1];
    const declTNodeFromTView = tView?.declTNode;

    console.log(
      `patch取法 localNames[0] = ${JSON.stringify(declT?.localNames?.[0])}\n` +
        `tView.declTNode === _declarationTContainer ? ${declTNodeFromTView === declT}\n` +
        `tView.declTNode.localNames[0] = ${JSON.stringify(declTNodeFromTView?.localNames?.[0])}`
    );

    expect(declTNodeFromTView)
      .withContext('declTNode 应与 TemplateRef._declarationTContainer 同一')
      .toBe(declT);
    expect(declTNodeFromTView?.localNames?.[0]).toBe('alpha');
  });

  it('#beta 同样成立（排除偶然）', () => {
    const fixture = TestBed.createComponent(ProbeOutletComponent);
    fixture.detectChanges();

    const tpl: any = fixture.componentInstance.beta;
    const declT: any = tpl._declarationTContainer;
    const viewRef: any = tpl.createEmbeddedView({} as any);
    const declTNodeFromTView = viewRef._lView[1]?.declTNode;

    console.log(
      `beta: patch取法=${JSON.stringify(declT?.localNames?.[0])} ` +
        `lView推导=${JSON.stringify(declTNodeFromTView?.localNames?.[0])} ` +
        `同一=${declTNodeFromTView === declT}`
    );

    expect(declTNodeFromTView).toBe(declT);
    expect(declTNodeFromTView?.localNames?.[0]).toBe('beta');
  });

  it('反向对照：抹掉 localNames 后推导取不到名，证明校验有效', () => {
    const fixture = TestBed.createComponent(ProbeOutletComponent);
    fixture.detectChanges();

    const tpl: any = fixture.componentInstance.alpha;
    const viewRef: any = tpl.createEmbeddedView({} as any);
    const declTNode = viewRef._lView[1]?.declTNode;

    // 篡改：抹掉 localNames
    const saved = declTNode.localNames;
    declTNode.localNames = null;
    const tampered = declTNode?.localNames?.[0] ?? undefined;
    declTNode.localNames = saved;
    const restored = declTNode?.localNames?.[0];

    console.log(`反向: 抹掉后=${JSON.stringify(tampered)} 还原后=${JSON.stringify(restored)}`);
    expect(tampered)
      .withContext('抹掉 localNames 后仍推出名字，说明推导路径不对')
      .toBeUndefined();
    expect(restored).toBe('alpha');
  });
});
