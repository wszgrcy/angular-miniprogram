import { Injector, Type } from '@angular/core';
import { generateWxComponent } from './component.base';
import { AppOptions, ModuleInitResult, WxComponentInstance } from './type';

export function componentRegistry<M, C>(
  module: Type<M>,
  component: Type<C>,
  componentOptions: Partial<
    WechatMiniprogram.Component.Options<{}, {}, {}>
  > = {}
) {
  const wxComponentFactory = generateWxComponent(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component as any,
    componentOptions,
    true
  );
  wxComponentFactory(undefined as any);
}
