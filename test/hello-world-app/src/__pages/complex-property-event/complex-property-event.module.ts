import { NgModule } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { ComplexPropertyEventComponent } from './complex-property-event.component';
import { AppDir1Directive } from './app-dir1.directive';
import { LibComp1Module } from 'test-library';
import { Component3Module } from '../../__components/component3/component3.module';

@NgModule({
  imports: [CommonModule, LibComp1Module, Component3Module],
  declarations: [ComplexPropertyEventComponent, AppDir1Directive],
})
export class ComplexPropertyEventModule {}
