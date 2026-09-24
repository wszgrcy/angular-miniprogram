/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpBackend,
  withFetch,
  withXhr,
  withInterceptors,
  provideHttpClient,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { MiniprogramHttpBackend } from './backend';
import { withMiniProgramRequest } from './provider';
import { initMiniProgramTestEnv } from '../test-util/init-env';

/**
 * `provideHttpClient` / `withMiniProgramRequest` 的装配语义。
 *
 * 官方 `withFetch` 的实现是
 * `makeHttpFeature(HttpFeatureKind.Fetch, [FetchBackend, {provide: HttpBackend, useExisting: FetchBackend}])`
 * —— backend 走 **feature 机制**，不是在外面往 providers 里追加。
 * 本模块必须同构，否则用户显式传的 backend feature 会被静默覆盖，
 * 且绕过 provideHttpClient 的 devMode 校验。
 */
describe('http provider（feature 装配）', () => {
  beforeEach(() => {
    initMiniProgramTestEnv();
  });

  describe('withMiniProgramRequest 是合法的 HttpFeature', () => {
    it('带 ɵkind 与 ɵproviders 两个字段', () => {
      const feature: any = withMiniProgramRequest();

      expect(typeof feature.ɵkind).toBe('number');
      expect(Array.isArray(feature.ɵproviders)).toBe(true);
      expect(feature.ɵproviders.length).toBe(2);
    });

    it('providers 内容是把 HttpBackend 指向本类', () => {
      const providers: any[] = (withMiniProgramRequest() as any).ɵproviders;

      expect(providers).toContain(MiniprogramHttpBackend);

      const backendBinding = providers.find(
        (p: any) => p?.provide === HttpBackend,
      );
      expect(backendBinding).toBeTruthy();
      expect(backendBinding.useExisting).toBe(MiniprogramHttpBackend);
    });
  });

  describe('provideHttpClient 装配结果', () => {
    it('HttpBackend 解析为 MiniprogramHttpBackend', () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClient(withMiniProgramRequest())],
      });

      expect(
        TestBed.inject(HttpBackend) instanceof MiniprogramHttpBackend,
      ).toBe(true);
    });

    it('其他 feature（如 withInterceptors）照常透传，不干扰 backend', () => {
      const interceptor: any = (req: any, next: any) => next.handle(req);

      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(
            withInterceptors([interceptor]),
            withMiniProgramRequest(),
          ),
        ],
      });

      // backend 仍是小程序的，拦截器 feature 没有把覆盖弄丢
      expect(
        TestBed.inject(HttpBackend) instanceof MiniprogramHttpBackend,
      ).toBe(true);
    });
  });
});
