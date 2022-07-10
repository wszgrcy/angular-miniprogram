import {
  ApplicationRef,
  Inject,
  Injectable,
  Injector,
  NgZone,
  Type,
  createNgModuleRef,
} from '@angular/core';
import {
  AppOptions,
  MiniProgramComponentInstance,
} from 'angular-miniprogram/platform/type';
import { PAGE_TOKEN } from 'angular-miniprogram/platform/wx';
import { APP_TOKEN } from './token';

@Injectable()
export class PageService {
  constructor(
    private injector: Injector,
    private applicationRef: ApplicationRef,
    @Inject(APP_TOKEN) private app: AppOptions,
    private ngZone: NgZone
  ) {}

  register() {
    console.log('注册__ngStartPage');
    this.app.__ngStartPage = <M, C>(
      module: Type<M>,
      component: Type<C>,
      miniProgramComponentInstance: MiniProgramComponentInstance
    ) => {
      return this.ngZone.run(() => {
        const injector = Injector.create({
          providers: [
            { provide: PAGE_TOKEN, useValue: miniProgramComponentInstance },
          ],
          parent: this.injector,
        });
        const ngModuleRef = createNgModuleRef(module, injector);
        const componentFactory =
          ngModuleRef.componentFactoryResolver.resolveComponentFactory(
            component
          );
        const componentRef = componentFactory.create(injector);
        this.applicationRef.attachView(componentRef.hostView);
        return { componentRef, ngModuleRef };
      });
    };
    this.app.__ngStartPageResolve();
  }
}
