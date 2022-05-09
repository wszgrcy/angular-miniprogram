import { Component, NgZone, ViewChild } from '@angular/core';
import { ComponentFinderService } from 'angular-miniprogram';
import { MiniProgramComponentInstance } from 'angular-miniprogram/platform/type';
import { BehaviorSubject } from 'rxjs';
import { LifeTimeComponent } from '../../spec-component/life-time/life-time.component';
import { nodeExist } from '../util';

@Component({
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
        MiniProgramComponentInstance<LifeTimeSPecComponent>
    ) {
      console.log('test-onReady');
      this.__ngComponentInstance.testFinish$$.complete();
    },
  };
  @ViewChild('instance', { static: true }) instance: LifeTimeComponent;
  constructor(
    private componentFinderService: ComponentFinderService,
    private ngZone: NgZone
  ) {}
  ngOnInit(): void {
    console.log('test-ngOnInit');
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.testFinish$$.complete();
      }, 3000);
    });
  }
}
