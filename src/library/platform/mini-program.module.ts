import {
  ApplicationModule,
  ErrorHandler,
  NgModule,
  RendererFactory2,
  ɵINJECTOR_SCOPE,
} from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import {
  ComponentFinderService,
  MiniProgramRendererFactory,
} from 'angular-miniprogram/platform/wx';
import { PageService } from './page.service';

export function errorHandler(): ErrorHandler {
  return new ErrorHandler();
}

@NgModule({
  declarations: [],
  imports: [CommonModule, ApplicationModule],
  providers: [
    { provide: ɵINJECTOR_SCOPE, useValue: 'root' },
    { provide: ErrorHandler, useFactory: errorHandler, deps: [] },
    MiniProgramRendererFactory,
    {
      provide: RendererFactory2,
      useExisting: MiniProgramRendererFactory,
    },
    PageService,
    ComponentFinderService,
  ],
  exports: [CommonModule, ApplicationModule],
})
export class MiniProgramModule {
  constructor(pageService: PageService) {
    pageService.register();
  }
}
