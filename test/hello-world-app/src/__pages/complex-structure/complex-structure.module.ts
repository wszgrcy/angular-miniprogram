import { NgModule } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { ComplexStructureComponent } from './complex-structure.component';
import { ContentModule } from '../../__components/content/content.module';

@NgModule({
  imports: [CommonModule, ContentModule],
  declarations: [ComplexStructureComponent],
})
export class ComplexStructureModule {}
