import { NgIf, NgTemplateOutlet } from '@angular/common';
import { NgModule } from '@angular/core';
import { ComponentNeedTemplateComponent } from './component-need-template.component';

@NgModule({
  imports: [NgIf, NgTemplateOutlet],
  declarations: [ComponentNeedTemplateComponent],
  exports: [ComponentNeedTemplateComponent],
})
export class ComponentNeedTemplateModule {}
