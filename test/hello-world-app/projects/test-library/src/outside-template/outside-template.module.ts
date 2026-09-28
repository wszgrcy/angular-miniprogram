import { NgModule } from '@angular/core';
import { OutsideTemplateComponent } from './outside-template.component';

/**
 * `OutsideTemplateComponent` 已 standalone，本模块退化成纯转发。
 * `CommonModule` 已随组件自带，模块里不再需要。
 */
@NgModule({
  imports: [OutsideTemplateComponent],
  exports: [OutsideTemplateComponent],
})
export class OutsideTemplateModule {}
