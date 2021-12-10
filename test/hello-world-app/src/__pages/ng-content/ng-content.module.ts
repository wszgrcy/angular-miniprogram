import { NgModule } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { NgContentComponent } from './ng-content.component';
import { ContentModule } from '../../__components/content/content.module';
import { ContentMultiModule } from '../../__components/content-multi/content-multi.module';

@NgModule({
  imports: [CommonModule, ContentModule, ContentMultiModule],
  declarations: [NgContentComponent],
})
export class NgContentModule {}
