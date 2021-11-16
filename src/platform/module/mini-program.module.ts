import { CommonModule } from '@angular/common';
import {
  ApplicationModule,
  ErrorHandler,
  NgModule,
  RendererFactory2,
  ɵINJECTOR_SCOPE,
} from '@angular/core';
import { MiniProgramRendererFactory } from './mini-program.renderer.factory';
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
      provide: MiniProgramRendererFactory,
      useClass: MiniProgramRendererFactory,
    },
    {
      provide: RendererFactory2,
      useExisting: MiniProgramRendererFactory,
    },
    PageService,
  ],
  exports: [CommonModule, ApplicationModule],
})
export class MiniProgramModule {
  constructor(pageService: PageService) {
    pageService.register();
  }
}
