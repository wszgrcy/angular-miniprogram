import { NgModule } from '@angular/core';
import { HttpClientModule } from 'angular-miniprogram';
import { CommonModule } from 'angular-miniprogram/common';
import { BaseHttpComponent } from './base-http.component';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  declarations: [BaseHttpComponent],
})
export class BaseHttpModule {}
