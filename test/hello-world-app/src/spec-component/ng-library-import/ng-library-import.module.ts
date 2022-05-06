import { NgModule } from '@angular/core';
import { NgLibraryImportComponent } from './ng-library-import.component';
import { LibComp1Module } from 'test-library';
@NgModule({
  imports: [LibComp1Module],
  declarations: [NgLibraryImportComponent],
  exports: [NgLibraryImportComponent],
})
export class NgLibraryImportModule {}
