import { NgModule } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { SelfTemplateComponent } from './self-template.component';

@NgModule({
  imports: [CommonModule],
  declarations: [SelfTemplateComponent],
  exports: [SelfTemplateComponent],
})
export class SelfTemplateModule {}
