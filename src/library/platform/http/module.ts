import { NgModule } from '@angular/core';
import { withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClient } from './provider';

@NgModule({
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class HttpClientModule { }
