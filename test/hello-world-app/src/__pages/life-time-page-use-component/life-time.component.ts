import { Component, OnInit } from '@angular/core';
import { MiniProgramComponentInstance } from 'angular-miniprogram/platform/type';

@Component({
  selector: 'app-life-time',
  templateUrl: './life-time.component.html',
})
export class LifeTimePage implements OnInit {
  static mpComponentOptions: WechatMiniprogram.Component.Options<
    {},
    {},
    {},
    {},
    true
  > = {
    lifetimes: {
      created: function (this: MiniProgramComponentInstance) {
        console.log('created(use-component)');
      },
      attached: function () {
        console.log('attached(use-component)');
      },
      ready: function () {
        console.log('ready(use-component)');
      },
      moved: function () {
        console.log('moved(use-component)');
      },
      detached: function () {
        console.log('detached(use-component)');
      },
      error: function () {
        console.log('error(use-component)');
      },
    },
    pageLifetimes: {
      show: function () {
        console.log('page-show(use-component)');
      },
      hide: function () {
        console.log('page-hide(use-component)');
      },
      resize: function () {
        console.log('page-resize(use-component)');
      },
    },
    methods: {
      onLoad: () => {
        console.log('onLoad(use-component)');
      },
      onShow: () => {
        console.log('onShow(use-component)');
      },
      onReady: () => {
        console.log('onReady(use-component)');
      },
    },
  };
  constructor() {
    console.log('ng-constructor(use-component)');
  }

  ngOnInit() {
    console.log('ng-ngOnInit(use-component)');
  }
  ngAfterViewInit(): void {
    console.log('ng-ngAfterViewInit(use-component)');
  }
  ngAfterContentInit(): void {
    console.log('ng-ngAfterContentInit(use-component)');
  }
}
