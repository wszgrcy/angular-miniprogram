import { NgModule } from '@angular/core';
import { OtherComponent } from './other.component';

/**
 * `OtherComponent` 已 standalone，**不能再被 `declarations`**（NG6008）。
 * 本模块退化成纯转发：`imports` + `exports`。
 * 保留它是为了兼容 `imports: [OtherModule]` 的老写法。
 */
@NgModule({
  imports: [OtherComponent],
  exports: [OtherComponent],
})
export class OtherModule {}
