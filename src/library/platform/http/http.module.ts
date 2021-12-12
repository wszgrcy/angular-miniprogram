import { NgModule } from '@angular/core';
import {
  HttpBackend,
  HttpClient,
  HttpHandler,
  ɵHttpInterceptingHandler,
} from 'angular-miniprogram/common/http';
import { MiniprogramHttpBackend } from './backend';
@NgModule({
  declarations: [],
  imports: [],
  exports: [],
  providers: [
    HttpClient,
    { provide: HttpHandler, useClass: ɵHttpInterceptingHandler },
    MiniprogramHttpBackend,
    { provide: HttpBackend, useExisting: MiniprogramHttpBackend },
  ],
})
export class HttpClientModule {}
