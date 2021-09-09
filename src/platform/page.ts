import { Type } from '@angular/core';
import { generateWxComponent } from './component.base';
import { AppOptions, WxComponentInstance } from './type';

export function pageStartup<M, C>(
  module: Type<M>,
  component: Type<C>,
  componentOptions?: Partial<WechatMiniprogram.Component.Options<{}, {}, {}>>
) {
  let wxComponentFactory = generateWxComponent(component, componentOptions);
  const app = getApp<AppOptions>();
  app.__pageModuleLoadedMap = new Map();
  app.__pageModuleLoadingMap = new Map();
  wxComponentFactory((wxComponentInstance: WxComponentInstance) => {
    let result = app.__ngStartPage(module, component, wxComponentInstance);
    return Promise.resolve({
      ngModuleInstance: result.ngModuleRef.instance,
      componentRef: result.componentRef,
    });
  }, true);
}
