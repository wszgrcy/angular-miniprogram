import {
  ComponentRef,
  Injector,
  NgModuleRef,
  NgZone,
  Type,
} from '@angular/core';
import 'miniprogram-api-typings';
export interface AppOptions {
  __ngStartPage<M, C>(
    module: Type<M>,
    component: Type<C>,
    wxComponentInstance: WxComponentInstance
  ): {
    componentRef: ComponentRef<C>;
    ngModuleRef: NgModuleRef<M>;
  };
  __ngStartComponent<C>(
    injector: Injector,
    component: Type<C>,
    wxComponentInstance: WxComponentInstance
  ): ComponentRef<C>;
  __pageModuleLoadedMap: Map<any, Promise<ModuleInitResult>>;
  __pageModuleLoadingMap: Map<any, (result: ModuleInitResult) => void>;
}
export interface WxLifetimes {
  wxLifetimes?: WechatMiniprogram.Component.Lifetimes['lifetimes'];
  wxPageLifetimes?: Partial<WechatMiniprogram.Component.PageLifetimes>;
}
export type WxComponentInstance = WechatMiniprogram.Component.Instance<
  Record<string, any>,
  {},
  { __ngComponentDestroy: () => void },
  {
    __ngComponentInstance: any;
    __waitNgComponentInit: Promise<any>;
    __ngComponentInjector: Injector;
    __ngZone: NgZone;
    __ngComponentRef: ComponentRef<any>;
    /** 未变更的所有属性 */
    __unchangedInputs: Set<string>;
    /** wx初始化ng未初始化时保存 */
    __initialInputValues: Map<string, any> | undefined;
    /** 是否为第一次变更检测 */
    __firstChange: boolean;
    __firstChangeFunction: Function;
  }
>;

export type ComponentInitFactory = (instance: WxComponentInstance) => Promise<{
  ngModuleInstance: any;
  componentRef: ComponentRef<any>;
}>;

export type ModuleInitResult = { injector: Injector; instance: any };
