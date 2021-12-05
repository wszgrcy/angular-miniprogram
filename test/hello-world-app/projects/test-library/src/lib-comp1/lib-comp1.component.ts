import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-lib-comp1',
  templateUrl: './lib-comp1.component.html',
  styleUrls: ['./lib-comp1.component.css'],
})
export class LibComp1Component implements OnInit {
  @HostListener('tap', ['$event']) tap1(event) {
    console.log('library组件的tap事件', event);
  }
  @HostListener('bindtap', ['$event']) tap2(event) {
    console.log('library组件的(bind)tap事件', event);
  }
  constructor() {}

  ngOnInit() {}
}
