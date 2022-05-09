import { NgModule } from '@angular/core';

import { SelfTemplateModule } from '../../spec-component/self-template/self-template.module';
import { SelfTemplateSPecComponent } from './self-template.component';
@NgModule({
  imports: [SelfTemplateModule],
  declarations: [SelfTemplateSPecComponent],
  exports: [SelfTemplateSPecComponent],
})
export class SelfTemplateSpecModule {}
