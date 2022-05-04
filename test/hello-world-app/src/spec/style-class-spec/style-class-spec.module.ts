import { NgModule } from '@angular/core';
import { StyleClassModule } from 'src/spec-component/style-class/style-class.module';

import { StyleClassSpecComponent } from './style-class-spec.component';

@NgModule({
  imports: [StyleClassModule],
  declarations: [StyleClassSpecComponent],
})
export class StyleClassSpecModule {}
