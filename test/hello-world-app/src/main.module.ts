import { NgModule } from '@angular/core';
import { DoBootstrap } from '@angular/core';
import { MiniProgramModule } from 'angular-miniprogram';
@NgModule({
  declarations: [],
  imports: [MiniProgramModule],
  exports: [],
  providers: [],
})
export class MainModule implements DoBootstrap {
  constructor() {}
  ngDoBootstrap() {}
}
