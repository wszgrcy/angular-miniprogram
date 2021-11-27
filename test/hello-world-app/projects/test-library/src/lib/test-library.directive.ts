import { Directive, HostBinding, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[libTestLibrary]',
  host: {
    '(tap)': 'hostTap($event)',
  },
})
export class TestLibraryDirective {
  @HostListener('touchstart', ['$event']) methodDecoratorTouchstart(event) {
    console.log('HostListener-touchstart', event);
  }
  @HostBinding('value') value;
  constructor() {
    setTimeout(() => {
      this.value = 'sdfsdf';
      console.log('数据更改');
    }, 3000);
  }
  hostTap(event) {
    console.log('tap', event);
  }
}
