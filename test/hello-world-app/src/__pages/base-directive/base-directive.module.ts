import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseDirectiveComponent } from './base-directive.component';
import { Directive1Directive } from './directive1.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [BaseDirectiveComponent, Directive1Directive],
})
export class BaseDirectiveModule {}
