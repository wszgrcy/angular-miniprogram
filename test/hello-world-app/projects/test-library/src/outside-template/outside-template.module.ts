import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutsideTemplateComponent } from './outside-template.component';

@NgModule({
  imports: [CommonModule],
  declarations: [OutsideTemplateComponent],
  exports: [OutsideTemplateComponent],
})
export class OutsideTemplateModule {}
