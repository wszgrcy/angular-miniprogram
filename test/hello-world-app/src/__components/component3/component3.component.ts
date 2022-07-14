import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-component3',
  templateUrl: './component3.component.html',
  styleUrls: ['./component3.component.css'],
  standalone: true,
})
export class Component3Component implements OnInit {
  @HostListener('tap', ['$event']) tap1(event) {
    console.log('内置组件的tap事件', event);
  }
  @HostListener('bindtap', ['$event']) tap2(event) {
    console.log('内置组件的(bind)tap事件', event);
  }
  constructor() {}

  ngOnInit() {}
}
