import { NgModule } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { LibComp1Component } from './lib-comp1.component';
import { LibDir1Directive } from './lib-dir1.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [LibComp1Component, LibDir1Directive],
  exports: [LibComp1Component, LibDir1Directive],
})
export class LibComp1Module {}
