import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoBootstrap } from '@angular/core';
import { WeixinMiniProgramModule } from '../../../src/platform/module/weixin-mini-program.module';
@NgModule({
  declarations: [],
  imports: [WeixinMiniProgramModule],
  exports: [],
  providers: [],
})
export class MainModule implements DoBootstrap {
  // 拿到Compiler,然后设置到全局
  // 子通过全局的启动
  constructor() {}
  ngDoBootstrap() {}
}
