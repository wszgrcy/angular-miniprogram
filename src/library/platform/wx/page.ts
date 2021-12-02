import { Type } from '@angular/core';
import { AppOptions } from '../type';
import { generateWxComponent } from './component.base';
import { WxComponentInstance } from './type';

export function pageStartup<M, C>(
  module: Type<M>,
  component: Type<C>,
  componentOptions?: Partial<WechatMiniprogram.Component.Options<{}, {}, {}>>
) {
  const wxComponentFactory = generateWxComponent(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component as any,
    componentOptions,
    false
  );
  const app = getApp<AppOptions>();
  app.__pageModuleLoadedMap = new Map();
  app.__pageModuleLoadingMap = new Map();
  wxComponentFactory((wxComponentInstance: WxComponentInstance) => {
    const result = app.__ngStartPage(module, component, wxComponentInstance);
    return Promise.resolve({
      ngModuleInstance: result.ngModuleRef.instance,
      componentRef: result.componentRef,
    });
  }, true);
}
