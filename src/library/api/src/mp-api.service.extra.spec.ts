/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram/platform';
import { initMiniProgramTestEnv } from '../../platform/test-util/init-env';
import { MP_API_PROXY, MpApiProxy } from './mp-api.proxy';
import { MpApiService } from './mp-api.service';
import { MP_PLATFORM } from './platform';

describe('Proxy 补充面：授权 / 会话 / 启动参数 / 键盘 / soter', () => {
  function setup(
    platform: any = 'wx',
    overrides: Record<string, any> = {},
  ): { proxy: MpApiProxy; service: MpApiService; fake: Record<string, any> } {
    initMiniProgramTestEnv();
    const fake = {
      authorize: jasmine
        .createSpy('authorize')
        .and.callFake((opts: any) =>
          opts.success?.({ errMsg: 'authorize:ok' }),
        ),
      getSetting: jasmine
        .createSpy('getSetting')
        .and.callFake((opts: any) =>
          opts.success?.({ authSetting: { 'scope.userLocation': true } }),
        ),
      getLaunchOptionsSync: jasmine
        .createSpy('getLaunchOptionsSync')
        .and.returnValue({ path: 'pages/index/index', scene: 1001 }),
      ...overrides,
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: MINIPROGRAM_GLOBAL_TOKEN, useValue: fake },
        { provide: MP_PLATFORM, useValue: platform },
      ],
    });
    return {
      proxy: TestBed.inject(MP_API_PROXY),
      service: TestBed.inject(MpApiService),
      fake,
    };
  }

  it('authorize 透传 scope', async () => {
    const { proxy, fake } = setup();
    await proxy.authorize({ scope: 'scope.userLocation' });
    expect((fake.authorize as any).calls.mostRecent().args[0].scope).toBe(
      'scope.userLocation',
    );
  });

  it('getSetting 返回 authSetting', async () => {
    const { proxy } = setup();
    const res = await proxy.getSetting();
    expect(res.authSetting['scope.userLocation']).toBeTrue();
  });

  it('支付宝系 getSetting 经协议映射到 getAuthSetting', async () => {
    const getAuthSetting = jasmine
      .createSpy('getAuthSetting')
      .and.callFake((opts: any) => opts.success?.({ authSetting: {} }));
    const { proxy } = setup('my', { getAuthSetting });
    await proxy.getSetting();
    expect(getAuthSetting).toHaveBeenCalled();
  });

  it('getLaunchOptionsSync 同步返回', () => {
    const { proxy } = setup();
    expect(proxy.getLaunchOptionsSync().path).toBe('pages/index/index');
  });

  it('onKeyboardHeightChange 返回可退订的流', () => {
    let handler: any;
    const { proxy } = setup('wx', {
      onKeyboardHeightChange: (cb: any) => (handler = cb),
      offKeyboardHeightChange: () => (handler = undefined),
    });
    const seen: any[] = [];
    const sub = proxy.onKeyboardHeightChange().subscribe((r: any) => seen.push(r));
    handler({ height: 250 });
    expect(seen.length).toBe(1);
    expect(seen[0].height).toBe(250);
    sub.unsubscribe();
    expect(handler).toBeUndefined();
  });

  it('checkIsSupportSoterAuthentication Promise 化', async () => {
    const { proxy } = setup('wx', {
      checkIsSupportSoterAuthentication: (opts: any) =>
        opts.success?.({ supportMode: ['finger-print'] }),
    });
    const res: any = await proxy.checkIsSupportSoterAuthentication();
    expect(res.supportMode).toEqual(['finger-print']);
  });

  it('hasApi：协议映射后的名字也算可用', () => {
    const { service } = setup('my', {
      getAuthSetting: () => undefined,
    });
    expect(service.hasApi('getSetting')).toBeTrue();
    expect(service.hasApi('totallyMissing')).toBeFalse();
  });

  it('event$ 无 off 配对时退订不抛错', () => {
    const { service } = setup();
    const sub = service.event$('onError').subscribe();
    expect(() => sub.unsubscribe()).not.toThrow();
  });
});
