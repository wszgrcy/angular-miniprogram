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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __pageModuleLoadedMap: Map<Type<any>, Promise<ModuleInitResult>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __pageModuleLoadingMap: Map<Type<any>, (result: ModuleInitResult) => void>;
}
export interface WxLifetimes {
  wxLifetimes?: WechatMiniprogram.Component.Lifetimes['lifetimes'];
  wxPageLifetimes?: Partial<WechatMiniprogram.Component.PageLifetimes>;
}
export type WxComponentInstance = WechatMiniprogram.Component.Instance<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Record<string, any>,
  {},
  { __ngComponentDestroy: () => void },
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __ngComponentInstance: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __waitNgComponentInit: Promise<any>;
    __ngComponentInjector: Injector;
    __ngZone: NgZone;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __ngComponentRef: ComponentRef<any>;
    /** 未变更的所有属性 */
    __unchangedInputs: Set<string>;
    /** wx初始化ng未初始化时保存 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __initialInputValues: Map<string, any> | undefined;
    /** 是否为第一次变更检测 */
    __firstChange: boolean;
    __firstChangeFunction: Function;
  }
>;

export type ComponentInitFactory = (instance: WxComponentInstance) => Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ngModuleInstance: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  componentRef: ComponentRef<any>;
}>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModuleInitResult = { injector: Injector; instance: any };

export interface NgCompileComponent {
  ɵcmp: {
    inputs: Record<string, string[] | string>;
    outputs: Record<string, string>;
  };
}
