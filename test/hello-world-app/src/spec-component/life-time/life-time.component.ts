import { Component, OnInit } from '@angular/core';
import { MiniProgramComponentInstance } from 'angular-miniprogram/platform/type';

@Component({
  selector: 'app-life-time',
  template: '',
})
export class LifeTimeComponent implements OnInit {
  static mpComponentOptions: WechatMiniprogram.Component.Options<{}, {}, {}> = {
    lifetimes: {
      created: function (this: MiniProgramComponentInstance) {
        console.log('created', this.__isLink);
      },
      attached: function () {
        console.log('attached', this.__isLink);
      },
      ready: function () {
        console.log('ready');
      },
      moved: function () {
        console.log('moved');
      },
      detached: function () {
        console.log('detached');
      },
      error: function () {
        console.log('error');
      },
    },
    pageLifetimes: {
      show: function () {
        console.log('page-show');
      },
      hide: function () {
        console.log('page-hide');
      },
      resize: function () {
        console.log('page-resize');
      },
    },
  };
  constructor() {}

  ngOnInit() {
    console.log('ngOnInit');
  }
}
