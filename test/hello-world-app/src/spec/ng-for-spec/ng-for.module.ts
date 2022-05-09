import { NgModule } from '@angular/core';

import { NgForModule } from '../../spec-component/ng-for/ng-for.module';
import { NgForSPecComponent } from './ng-for.component';
@NgModule({
  imports: [NgForModule],
  declarations: [NgForSPecComponent],
  exports: [NgForSPecComponent],
})
export class NgForSpecModule {}
