import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { Sub1Component } from './sub1.component';
import { Cp1Module } from '../../components/cp1/cp1.module';
import { CommonModule } from '@angular/common';
import { F1Directive } from './f1.directive';
import { TestLibraryModule } from 'test-library';
import { F2Directive } from './f2.directive';
import { FormsModule } from 'angular-miniprogram/forms';
import { CustomStructDirective } from './custom-struct.directive';
@NgModule({
  declarations: [
    Sub1Component,
    F1Directive,
    F2Directive,
    CustomStructDirective,
  ],
  imports: [Cp1Module, CommonModule, TestLibraryModule, FormsModule],
  providers: [],
  bootstrap: [],
  exports: [Sub1Component],
  schemas: [NO_ERRORS_SCHEMA],
})
export class Sub1Module {}
