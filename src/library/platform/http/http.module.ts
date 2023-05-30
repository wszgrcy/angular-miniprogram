import { NgModule } from '@angular/core';
import {
  HttpBackend,
  provideHttpClient,
  withInterceptorsFromDi,
} from 'angular-miniprogram/common/http';
import { MiniprogramHttpBackend } from './backend';
@NgModule({
  declarations: [],
  imports: [],
  exports: [],
  providers: [
    MiniprogramHttpBackend,
    provideHttpClient(
      {
        ɵkind: 2,
        ɵproviders: [
          { provide: HttpBackend, useExisting: MiniprogramHttpBackend },
        ],
      },
      withInterceptorsFromDi()
    ),
  ],
})
export class HttpClientModule {}
