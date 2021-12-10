import { NgModule } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { Component2Component } from './component2.component';
import { Component1Module } from '../component1/component1.module';

@NgModule({
  imports: [CommonModule, Component1Module],
  declarations: [Component2Component],
  exports: [Component2Component],
})
export class Component2Module {}
