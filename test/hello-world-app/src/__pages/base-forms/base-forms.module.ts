import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { BaseFormsComponent } from './base-forms.component';
import { FormsModule } from 'angular-miniprogram/forms';
@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [BaseFormsComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class BaseFormsModule {}
