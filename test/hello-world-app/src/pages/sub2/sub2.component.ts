import { Component, OnInit } from '@angular/core';
import { WxLifetimes } from 'angular-miniprogram';

@Component({
  selector: 'app-sub2',
  templateUrl: './sub2.component.html',
  styleUrls: ['./sub2.component.css'],
})
export class Sub2Component implements OnInit, WxLifetimes {
  title = 'sub2组件';
  wxLifetimes: WechatMiniprogram.Component.Lifetimes['lifetimes'] = {
    attached: () => {
      console.log('attached', this);
    },
    ready: () => {
      console.log('ready', this);
    },
    moved: () => {
      console.log('moved', this);
    },
    detached: () => {
      console.log('detached', this);
    },
    error: (err) => {
      console.log(err);

      console.log('error', this);
    },
  };
  wxPageLifetimes: Partial<WechatMiniprogram.Component.PageLifetimes> = {
    show: () => {
      console.log('page-show', this);
    },
    hide: () => {
      console.log('page-hide', this);
    },
    resize: () => {
      console.log('page-resize', this);
    },
  };
  constructor() {}

  ngOnInit() {
    console.log('created-ngOnInit', this);
  }
  testApp($event) {
    console.log('sub2事件', $event);
  }
  ngOnDestroy(): void {
    console.log('detached-ngOnDestroy', this);
  }
}
