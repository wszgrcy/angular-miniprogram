import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponentComponent } from './base-component.component';
import { Component1Module } from '../../__components/component1/component1.module';
import { Component2Module } from '../../__components/component2/component2.module';

@NgModule({
  imports: [CommonModule, Component1Module, Component2Module],
  declarations: [BaseComponentComponent],
})
export class BaseComponentModule {}
