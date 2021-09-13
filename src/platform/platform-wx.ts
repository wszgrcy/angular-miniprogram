import {
  PLATFORM_INITIALIZER,
  StaticProvider,
  createPlatformFactory,
  platformCore,
} from '@angular/core';
import { componentTemplateHookFactory } from './component-template-hook.factory';
import { APP_TOKEN } from './module/token/app.token';
import { AppOptions } from './type';

export function platformWeixinMiniProgram(
  extraProviders: StaticProvider[] = [],
  app: Parameters<WechatMiniprogram.App.Constructor>[0] = {}
) {
  return createPlatformFactory(platformCore, 'weixinMiniProgram', [
    { provide: APP_TOKEN, useValue: loadWeixinApp(app) },
    {
      provide: PLATFORM_INITIALIZER,
      useFactory: () => componentTemplateHookFactory,
      deps: [],
      multi: true,
    },
  ])(extraProviders);
}

export function loadWeixinApp(
  app: Parameters<WechatMiniprogram.App.Constructor>[0] = {}
) {
  App(app);
  const appInstance = getApp<AppOptions>();
  return appInstance;
}
