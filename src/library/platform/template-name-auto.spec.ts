/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * #5 模板名魔法字符串内部化 —— 自动推导来源验证。
 *
 * `lViewToWXView` 计算容器项 `__templateName` 的表达式是：
 *   context.__templateName || lView[1].declTNode.localNames[0] || null
 *
 * 本 spec 证明：`createEmbeddedView(tpl)` **不传 `__templateName`** 时，
 * 第一项（context）为空，名字必然来自第二项（模板声明名 `#autoTpl`）。
 * 即用户不再需要手写 `__templateName` 魔法字符串。
 *
 * 与 lview-to-node-list.spec（证明 lViewToWXView 读的就是这些槽）串起来，
 * 整条「声明名 → wxml template is」链路闭合。
 */
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { LVIEW } from './default/lview-layout';
import { initMiniProgramTestEnv } from './test-util/init-env';

@Component({
  selector: 'probe-auto',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-template #autoTpl let-greeting="greeting">
      <span>{{ greeting }}</span>
    </ng-template>
  `,
})
class ProbeAutoComponent {
  @ViewChild('autoTpl') autoTpl!: TemplateRef<any>;
}

describe('#5 createEmbeddedView 不传 __templateName 的自动推导来源', () => {
  beforeEach(() => initMiniProgramTestEnv());

  it('context 无 __templateName，名字来自声明名 autoTpl', () => {
    const fixture = TestBed.createComponent(ProbeAutoComponent);
    fixture.detectChanges();

    const tpl: any = fixture.componentInstance.autoTpl;
    // 只传普通上下文，绝不传 __templateName
    const viewRef: any = tpl.createEmbeddedView({ greeting: 'hi' } as any);
    const lView: any[] = viewRef._lView;

    const fromContext = lView[LVIEW.CONTEXT]?.__templateName;
    const fromDecl = lView[1]?.declTNode?.localNames?.[0];

    // 第一项为空 → 名字只能来自声明名
    expect(fromContext)
      .withContext('context 不应带 __templateName')
      .toBeUndefined();
    expect(fromDecl)
      .withContext('声明名应自动推导为 autoTpl')
      .toBe('autoTpl');

    // 模拟 lViewToWXView 的取值表达式，结果必须是 autoTpl
    const resolved = fromContext || fromDecl || null;
    expect(resolved).toBe('autoTpl');
  });

  it('显式传 __templateName 时仍以 context 优先（向后兼容）', () => {
    const fixture = TestBed.createComponent(ProbeAutoComponent);
    fixture.detectChanges();
    const tpl: any = fixture.componentInstance.autoTpl;
    const viewRef: any = tpl.createEmbeddedView({
      greeting: 'hi',
      __templateName: 'customName',
    } as any);
    const lView: any[] = viewRef._lView;
    const resolved =
      lView[LVIEW.CONTEXT]?.__templateName ||
      lView[1]?.declTNode?.localNames?.[0] ||
      null;
    expect(resolved).toBe('customName');
  });
});
