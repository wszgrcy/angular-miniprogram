/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram/platform';
import { map } from 'rxjs';
import { initMiniProgramTestEnv } from '../../platform/test-util/init-env';
import { MP_API_PROXY, MpApiProxy } from './mp-api.proxy';
import { MpApiService } from './mp-api.service';
import { MP_PLATFORM } from './platform';

function createFakeGlobal(overrides: Record<string, any> = {}) {
  const listeners = new Set<(res: any) => void>();
  return {
    showToast: vi
      .fn()
      .mockImplementation((opts: any) =>
        opts.success?.({ errMsg: 'showToast:ok' }),
      ),
    navigateTo: vi
      .fn()
      .mockImplementation((opts: any) =>
        opts.success?.({ errMsg: 'navigateTo:ok' }),
      ),
    getStorageSync: vi.fn().mockReturnValue('stored'),
    onLocationChange: (cb: (res: any) => void) => listeners.add(cb),
    offLocationChange: (cb: (res: any) => void) => listeners.delete(cb),
    fireLocationChange(res: any) {
      listeners.forEach((cb) => cb(res));
    },
    get listenerCount() {
      return listeners.size;
    },
    ...overrides,
  };
}

describe('MP_API_PROXY（uni 式兜底）', () => {
  function setup(
    platform: any = 'wx',
    overrides: Record<string, any> = {},
  ): { proxy: MpApiProxy; service: MpApiService; fake: Record<string, any> } {
    initMiniProgramTestEnv();
    const fake = createFakeGlobal(overrides);
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

  it('已知 API：走 invoke 管线，异步返回 Promise', async () => {
    const { proxy } = setup();
    await expect(proxy.showToast({ title: 'hi' })).resolves.toBeDefined();
  });

  it('同步 API 直接返回值', () => {
    const { proxy } = setup();
    expect((proxy.getStorageSync as any)('k')).toBe('stored');
  });

  it('未知 API 属性为 undefined（与 uni 兜底语义一致）', () => {
    const { proxy } = setup();
    expect(proxy.someNotExistsApi).toBeUndefined();
  });

  it('in 运算符：存在为 true，缺失为 false', () => {
    const { proxy } = setup();
    expect('showToast' in proxy).toBe(true);
    expect('nope' in proxy).toBe(false);
  });

  it('on* 名字：不传参返回 Observable，退订自动 off', () => {
    const { proxy, fake } = setup();
    const stream = (proxy as any).onLocationChange();
    const seen: any[] = [];
    const sub = stream.subscribe((res: any) => seen.push(res));
    fake.fireLocationChange({ latitude: 1 });
    expect(seen.length).toBe(1);
    expect(seen[0].latitude).toBe(1);
    expect(fake.listenerCount).toBe(1);
    sub.unsubscribe();
    expect(fake.listenerCount).toBe(0);
  });

  it('on* 名字：传回调返回 Subscription（uni 肌肉记忆）', () => {
    const { proxy, fake } = setup();
    let received: any;
    const sub = (proxy as any).onLocationChange((res: any) => {
      received = res;
    });
    fake.fireLocationChange({ latitude: 2 });
    expect(received.latitude).toBe(2);
    sub.unsubscribe();
    expect(fake.listenerCount).toBe(0);
  });

  it('管道拦截照常生效（复用 MpApiService 管线）', async () => {
    const { proxy, service, fake } = setup();
    service.setPipe('navigateTo', {
      pre: [
        map((ctx) => ({
          ...ctx,
          options: { ...ctx.options, url: '/login' },
        })),
      ],
    });
    await (proxy.navigateTo as any)({ url: '/home' });
    expect((fake.navigateTo as any).mock.calls.at(-1)[0].url).toBe('/login');
  });

  it('协议归一同样生效：支付宝 getSetting -> getAuthSetting', async () => {
    const getAuthSetting = vi
      .fn()
      .mockImplementation((opts: any) =>
        opts.success?.({ authSetting: { 'scope.userLocation': true } }),
      );
    const { proxy } = setup('my', { getAuthSetting });
    await (proxy.getSetting as any)();
    expect(getAuthSetting).toHaveBeenCalled();
  });

  it('同一 API 多次取属性返回同一函数（缓存）', () => {
    const { proxy } = setup();
    expect(proxy.showToast).toBe(proxy.showToast);
  });
});
