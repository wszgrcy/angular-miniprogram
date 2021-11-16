import { Type } from '@angular/core';
import { generateWxComponent } from './component.base';

export function componentRegistry<M, C>(
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
