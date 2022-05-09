import { NgModule } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { NgForComponent } from './ng-for.component';

@NgModule({
  imports: [CommonModule],
  declarations: [NgForComponent],
  exports: [NgForComponent],
})
export class NgForModule {}
