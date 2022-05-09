import { NgModule } from '@angular/core';
import { NgContentModule } from '../../spec-component/ng-content/ng-content.module';
import { NgContentSpecComponent } from './ng-content.component';

@NgModule({
  imports: [NgContentModule],
  declarations: [NgContentSpecComponent],
})
export class NgContentSpecModule {}
