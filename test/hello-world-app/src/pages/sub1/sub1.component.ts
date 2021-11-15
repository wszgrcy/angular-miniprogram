import { Component, Inject, OnInit } from '@angular/core';
import { COMPONENT_TOKEN } from 'angular-miniprogram';

@Component({
  selector: 'app-sub1',
  templateUrl: './sub1.component.html',
  styleUrls: ['./sub1.component.css'],
  // interpolation:["((","))"]
})
export class Sub1Component implements OnInit {
  title = 'app666';
  display = false;
  num = 0;
  obj = { a: '' };
  randomValue = 0;
  jsonObj = { a: '被格式化的对象' };
  today = new Date();
  constructor(@Inject(COMPONENT_TOKEN) component: any) {
    console.log('Sub1Component构造', component);
  }
  ngOnInit(): void {}

  testApp(event) {
    console.log('外部事件:导航', event);
    wx.navigateTo({ url: '../sub2/sub2.entry' });
  }
  toggle() {
    this.display = !this.display;
  }
  changeTest(e) {
    setTimeout(() => {
      this.randomValue = Math.random();
    }, 0);
  }
  eventTest(e) {
    this.randomValue = Math.random();
  }
}
