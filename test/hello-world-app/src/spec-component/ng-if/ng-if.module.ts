import { NgModule } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { NgIfComponent } from './ng-if.component';

@NgModule({
  imports: [CommonModule],
  declarations: [NgIfComponent],
  exports: [NgIfComponent],
})
export class NgIfModule {}
