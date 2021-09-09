import {
  ErrorHandler,
  NgModule,
  RendererFactory2,
  ɵINJECTOR_SCOPE,
  ApplicationModule,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeixinMiniProgramRendererFactory } from './weixin-mini-program.renderer.factory';
import { PageService } from './service/page.service';
export function errorHandler(): ErrorHandler {
  return new ErrorHandler();
}

@NgModule({
  declarations: [],
  imports: [CommonModule, ApplicationModule],
  providers: [
    { provide: ɵINJECTOR_SCOPE, useValue: 'root' },

    { provide: ErrorHandler, useFactory: errorHandler, deps: [] },
    {
      provide: WeixinMiniProgramRendererFactory,
      useClass: WeixinMiniProgramRendererFactory,
    },
    {
      provide: RendererFactory2,
      useExisting: WeixinMiniProgramRendererFactory,
    },
    PageService,
  ],
  exports: [CommonModule, ApplicationModule],
})
export class WeixinMiniProgramModule {
  constructor(pageService: PageService) {
    pageService.register();
  }
}
