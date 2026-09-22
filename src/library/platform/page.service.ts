import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Inject,
  Injectable,
  Injector,
  Type,
  createComponent,
  createNgModuleRef,
} from '@angular/core';
import {
  AppOptions,
  MiniProgramComponentInstance,
} from 'angular-miniprogram/platform/type';
import { PAGE_TOKEN } from 'angular-miniprogram/platform/wx';
import { APP_TOKEN } from './token';
import { runInAngular } from './util/change-detection';

@Injectable()
export class PageService {
  constructor(
    private injector: Injector,
    private environmentInjector: EnvironmentInjector,
    private applicationRef: ApplicationRef,
    @Inject(APP_TOKEN) private app: AppOptions
  ) {}

  /** 给页面组件建一个带 PAGE_TOKEN 的子注入器 */
  private createPageInjector(
    miniProgramComponentInstance: MiniProgramComponentInstance
  ) {
    return Injector.create({
      providers: [
        { provide: PAGE_TOKEN, useValue: miniProgramComponentInstance },
      ],
      parent: this.injector,
    });
  }

  register() {
    // standalone 组件启动，不需要 NgModule
    this.app.__ngStartPage = <C>(
      component: Type<C>,
      miniProgramComponentInstance: MiniProgramComponentInstance
    ) => {
      return runInAngular(this.injector, () => {
        const injector = this.createPageInjector(miniProgramComponentInstance);
        const componentRef: ComponentRef<C> = createComponent(component, {
          environmentInjector: this.environmentInjector,
          elementInjector: injector,
        });
        this.applicationRef.attachView(componentRef.hostView);
        return { componentRef };
      });
    };

    /**
     * @deprecated NgModule 启动方式，仅为兼容 `pageStartup(module, component)` 保留。
     */
    this.app.__ngStartPageWithModule = <M, C>(
      module: Type<M>,
      component: Type<C>,
      miniProgramComponentInstance: MiniProgramComponentInstance
    ) => {
      return runInAngular(this.injector, () => {
        const injector = this.createPageInjector(miniProgramComponentInstance);
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
