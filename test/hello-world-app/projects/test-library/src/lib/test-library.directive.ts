import { Directive, HostListener, Output } from '@angular/core';

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
  hostTap(event) {
    console.log('tap', event);
  }
}
