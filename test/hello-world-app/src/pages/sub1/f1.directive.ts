import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appF1]',
  host: {
    '(tap)': 'abc($event)',
  },
})
export class F1Directive {
  @HostBinding('class.red') isRed = false;
  constructor() {
    setInterval(() => {
      this.isRed = !this.isRed;
    }, 2000);
  }
  abc(e) {
    console.log('点击', e);
  }
}
