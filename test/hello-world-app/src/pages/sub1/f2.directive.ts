import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: '[appF2]',
})
export class F2Directive {
  @HostBinding('value') value;
  constructor() {
    setTimeout(() => {
      this.value = 'sdfsdf';
      console.log('数据更改');
    }, 3000);
  }
}
