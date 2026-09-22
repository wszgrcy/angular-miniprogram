import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Inject,
  Injectable,
  Injector,
  Type,
  createComponent,
  createNgModule,
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
        const ngModuleRef = createNgModule(module, injector);
        // Angular 22 删掉了 ComponentFactoryResolver / NgModuleRef.componentFactoryResolver。
        // 非 standalone 组件的作用域在编译时已经通过模块的编译挂到组件 def 上，
        // 这里用模块的 injector 当 environmentInjector 走 createComponent 即可。
        const componentRef: ComponentRef<C> = createComponent(component, {
          environmentInjector: ngModuleRef.injector,
          elementInjector: injector,
        });
        this.applicationRef.attachView(componentRef.hostView);
        return { componentRef, ngModuleRef };
      });
    };

    this.app.__ngStartPageResolve();
  }
}
