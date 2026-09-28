import { NgModule } from '@angular/core';
import { GlobalSelfTemplateComponent } from './global-self-template.component';

/**
 * 成员已 standalone，本模块退化成纯转发。
 * 原先模块里的 `OutsideTemplateModule` / `OtherModule` 已下沉到组件自己的
 * `imports`（standalone 组件不从模块继承作用域）。
 */
@NgModule({
  imports: [GlobalSelfTemplateComponent],
  exports: [GlobalSelfTemplateComponent],
})
export class GlobalSelfTemplateModule {}
