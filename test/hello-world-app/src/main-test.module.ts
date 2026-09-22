import {
  DoBootstrap,
  NgModule,
  provideZonelessChangeDetection,
} from '@angular/core';
import { MiniProgramModule } from 'angular-miniprogram';
@NgModule({
  declarations: [],
  imports: [MiniProgramModule],
  exports: [],
  // 不再引入 zone.js，使用 zoneless 变更检测
  providers: [provideZonelessChangeDetection()],
})
export class MainTestModule implements DoBootstrap {
  constructor() {}
  ngDoBootstrap() {}
}
