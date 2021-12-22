import { NgModule } from '@angular/core';
import { GlobalSelfTemplateComponent } from './global-self-template.component';
import { OutsideTemplateModule } from '../outside-template/outside-template.module';
import { OtherModule } from '../other/other.module';

@NgModule({
  imports: [OutsideTemplateModule, OtherModule],
  declarations: [GlobalSelfTemplateComponent],
  exports: [GlobalSelfTemplateComponent],
})
export class GlobalSelfTemplateModule {}
