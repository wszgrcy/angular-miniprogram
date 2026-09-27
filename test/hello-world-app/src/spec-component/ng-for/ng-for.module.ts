import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForComponent } from './ng-for.component';

@NgModule({
  imports: [CommonModule],
  declarations: [NgForComponent],
  exports: [NgForComponent],
})
export class NgForModule {}
