import { NgModule } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { NgSwitchComponent } from './ng-switch.component';

@NgModule({
  imports: [CommonModule],
  declarations: [NgSwitchComponent],
  exports: [NgSwitchComponent],
})
export class NgSwitchModule {}
