import { NgModule } from '@angular/core';
import { Sub2Component } from './sub2.component';
import { Cp1Module } from '../../components/cp1/cp1.module';

@NgModule({
  imports: [Cp1Module],
  declarations: [Sub2Component],
})
export class Sub2Module {}
