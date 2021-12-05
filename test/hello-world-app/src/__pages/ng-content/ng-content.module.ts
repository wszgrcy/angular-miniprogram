import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgContentComponent } from './ng-content.component';
import { ContentModule } from '../../__components/content/content.module';

@NgModule({
  imports: [CommonModule, ContentModule],
  declarations: [NgContentComponent],
})
export class NgContentModule {}
