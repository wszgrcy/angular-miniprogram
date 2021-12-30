import {
  StaticProvider,
  createPlatformFactory,
  platformCore,
} from '@angular/core';
import { MiniProgramCore } from 'angular-miniprogram/platform/wx';
import { APP_TOKEN, MINIPROGRAM_GLOBAL_TOKEN } from './token';

export function platformMiniProgram<T>(
  extraProviders: StaticProvider[] = [],
  app?: T
) {
  return createPlatformFactory(platformCore, 'miniProgram', [
    { provide: APP_TOKEN, useValue: MiniProgramCore.loadApp(app || {}) },
    {
      provide: MINIPROGRAM_GLOBAL_TOKEN,
      useValue: MiniProgramCore.MINIPROGRAM_GLOBAL,
    },
  ])(extraProviders);
}
