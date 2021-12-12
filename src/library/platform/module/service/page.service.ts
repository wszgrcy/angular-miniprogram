import {
  ApplicationRef,
  Compiler,
  Inject,
  Injectable,
  Injector,
  NgZone,
  Type,
} from '@angular/core';
import { AppOptions } from 'angular-miniprogram/platform/type';
import { APP_TOKEN } from '../token/app.token';
import { PAGE_TOKEN } from '../token/page.token';

@Injectable()
export class PageService {
  constructor(
    private injector: Injector,
    private compiler: Compiler,
    private applicationRef: ApplicationRef,
    @Inject(APP_TOKEN) private app: AppOptions,
    private ngZone: NgZone
  ) {}

  register() {
    this.app.__ngStartPage = <M, C>(
      module: Type<M>,
      component: Type<C>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      miniProgramComponentInstance: any
    ) => {
      return this.ngZone.run(() => {
        const moduleFactory = this.compiler.compileModuleSync(module);
        const injector = Injector.create({
          providers: [
            { provide: PAGE_TOKEN, useValue: miniProgramComponentInstance },
          ],
          parent: this.injector,
        });
        const ngModuleRef = moduleFactory.create(injector);
        const componentFactory =
          ngModuleRef.componentFactoryResolver.resolveComponentFactory(
            component
          );
        const componentRef = componentFactory.create(injector);
        this.applicationRef.attachView(componentRef.hostView);
        return { componentRef, ngModuleRef };
      });
    };
  }
}
