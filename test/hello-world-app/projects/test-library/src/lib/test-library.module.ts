import { NgModule } from '@angular/core';
import { TestLibraryComponent } from './test-library.component';
import { TestLibraryDirective } from './test-library.directive';

/**
 * 成员全部 standalone，本模块退化成纯转发（不再 declarations）。
 *
 * 保留它是为了兼容 `imports: [TestLibraryModule]` 的老写法；
 * 新代码直接 `imports: [TestLibraryComponent, TestLibraryDirective]` 即可，
 * 完全不需要本模块。
 *
 * 注意：原先模块里的 `imports: [OtherModule]` 已去掉 —— standalone 组件
 * 不从模块继承作用域，那个 import 对组件毫无作用。
 */
@NgModule({
  imports: [TestLibraryComponent, TestLibraryDirective],
  exports: [TestLibraryComponent, TestLibraryDirective],
})
export class TestLibraryModule {}
