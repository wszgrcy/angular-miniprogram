import { NgModule } from '@angular/core';
import { Sub1Component } from './sub1.component';
import { Cp1Module } from '../../components/cp1/cp1.module';
import { CommonModule } from '@angular/common';
@NgModule({
  declarations: [Sub1Component],
  imports: [Cp1Module, CommonModule],
  providers: [],
  bootstrap: [],
  exports: [Sub1Component],
})
export class Sub1Module {}
