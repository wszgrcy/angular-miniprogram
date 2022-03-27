import { NgModule } from '@angular/core';
import { DoBootstrap } from '@angular/core';
import { MiniProgramModule } from 'angular-miniprogram';
@NgModule({
  declarations: [],
  imports: [MiniProgramModule],
  exports: [],
  providers: [],
})
export class MainTestModule implements DoBootstrap {
  constructor() {}
  ngDoBootstrap() {}
}
