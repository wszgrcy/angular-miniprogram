import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestComponent } from './component';
const list = [TestComponent];
@NgModule({
  declarations: [list],
  imports: [CommonModule],
  exports: [],
  providers: [],
})
export class TestModule {}
