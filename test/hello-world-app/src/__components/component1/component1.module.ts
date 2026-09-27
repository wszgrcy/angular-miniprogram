import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Component1Component } from './component1.component';

@NgModule({
  imports: [CommonModule],
  declarations: [Component1Component],
  exports: [Component1Component],
})
export class Component1Module {}
