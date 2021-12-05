import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appDirective1]',
})
export class Directive1Directive {
  @HostBinding('style.color') color = 'red';
  @HostListener('tap', ['$event']) tap(event) {
    console.log('tap事件', event);
  }
  constructor() {}
}
