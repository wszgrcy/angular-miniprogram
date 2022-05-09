import { NgModule } from '@angular/core';

import { NgLibraryImportSPecComponent } from './ng-library-import.component';
import { NgLibraryImportModule } from '../../spec-component/ng-library-import/ng-library-import.module';
@NgModule({
  imports: [NgLibraryImportModule],
  declarations: [NgLibraryImportSPecComponent],
})
export class NgLibraryImportSpecModule {}
