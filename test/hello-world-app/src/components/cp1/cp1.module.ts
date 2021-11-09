import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cp1Component } from './cp1.component';

@NgModule({
  imports: [CommonModule],
  declarations: [Cp1Component],
  exports: [Cp1Component],
  providers: [],
})
export class Cp1Module {
  rand = Math.random();
}
