import { Component, OnInit } from '@angular/core';
import { MiniProgramComponentInstance } from 'angular-miniprogram/platform/type';

@Component({
  selector: 'app-life-time',
  templateUrl: './life-time.component.html',
})
export class LifeTimePage implements OnInit {
  static mpPageOptions: WechatMiniprogram.Page.Options<{}, {}> = {
    onLoad: function (this: MiniProgramComponentInstance) {
      console.log('mp-onLoad', this.__ngComponentInstance);
    },
    onShow: function () {
      console.log('mp-onShow', this.__ngComponentInstance);
    },
    onReady: function (
      this: WechatMiniprogram.Page.Instance<{}, {}> &
        MiniProgramComponentInstance<LifeTimePage>
    ) {
      console.log('mp-onReady');
    },
  };
  constructor() {
    console.log('ng-constructor');
  }

  ngOnInit() {
    console.log('ng-ngOnInit');
  }
  ngAfterViewInit(): void {
    console.log('ng-ngAfterViewInit');
  }
  ngAfterContentInit(): void {
    console.log('ng-ngAfterContentInit');
  }
}
