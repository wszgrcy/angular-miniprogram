import { NgModule } from '@angular/core';

import { LifeTimeModule } from '../../spec-component/life-time/life-time.module';
import { LifeTimeSPecComponent } from './life-time.component';
@NgModule({
  imports: [LifeTimeModule],
  declarations: [LifeTimeSPecComponent],
  exports: [LifeTimeSPecComponent],
})
export class LifeTimeSpecModule {}
