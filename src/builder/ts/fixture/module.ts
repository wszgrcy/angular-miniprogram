import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TestComponent } from './component';

const list = [TestComponent];
@NgModule({
  declarations: [list],
  imports: [CommonModule],
  exports: [],
  providers: [],
})
export class TestModule {}
