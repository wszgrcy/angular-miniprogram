import { NgModule } from '@angular/core';

import { NgSwitchModule } from '../../spec-component/ng-switch/ng-switch.module';
import { NgSwitchSPecComponent } from './ng-switch.component';
@NgModule({
  imports: [NgSwitchModule],
  declarations: [NgSwitchSPecComponent],
  exports: [NgSwitchSPecComponent],
})
export class NgSwitchSpecModule {}
