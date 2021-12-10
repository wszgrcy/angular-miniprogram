import { NgModule } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { BaseFormsComponent } from './base-forms.component';
import { FormsModule } from 'angular-miniprogram/forms';
@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [BaseFormsComponent],
})
export class BaseFormsModule {}
