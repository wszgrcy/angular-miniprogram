/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { getPageRefreshContext } from './default/component-template-hook.factory';
import { LVIEW } from './default/lview-layout';
import { initMiniProgramTestEnv } from './test-util/init-env';

@Component({
  selector: 'fb-child',
  standalone: true,
  template: `<ng-content>兜底{{ title }}</ng-content>
    <ng-content select="[slot='a']">A 兜底</ng-content>`,
})
class FallbackChildComponent {
  title = 'CHILD';
  cdr = inject(ChangeDetectorRef);
}

/** 两个插槽都不投影 */
@Component({
  selector: 'fb-h-none',
  standalone: true,
  imports: [FallbackChildComponent],
  template: `<fb-child></fb-child>`,
})
class HostNone {}

/** 只投影默认插槽 */
@Component({
  selector: 'fb-h-default',
  standalone: true,
  imports: [FallbackChildComponent],
  template: `<fb-child><span>外部内容</span></fb-child>`,
})
class HostDefault {}

/** 只投影具名插槽 */
@Component({
  selector: 'fb-h-named',
  standalone: true,
  imports: [FallbackChildComponent],
  template: `<fb-child><div slot="a">A 内容</div></fb-child>`,
})
class HostNamed {}

/**
 * 子组件模板 `<ng-content>A</ng-content><ng-content select="[slot='a']">B</ng-content>`
 * 的槽位：0=默认投影 1=默认兜底容器 2=具名投影 3=具名兜底容器。下面用 `Array.isArray` 兜底校验，
 * 一旦槽位漂移会立刻炸在这里。
 */
const DEFAULT_FALLBACK = 1;
const NAMED_FALLBACK = 3;

function isLView(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    typeof value[1] === 'object' &&
    value[1] !== null &&
    typeof (value[1] as any).bindingStartIndex === 'number'
  );
}

/** 宿主组件自己的视图（TestBed 的 hostView 外面还套一层根视图） */
function componentLView(fixture: any): any[] {
  return (fixture.componentRef.hostView as any)._lView[LVIEW.HEADER_OFFSET];
}

/** 宿主视图里第一个嵌套视图 = 子组件视图 */
function childLView(hostView: any[]): any[] {
  for (let i = LVIEW.HEADER_OFFSET; i < hostView.length; i++) {
    if (isLView(hostView[i])) {
      return hostView[i];
    }
  }
  throw new Error('没找到子组件视图');
}

function nodeList(lView: any[]): any[] {
  return JSON.parse(
    JSON.stringify(getPageRefreshContext(lView as never).nodeList),
  );
}

/**
 * 复刻 wxml 的分支判断。`wx-container.ts` 生成的是
 * `<block wx:if="{{nodeList[i].length}}">兜底</block><block wx:else><slot/></block>`，
 * 所以「这一格有没有视图」就是走哪条分支的唯一依据。
 */
function branchOf(list: any[], fallbackIndex: number): '兜底' | '投影' {
  const slot = list[fallbackIndex];
  if (!Array.isArray(slot)) {
    throw new Error(
      `nodeList[${fallbackIndex}] 不是容器（拿到 ${JSON.stringify(
        slot,
      )}），槽位与编译期对不上了`,
    );
  }
  return slot.length ? '兜底' : '投影';
}

/** 兜底容器里那份视图渲染出来的文本 */
function fallbackText(list: any[], fallbackIndex: number): string {
  return list[fallbackIndex][0].nodeList[0].value;
}

/** 视图里所有文本值，用来确认投影内容在不在 */
function textOf(list: any[]): string[] {
  return list.filter((v) => v && v.value !== undefined).map((v) => v.value);
}

describe('ng-content 兜底内容', () => {
  beforeEach(() => initMiniProgramTestEnv());

  describe('运行时分支（判据就是 nodeList）', () => {
    it('没写投影 → 走兜底，且兜底内容确实是子组件自己那份', () => {
      const fixture = TestBed.createComponent(HostNone);
      fixture.detectChanges();

      const list = nodeList(childLView(componentLView(fixture)));

      expect(branchOf(list, DEFAULT_FALLBACK)).toBe('兜底');
      expect(branchOf(list, NAMED_FALLBACK)).toBe('兜底');
      // 兜底那份视图里只有一个文本节点，内容来自子组件的 title
      expect(fallbackText(list, DEFAULT_FALLBACK)).toBe('兜底CHILD');
      expect(fallbackText(list, NAMED_FALLBACK)).toBe('A 兜底');
      // 模板名是 null，wxml 的 `is` 才会落到字面量 projectionFallback_N
      expect(list[DEFAULT_FALLBACK][0].__templateName).toBeNull();
    });

    it('有投影 → 走 slot，兜底容器一份视图都没有', () => {
      const fixture = TestBed.createComponent(HostDefault);
      fixture.detectChanges();

      const view = componentLView(fixture);
      const list = nodeList(childLView(view));
      const hostList = nodeList(view);

      expect(branchOf(list, DEFAULT_FALLBACK)).toBe('投影');
      // 兜底视图根本没创建，一个字节都没进 setData
      expect(list[DEFAULT_FALLBACK]).toEqual([]);
      // 投影内容在宿主的 nodeList 里，不在子组件这边
      expect(textOf(hostList)).toContain('外部内容');
    });

    it('两个插槽各走各的分支，互不牵连', () => {
      const fixture = TestBed.createComponent(HostNamed);
      fixture.detectChanges();

      const view = componentLView(fixture);
      const list = nodeList(childLView(view));
      const hostList = nodeList(view);

      // 具名插槽被投影 → 走 slot；默认插槽没被投影 → 走兜底
      expect(branchOf(list, NAMED_FALLBACK)).toBe('投影');
      expect(list[NAMED_FALLBACK]).toEqual([]);
      expect(branchOf(list, DEFAULT_FALLBACK)).toBe('兜底');
      expect(fallbackText(list, DEFAULT_FALLBACK)).toBe('兜底CHILD');
      expect(textOf(hostList)).toContain('A 内容');
    });
  });

  describe('兜底视图的绑定与刷新', () => {
    it('兜底里的插值跟着变更检测刷新（不是只烘一次）', () => {
      const fixture = TestBed.createComponent(HostNone);
      fixture.detectChanges();
      const child = childLView(componentLView(fixture));
      const childInstance = child[LVIEW.CONTEXT] as FallbackChildComponent;

      expect(fallbackText(nodeList(child), DEFAULT_FALLBACK)).toBe('兜底CHILD');

      childInstance.title = 'CHANGED';
      // 这个测试环境里组件视图不会自己标脏，得用组件自己的 CDR，见 renderer-class-style.spec.ts 顶部那段说明
      childInstance.cdr.markForCheck();
      fixture.detectChanges();

      expect(fallbackText(nodeList(child), DEFAULT_FALLBACK)).toBe(
        '兜底CHANGED',
      );
    });

    it('有投影时兜底视图始终不创建，改字段也不会突然冒出兜底', () => {
      const fixture = TestBed.createComponent(HostDefault);
      fixture.detectChanges();
      const child = childLView(componentLView(fixture));
      const childInstance = child[LVIEW.CONTEXT] as FallbackChildComponent;

      childInstance.title = 'CHANGED';
      childInstance.cdr.markForCheck();
      fixture.detectChanges();

      expect(nodeList(child)[DEFAULT_FALLBACK]).toEqual([]);
    });
  });
});
