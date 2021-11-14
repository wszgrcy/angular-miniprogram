import { NgModule } from '@angular/core';
import { Sub1Component } from './sub1.component';
import { Cp1Module } from '../../components/cp1/cp1.module';
import { CommonModule } from '@angular/common';
import { F1Directive } from './f1.directive';
@NgModule({
  declarations: [Sub1Component, F1Directive],
  imports: [Cp1Module, CommonModule],
  providers: [],
  bootstrap: [],
  exports: [Sub1Component],
})
export class Sub1Module {}
