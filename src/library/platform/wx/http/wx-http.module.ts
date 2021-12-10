import { NgModule } from '@angular/core';
import {
  HttpBackend,
  HttpClient,
  HttpHandler,
  ɵHttpInterceptingHandler,
} from 'angular-miniprogram/common/http';
import { WxHttpBackend } from './backend';
@NgModule({
  declarations: [],
  imports: [],
  exports: [],
  providers: [
    HttpClient,
    { provide: HttpHandler, useClass: ɵHttpInterceptingHandler },
    WxHttpBackend,
    { provide: HttpBackend, useExisting: WxHttpBackend },
  ],
})
export class WxHttpClientModule {}
