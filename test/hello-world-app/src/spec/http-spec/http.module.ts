import { NgModule } from '@angular/core';
import { HttpClientModule } from 'angular-miniprogram';
import { CommonModule } from 'angular-miniprogram/common';
import { HttpSpecComponent } from './http.component';
@NgModule({
  imports: [CommonModule, HttpClientModule],
  declarations: [HttpSpecComponent],
})
export class HttpSpecModule {}
