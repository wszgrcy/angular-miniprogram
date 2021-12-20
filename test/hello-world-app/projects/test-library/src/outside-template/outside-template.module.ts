import { NgModule } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { OutsideTemplateComponent } from './outside-template.component';

@NgModule({
  imports: [CommonModule],
  declarations: [OutsideTemplateComponent],
  exports: [OutsideTemplateComponent],
})
export class OutsideTemplateModule {}
