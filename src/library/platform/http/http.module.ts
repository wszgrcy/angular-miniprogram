import { NgModule } from '@angular/core';
import {
  HttpBackend,
  HttpClient,
  HttpHandler,
  ÉµHttpInterceptingHandler,
} from 'angular-miniprogram/common/http';
import { MiniprogramHttpBackend } from './backend';
@NgModule({
  declarations: [],
  imports: [],
  exports: [],
  providers: [
    HttpClient,
    { provide: HttpHandler, useClass: ÉµHttpInterceptingHandler },
    MiniprogramHttpBackend,
    { provide: HttpBackend, useExisting: MiniprogramHttpBackend },
  ],
})
export class HttpClientModule {}
