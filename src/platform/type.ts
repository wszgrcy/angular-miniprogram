import {
  ComponentRef,
  Injector,
  NgModuleRef,
  NgZone,
  Type,
} from '@angular/core';
import 'miniprogram-api-typings';
import { LView } from './internal-type';

export interface AppOptions {
  __ngStartPage<M, C>(
    module: Type<M>,
    component: Type<C>,
    wxComponentInstance: WxComponentInstance
  ): {
    componentRef: ComponentRef<C>;
    ngModuleRef: NgModuleRef<M>;
  };
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
    /** 小程序组件是否与lview链接成功 */
    __isLink: boolean;
    __lView: LView;
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
  ɵcmpMeta: { method: string[] };
}
