import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  schemas: [NO_ERRORS_SCHEMA],
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
  tapStop1(event) {
    console.log('tap.stop事件', event);
  }
  tapPrevent1(event) {
    console.log('tap.prevent事件', event);
  }
  tapCapture1(event) {
    console.log('tap.capture事件', event);
  }
  tapCaptureCatch1(event) {
    console.log('tap.stop.capture事件', event);
  }
  tapOnce1(event) {
    console.log('tap.once事件', event);
  }
  touchStart1(event) {
    console.log('touchstart事件', event);
  }
  longPress1(event) {
    console.log('longpress事件', event);
  }
  // captureCatchTap1(event) {
  //   console.log('capture-catch事件', event);
  // }
}
