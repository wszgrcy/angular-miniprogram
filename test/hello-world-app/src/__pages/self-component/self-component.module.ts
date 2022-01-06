import { NgModule } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { ComponentNeedTemplateModule } from '../../__components/component-need-template/component-need-template.module';
import { SelfComponentComponent } from './self-component.component';

@NgModule({
  imports: [CommonModule, ComponentNeedTemplateModule],
  declarations: [SelfComponentComponent],
})
export class SelfComponentModule {}
