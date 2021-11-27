import { NgModule } from '@angular/core';
import { OtherModule } from '../other/other.module';
import { TestLibraryComponent } from './test-library.component';
import { TestLibraryDirective } from './test-library.directive';

@NgModule({
  declarations: [TestLibraryComponent, TestLibraryDirective],
  imports: [OtherModule],
  exports: [TestLibraryComponent, TestLibraryDirective],
})
export class TestLibraryModule {}
