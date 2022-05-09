import { NgModule } from '@angular/core';

import { NgIfModule } from '../../spec-component/ng-if/ng-if.module';
import { NgIfSPecComponent } from './ng-if.component';
@NgModule({
  imports: [NgIfModule],
  declarations: [NgIfSPecComponent],
  exports: [NgIfSPecComponent],
})
export class NgIfSpecModule {}
