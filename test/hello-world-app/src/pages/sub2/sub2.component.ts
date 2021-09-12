import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sub2',
  templateUrl: './sub2.component.html',
  styleUrls: ['./sub2.component.css'],
})
export class Sub2Component implements OnInit {
  title = 'sub2组件';

  constructor() {}

  attached() {
    console.log('attached', this);
  }

  ready() {
    console.log('ready', this);
  }

  moved() {
    console.log('moved', this);
  }

  detached() {
    console.log('detached', this);
  }

  error(err) {
    console.log(err);

    console.log('error', this);
  }

  show() {
    console.log('page-show', this);
  }

  hide() {
    console.log('page-hide', this);
  }

  resize() {
    console.log('page-resize', this);
  }

  ngOnInit() {
    console.log('created-ngOnInit', this);
  }

  testApp($event) {
    console.log('sub2事件', $event);
  }

  ngOnDestroy(): void {
    console.log('detached-ngOnDestroy', this);
  }
}
