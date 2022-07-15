import { Component, OnInit } from '@angular/core';
import { MiniProgramComponentInstance } from 'angular-miniprogram/platform/type';

@Component({
  selector: 'app-life-time-component',
  templateUrl: './life-time.component.html',
  standalone: true,
})
export class LifeTimeComponent implements OnInit {
  static mpComponentOptions: WechatMiniprogram.Component.Options<{}, {}, {}> = {
    lifetimes: {
      created: function (this: MiniProgramComponentInstance) {
        console.log('created(component)');
      },
      attached: function () {
        console.log('attached(component)');
      },
      ready: function () {
        console.log('ready(component)');
      },
      moved: function () {
        console.log('moved(component)');
      },
      detached: function () {
        console.log('detached(component)');
      },
      error: function () {
        console.log('error(component)');
      },
    },
    pageLifetimes: {
      show: function () {
        console.log('page-show(component)');
      },
      hide: function () {
        console.log('page-hide(component)');
      },
      resize: function () {
        console.log('page-resize(component)');
      },
    },
  };
  constructor() {
    console.log('ng-constructor(component)');
  }

  ngOnInit() {
    console.log('ng-ngOnInit(component)');
  }
  ngAfterViewInit(): void {
    console.log('ng-ngAfterViewInit(component)');
  }
  ngAfterContentInit(): void {
    console.log('ng-ngAfterContentInit(component)');
  }
}
