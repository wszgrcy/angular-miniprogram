import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appDir1]',
})
export class AppDir1Directive {
  @HostListener('tap', ['$event']) tap1(event) {
    console.log('内置指令的tap事件', event);
  }
  @HostListener('bindtap', ['$event']) tap2(event) {
    console.log('内置指令的(bind)tap事件', event);
  }
  constructor() {}
}
