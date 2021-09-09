import { PLATFORM_INITIALIZER, StaticProvider } from '@angular/core';
import { createPlatformFactory } from '@angular/core';
import { platformCore } from '@angular/core';
import { AppOptions } from './type';
import { APP_TOKEN } from './module/token/app.token';
import { componentTemplateHookFactory } from './component-template-hook.factory';

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
  App({
    ...app,
    onLaunch(options) {
      app && app.onLaunch && app.onLaunch(options);
    },
  });
  const appInstance = getApp<AppOptions>();
  return appInstance;
}
