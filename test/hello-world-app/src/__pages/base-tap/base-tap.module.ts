import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { BaseTagComponent } from './base-tap.component';

@NgModule({
  imports: [CommonModule],
  declarations: [BaseTagComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class BaseTagModule {}
