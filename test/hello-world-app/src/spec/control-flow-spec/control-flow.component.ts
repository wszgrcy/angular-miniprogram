import { Component, signal } from '@angular/core';
import { ComponentFinderService } from 'angular-miniprogram';
import { MiniProgramComponentInstance } from 'angular-miniprogram/platform/type';
import { BehaviorSubject } from 'rxjs';
import { nodeExist } from '../util';

/**
 * 内建控制流（`@if` / `@for` / `@switch`）在小程序里的渲染验证。
 *
 * 状态一律用 signal。本库始终 zoneless（不带 zone.js），普通字段
 * 改了不会触发任何刷新；signal 被模板读取后，写入会自动把视图
 * 标脏并通知 ChangeDetectionScheduler，不需要 `ChangeDetectorRef`
 * 手动 `markForCheck()` / `detectChanges()`。
 */
@Component({
  standalone: true,
  selector: 'app-control-flow-spec',
  template: `
    @if (show()) {
      <div class="if-yes">yes</div>
    } @else {
      <div class="if-no">no</div>
    }

    @for (item of list(); track item) {
      <div class="for-item">{{ item }}</div>
    } @empty {
      <div class="for-empty">empty</div>
    }

    @switch (mode()) {
      @case ('a') {
        <div class="case-a">A</div>
      }
      @default {
        <div class="case-default">D</div>
      }
    }
  `,
})
export class ControlFlowSPecComponent {
  testFinish$$ = new BehaviorSubject(undefined);

  readonly show = signal(true);
  readonly list = signal<string[]>(['x', 'y']);
  readonly mode = signal('a');

  /**
   * 只写 signal，不碰 ChangeDetectorRef。
   *
   * 三次 set 会被 Angular 合并成一次刷新（响应式图按标记收敛，
   * 不是每 set 一次重渲染一遍）。
   */
  switchState(): void {
    this.show.set(false);
    this.list.set([]);
    this.mode.set('b');
  }

  static mpPageOptions: WechatMiniprogram.Page.Options<{}, {}> = {
    onReady: function (
      this: WechatMiniprogram.Page.Instance<{}, {}> &
        MiniProgramComponentInstance<ControlFlowSPecComponent>,
    ) {
      const instance = this.__ngComponentInstance;
      const query = this.createSelectorQuery();
      (async () => {
        // 初始状态
        expect(await nodeExist(query, '.if-yes')).toBe(true);
        expect(await nodeExist(query, '.if-no')).toBe(false);
        expect(await nodeExist(query, '.for-item')).toBe(true);
        expect(await nodeExist(query, '.for-empty')).toBe(false);
        expect(await nodeExist(query, '.case-a')).toBe(true);
        expect(await nodeExist(query, '.case-default')).toBe(false);

        // 切换状态后，控制流分支要跟着变
        instance.switchState();
        // 等调度器把这次 signal 变更 flush 掉
        await new Promise((res) => setTimeout(res, 500));

        const nextQuery = this.createSelectorQuery();
        expect(await nodeExist(nextQuery, '.if-yes')).toBe(false);
        expect(await nodeExist(nextQuery, '.if-no')).toBe(true);
        expect(await nodeExist(nextQuery, '.for-item')).toBe(false);
        expect(await nodeExist(nextQuery, '.for-empty')).toBe(true);
        expect(await nodeExist(nextQuery, '.case-a')).toBe(false);
        expect(await nodeExist(nextQuery, '.case-default')).toBe(true);

        instance.testFinish$$.complete();
      })();
    },
  };
  constructor(private componentFinderService: ComponentFinderService) {}
  ngOnInit(): void {}
}
