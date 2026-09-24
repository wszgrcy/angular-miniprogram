import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentComponent } from './content.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ContentComponent],
  exports: [ContentComponent],
})
export class ContentModule {}
