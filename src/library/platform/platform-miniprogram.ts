import {
  StaticProvider,
  createPlatformFactory,
  platformCore,
} from '@angular/core';
import { MiniProgramCore } from 'angular-miniprogram/platform/wx';
import { APP_TOKEN, MINIPROGRAM_GLOBAL_TOKEN } from './token';
import {
  FAKE_DOCUMENT_PROVIDER,
  installFakeDocument,
} from './util/fake-document';

export function platformMiniProgram<T>(
  extraProviders: StaticProvider[] = [],
  app?: T
) {
  // Angular 22 的 createComponentRef 会无条件要一个真 Document，
  // 小程序没有，先装占位物，否则 NG0210。详见 fake-document.ts。
  installFakeDocument();

  return createPlatformFactory(platformCore, 'miniProgram', [
    { provide: APP_TOKEN, useValue: MiniProgramCore.loadApp(app || {}) },
    {
      provide: MINIPROGRAM_GLOBAL_TOKEN,
      useValue: MiniProgramCore.MINIPROGRAM_GLOBAL,
    },
    FAKE_DOCUMENT_PROVIDER,
  ])(extraProviders);
}
