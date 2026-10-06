import { NgModule } from '@angular/core';
import { LibComp1Component } from './lib-comp1.component';
import { LibDir1Directive } from './lib-dir1.directive';

/**
 * 成员全部 standalone，本模块退化成纯转发（不再 declarations）。
 * 保留是为了兼容 `imports: [LibComp1Module]` 的老写法。
 */
@NgModule({
  imports: [LibComp1Component, LibDir1Directive],
  exports: [LibComp1Component, LibDir1Directive],
})
export class LibComp1Module {}
