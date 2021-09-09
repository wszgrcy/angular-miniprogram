import { Injector, Type } from '@angular/core';
import { AppOptions, ModuleInitResult, WxComponentInstance } from './type';
import { generateWxComponent } from './component.base';
export function componentRegistry<M, C>(
  module: Type<M>,
  component: Type<C>,
  componentOptions: Partial<
    WechatMiniprogram.Component.Options<{}, {}, {}>
  > = {}
) {
  const app = getApp<AppOptions>();
  module.prototype.initComponent = function (injector: Injector) {
    let promise = app.__pageModuleLoadingMap.get(module);
    if (promise) {
      promise({ injector, instance: this });
    } else {
      app.__pageModuleLoadedMap.set(
        module,
        Promise.resolve({ injector, instance: this })
      );
    }
  };

  let ngInitFactory = async (wxComponentInstance_1: WxComponentInstance) => {
    let result = app.__pageModuleLoadedMap.get(module);
    if (!result) {
      let resolve!: (value_2: ModuleInitResult) => void;
      let reject;
      let p = new Promise<ModuleInitResult>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      app.__pageModuleLoadingMap.set(module, resolve);
      app.__pageModuleLoadedMap.set(module, p);
      result = p;
    }
    const { injector, instance } = await result;
    let componentRef = app.__ngStartComponent(
      injector,
      component,
      wxComponentInstance_1
    );
    return { ngModuleInstance: instance, componentRef };
  };

  let wxComponentFactory = generateWxComponent(component, componentOptions);
  wxComponentFactory(ngInitFactory);
}
