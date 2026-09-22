import { Component } from '@angular/core';
import { ComponentFinderService } from 'angular-miniprogram';
import { MiniProgramComponentInstance } from 'angular-miniprogram/platform/type';
import { BehaviorSubject } from 'rxjs';
import { nodeExist } from '../util';

/**
 * 内建控制流（`@if` / `@for` / `@switch`）在小程序里的渲染验证。
 */
@Component({
  standalone: false,
  selector: 'app-control-flow-spec',
  template: `
    @if (show) {
      <div class="if-yes">yes</div>
    } @else {
      <div class="if-no">no</div>
    }

    @for (item of list; track item) {
      <div class="for-item">{{ item }}</div>
    } @empty {
      <div class="for-empty">empty</div>
    }

    @switch (mode) {
      @case ("a") {
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
  show = true;
  list = ['x', 'y'];
  mode = 'a';

  static mpPageOptions: WechatMiniprogram.Page.Options<{}, {}> = {
    onReady: function (
      this: WechatMiniprogram.Page.Instance<{}, {}> &
        MiniProgramComponentInstance<ControlFlowSPecComponent>
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
        instance.show = false;
        instance.list = [];
        instance.mode = 'b';
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
