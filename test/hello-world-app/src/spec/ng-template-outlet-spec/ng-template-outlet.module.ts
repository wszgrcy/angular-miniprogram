import { NgModule } from '@angular/core';

import { NgTemplateOutletModule } from '../../spec-component/ng-template-outlet/ng-template-outlet.module';
import { NgTemplateOutletSPecComponent } from './ng-template-outlet.component';
@NgModule({
  imports: [NgTemplateOutletModule],
  declarations: [NgTemplateOutletSPecComponent],
  exports: [NgTemplateOutletSPecComponent],
})
export class NgTemplateOutletSpecModule {}
