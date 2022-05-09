import { NgModule } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { NgTemplateOutletComponent } from './ng-template-outlet.component';

@NgModule({
  imports: [CommonModule],
  declarations: [NgTemplateOutletComponent],
  exports: [NgTemplateOutletComponent],
})
export class NgTemplateOutletModule {}
