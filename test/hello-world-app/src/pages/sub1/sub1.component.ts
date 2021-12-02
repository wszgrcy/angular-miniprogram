import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-sub1',
  templateUrl: './sub1.component.html',
  styleUrls: ['./sub1.component.css'],
  // interpolation:["((","))"]
})
export class Sub1Component implements OnInit {
  title = 'app666';
  display = true;
  num = 0;
  obj = { a: '' };
  randomValue = 0;
  jsonObj = { a: '被格式化的对象' };
  today = new Date();
  modelValue;
  raidoValue = 'ceshi';
  checkboxValue = ['ceshi'];
  constructor(private cd: ChangeDetectorRef) {
    console.log('Sub1Component构造');
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
  moduleChange(e) {
    console.log(e);
    this.cd.detectChanges();
  }
}
