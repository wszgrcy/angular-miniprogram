import { Inject, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cp1Component } from './cp1.component';
import { ComponentModuleBase } from '../../../../../src/platform';
import { PAGE_TOKEN } from '../../../../../src/platform/module/token/page.token';

@NgModule({
  imports: [CommonModule],
  declarations: [Cp1Component],
  exports: [Cp1Component],
  providers: [],
})
export class Cp1Module extends ComponentModuleBase {
  rand = Math.random();
  constructor(@Inject(PAGE_TOKEN) private page: any, injector: Injector) {
    super(injector);
    console.log('Cp1Module构造', page);
  }
}
