import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentMultiComponent } from './content-multi.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ContentMultiComponent],
  exports: [ContentMultiComponent],
})
export class ContentMultiModule {}
