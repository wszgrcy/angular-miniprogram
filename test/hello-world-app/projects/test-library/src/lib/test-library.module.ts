import { NgModule } from '@angular/core';
import { TestLibraryComponent } from './test-library.component';
import { TestLibraryDirective } from './test-library.directive';

@NgModule({
  declarations: [TestLibraryComponent, TestLibraryDirective],
  imports: [],
  exports: [TestLibraryComponent, TestLibraryDirective],
})
export class TestLibraryModule {}
