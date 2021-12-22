import { NgModule } from '@angular/core';
import { GlobalSelfTemplateModule } from 'test-library';
import { OutsideTemplateModule } from 'test-library';
import { Component1Module } from '../../__components/component1/component1.module';
import { ComponentUseTemplateComponent } from './component-use-template.component';

@NgModule({
  imports: [OutsideTemplateModule, Component1Module, GlobalSelfTemplateModule],
  declarations: [ComponentUseTemplateComponent],
})
export class ComponentUseTemplateModule {}
