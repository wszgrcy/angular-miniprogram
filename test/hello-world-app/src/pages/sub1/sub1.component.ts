import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-sub1',
  templateUrl: './sub1.component.html',
  styleUrls: ['./sub1.component.css'],
})
export class Sub1Component {
  constructor(private cd: ChangeDetectorRef) {}
  test(event) {
    console.log('输出', event);
  }
  tap1(event) {
    console.log('第一个事件', event);
  }
  tap2(event) {
    console.log('第二个事件', event);
  }
  tap3(event) {
    console.log('第三个事件', event);
  }
}
