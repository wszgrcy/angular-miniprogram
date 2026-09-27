import { NgModule } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { withMiniProgramRequest } from './provider';

@NgModule({
  providers: [provideHttpClient(withMiniProgramRequest())],
})
export class HttpClientModule {}
