import { NgModule } from '@angular/core';
import { TagViewConvertModule } from '../../spec-component/tag-view-convert/tag-view-convert.module';

import { TagViewConvertSpecComponent } from './tag-view-convert.component';

@NgModule({
  imports: [TagViewConvertModule],
  declarations: [TagViewConvertSpecComponent],
})
export class TagViewConvertSpecModule {}
