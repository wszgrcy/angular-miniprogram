import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-base-tap',
  templateUrl: './base-tap.component.html',
  styleUrls: ['./base-tap.component.css'],
})
export class BaseTagComponent implements OnInit {
  color = 'red';
  backgroundColor = 'green';
  interpolation = '这个是插值内容';
  constructor() {}

  ngOnInit() {}
  tap1(event) {
    console.log('tap事件', event);
  }
  mutBindTap1(event) {
    console.log('mut-bindtap事件', event);
  }
  catchTap1(event) {
    console.log('catchtap事件', event);
  }
  captureBindTap1(event) {
    console.log('capture-bind事件', event);
  }
  // captureCatchTap1(event) {
  //   console.log('capture-catch事件', event);
  // }
}
