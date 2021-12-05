import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appLibDir1]',
})
export class LibDir1Directive {
  @HostListener('tap', ['$event']) tap1(event) {
    console.log('library指令的tap事件', event);
  }
  @HostListener('bindtap', ['$event']) tap2(event) {
    console.log('library指令的(bind)tap事件', event);
  }
  constructor() {}
}
