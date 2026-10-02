import { Component, NgZone, ViewChild } from '@angular/core';
import { ComponentFinderService } from 'angular-miniprogram';
import { MiniProgramComponentInstance } from 'angular-miniprogram/platform/type';
import { BehaviorSubject } from 'rxjs';
import { LifeTimeComponent } from '../../spec-component/life-time/life-time.component';
import { nodeExist } from '../util';

@Component({
  standalone: true,
  imports: [LifeTimeComponent],
  selector: 'app-life-time-spec',
  template: `<app-life-time #instance></app-life-time>`,
})
export class LifeTimeSPecComponent {
  testFinish$$ = new BehaviorSubject(undefined);
  static mpPageOptions: WechatMiniprogram.Page.Options<{}, {}> = {
    onLoad: function () {
      console.log('test-onLoad');
    },
    onShow: function () {
      console.log('test-onShow');
    },
    onReady: function (
      this: WechatMiniprogram.Page.Instance<{}, {}> &
        MiniProgramComponentInstance<LifeTimeSPecComponent>,
    ) {
      console.log('test-onReady');
      this.__ngComponentInstance.testFinish$$.complete();
    },
  };
  @ViewChild('instance', { static: true }) instance: LifeTimeComponent;
  private finishTimer?: ReturnType<typeof setTimeout>;
  constructor(
    private componentFinderService: ComponentFinderService,
    private ngZone: NgZone,
  ) {}
  ngOnInit(): void {
    console.log('test-ngOnInit');
    this.ngZone.runOutsideAngular(() => {
      this.finishTimer = setTimeout(() => {
        this.testFinish$$.complete();
      }, 3000);
    });
  }
  /**
   * reLaunch 换页时这个 timer 会活到下一个 spec 里去（onReady 已经
   * complete 过了，它晚 3s 再 complete 一次）。今天它里面没断言以故
   * 无害，但「上一个页面的异步跑在下一个 spec 期间」正是
   * `'expect' was used when there was no current spec` 的成因形状。
   */
  ngOnDestroy(): void {
    clearTimeout(this.finishTimer);
  }
}
