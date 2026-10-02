/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram/platform';
import { catchError, firstValueFrom, map, of, switchMap, tap } from 'rxjs';
import { initMiniProgramTestEnv } from '../../platform/test-util/init-env';
import { MpApiService } from './mp-api.service';
import { MP_API_PIPES, blockWith } from './pipe-registry';
import { MP_PLATFORM } from './platform';

/** 可记录调用的假全局对象，替代 wx/my 等 */
function createFakeGlobal(overrides: Record<string, any> = {}) {
  return {
    navigateTo: vi
      .fn()
      .mockImplementation((opts: any) =>
        opts.success?.({ errMsg: 'navigateTo:ok' }),
      ),
    showToast: vi
      .fn()
      .mockImplementation((opts: any) =>
        opts.success?.({ errMsg: 'showToast:ok' }),
      ),
    getStorageSync: vi.fn().mockReturnValue('stored-value'),
    request: vi.fn().mockReturnValue({
      abort: () => undefined,
      onProgressUpdate: () => undefined,
    }),
    ...overrides,
  };
}

describe('MpApiService', () => {
  function setup(
    platform: any = 'wx',
    overrides: Record<string, any> = {},
  ): { service: MpApiService; fake: Record<string, any> } {
    initMiniProgramTestEnv();
    const fake = createFakeGlobal(overrides);
    TestBed.configureTestingModule({
      providers: [
        { provide: MINIPROGRAM_GLOBAL_TOKEN, useValue: fake },
        { provide: MP_PLATFORM, useValue: platform },
      ],
    });
    return { service: TestBed.inject(MpApiService), fake };
  }

  describe('promise 化（对齐 uni 规则）', () => {
    it('未传回调返回 Promise，success 后 resolve', async () => {
      const { service } = setup();
      await expect(
        service.invoke('showToast', { title: 'hi' }),
      ).resolves.toBeDefined();
    });

    it('fail 回调触发时 reject', async () => {
      const { service } = setup('wx', {
        showToast: (opts: any) => opts.fail?.({ errMsg: 'showToast:fail' }),
      });
      await expect(
        service.invoke('showToast', { title: 'hi' }),
      ).rejects.toEqual({ errMsg: 'showToast:fail' });
    });

    it('回调作为旁路观察者：Promise 与回调同时可用', async () => {
      const { service } = setup();
      let result: any;
      const ret = service.invoke('showToast', {
        title: 'hi',
        success: (res: any) => (result = res),
      });
      await expect(ret).resolves.toBeDefined();
      expect(result.errMsg).toBe('showToast:ok');
    });

    it('task 类 API 返回 task 本身，不 Promise 化', () => {
      const { service } = setup();
      const task = service.invoke('request', { url: 'https://x.com' });
      expect(task).toBeDefined();
      expect(typeof task.abort).toBe('function');
      expect(typeof task.then).toBe('undefined');
    });

    it('同步 API（*Sync）直接返回结果', () => {
      const { service } = setup();
      expect(service.getStorageSync('k')).toBe('stored-value');
    });

    it('平台缺失 API：Promise 模式 reject，同步模式抛错', async () => {
      const { service } = setup('wx', { getStorageSync: undefined });
      await expect(service.invoke('someMissingApi')).rejects.toBeDefined();
      expect(() => service.getStorageSync('k')).toThrow(/不支持 API/);
    });
  });

  describe('管道拦截（rxjs）', () => {
    it('pre 管道改写参数', async () => {
      const { service, fake } = setup();
      service.setPipe('navigateTo', {
        pre: [
          map((ctx) => ({
            ...ctx,
            options: { ...ctx.options, url: '/login' },
          })),
        ],
      });
      await service.navigateTo({ url: '/home' });
      expect((fake.navigateTo as any).mock.calls.at(-1)[0].url).toBe('/login');
    });

    it('blockWith 阻断：目标 API 不执行，Promise 以 MpBlockedError 落定', async () => {
      const { service, fake } = setup();
      service.setPipe('navigateTo', { pre: [blockWith('未登录')] });
      await expect(service.navigateTo({ url: '/home' })).rejects.toThrow(
        /未登录/,
      );
      expect(fake.navigateTo).not.toHaveBeenCalled();
    });

    it('post 管道改写结果，用户回调看到改写后结果', async () => {
      const { service } = setup();
      service.setPipe('showToast', {
        post: [map((res: any) => ({ ...res, tagged: true }))],
      });
      let result: any;
      await service
        .invoke('showToast', {
          title: 'x',
          success: (res: any) => (result = res),
        })
        .then(() => undefined);
      expect(result.tagged).toBe(true);
    });

    it('post 管道可 catchError 改写错误', async () => {
      const { service } = setup('wx', {
        showToast: (o: any) => o.fail?.({ errMsg: 'showToast:fail boom' }),
      });
      service.setPipe('showToast', {
        post: [catchError((err: any) => of({ recovered: err.errMsg }))],
      });
      await expect(
        service.invoke('showToast', { title: 'x' }),
      ).resolves.toEqual({ recovered: 'showToast:fail boom' } as any);
    });

    it('作用域管道只影响目标 API', async () => {
      const { service } = setup();
      let navigateHits = 0;
      let toastHits = 0;
      service.setPipe('navigateTo', {
        post: [
          tap((r: any) => {
            navigateHits++;
            return r;
          }),
        ],
      });
      service.setPipe('showToast', {
        post: [
          tap((r: any) => {
            toastHits++;
            return r;
          }),
        ],
      });
      await service.invoke('showToast', { title: 'x' });
      expect(toastHits).toBe(1);
      expect(navigateHits).toBe(0);
    });

    it('全局管道对所有 API 生效', async () => {
      const { service } = setup();
      let hits = 0;
      service.setGlobalPipes({
        post: [
          tap(() => {
            hits++;
          }),
        ],
      });
      await service.invoke('showToast', { title: 'a' });
      await service.invoke('navigateTo', { url: '/b' });
      expect(hits).toBe(2);
    });

    it('removePipe 后不再生效', async () => {
      const { service } = setup();
      let hits = 0;
      service.setPipe('showToast', {
        post: [
          tap(() => {
            hits++;
          }),
        ],
      });
      await service.invoke('showToast', { title: 'a' });
      expect(hits).toBe(1);
      service.removePipe('showToast');
      await service.invoke('showToast', { title: 'b' });
      expect(hits).toBe(1);
    });

    it('pre 管道支持异步（switchMap 到 Promise）', async () => {
      const { service, fake } = setup();
      service.setPipe('navigateTo', {
        pre: [
          switchMap(async (ctx) => ({
            ...ctx,
            options: { ...ctx.options, url: '/async' },
          })),
        ],
      });
      await service.navigateTo({ url: '/home' });
      expect((fake.navigateTo as any).mock.calls.at(-1)[0].url).toBe('/async');
    });

    it('DI 多 provider 声明式贡献管道（同 HTTP_INTERCEPTORS）', async () => {
      initMiniProgramTestEnv();
      const fake = createFakeGlobal();
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: MINIPROGRAM_GLOBAL_TOKEN, useValue: fake },
          { provide: MP_PLATFORM, useValue: 'wx' },
          {
            provide: MP_API_PIPES,
            multi: true,
            useValue: {
              global: { post: [map((res: any) => ({ ...res, g1: true }))] },
            },
          },
          {
            provide: MP_API_PIPES,
            multi: true,
            useValue: {
              global: { post: [map((res: any) => ({ ...res, g2: true }))] },
              scoped: {
                showToast: { pre: [blockWith('禁 toast')] },
              },
            },
          },
        ],
      });
      const service = TestBed.inject(MpApiService);

      await expect(
        service.invoke('navigateTo', { url: '/a' }),
      ).resolves.toEqual({
        errMsg: 'navigateTo:ok',
        g1: true,
        g2: true,
      } as any);
      await expect(service.invoke('showToast', { title: 'x' })).rejects.toThrow(
        /禁 toast/,
      );
    });

    it('clearGlobalPipes 不影响 DI 贡献的全局管道', async () => {
      initMiniProgramTestEnv();
      const fake = createFakeGlobal();
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: MINIPROGRAM_GLOBAL_TOKEN, useValue: fake },
          { provide: MP_PLATFORM, useValue: 'wx' },
          {
            provide: MP_API_PIPES,
            multi: true,
            useValue: {
              global: { post: [map((r: any) => ({ ...r, fromDi: true }))] },
            },
          },
        ],
      });
      const service = TestBed.inject(MpApiService);
      service.setGlobalPipes({
        post: [map((r: any) => ({ ...r, runtime: true }))],
      });
      service.clearGlobalPipes();

      const res = await service.invoke('showToast', { title: 'x' });
      expect(res.fromDi).toBe(true);
      expect(res.runtime).toBeUndefined();
    });

    it('setPipe 返回句柄，dispose 撤销本次注册', async () => {
      const { service } = setup();
      const handle = service.setPipe('showToast', {
        post: [map((res: any) => ({ ...res, tagged: true }))],
      });

      expect((await service.invoke('showToast', { title: 'a' })).tagged).toBe(
        true,
      );

      handle.dispose();
      expect(
        (await service.invoke('showToast', { title: 'b' })).tagged,
      ).toBeUndefined();

      // 幂等
      handle.dispose();
      expect(
        (await service.invoke('showToast', { title: 'c' })).tagged,
      ).toBeUndefined();
    });

    it('dispose 只撤销自己，不影响其他注册', async () => {
      const { service } = setup();
      const h1 = service.setPipe('showToast', {
        post: [map((res: any) => ({ ...res, a: 1 }))],
      });
      const h2 = service.setPipe('showToast', {
        post: [map((res: any) => ({ ...res, b: 2 }))],
      });

      h1.dispose();

      const res = await service.invoke('showToast', { title: 'x' });
      expect(res.a).toBeUndefined();
      expect(res.b).toBe(2);

      h2.dispose();
      const res2 = await service.invoke('showToast', { title: 'x' });
      expect(res2.b).toBeUndefined();
    });

    it('全局管道同样可 dispose', async () => {
      const { service } = setup();
      const h = service.setGlobalPipes({
        post: [map((res: any) => ({ ...res, tracked: true }))],
      });

      expect((await service.invoke('showToast', { title: 'a' })).tracked).toBe(
        true,
      );
      expect((await service.invoke('navigateTo', { url: '/b' })).tracked).toBe(
        true,
      );

      h.dispose();
      expect(
        (await service.invoke('showToast', { title: 'a' })).tracked,
      ).toBeUndefined();
    });

    it('invoke$ 冷流：不订阅不发起调用', async () => {
      const { service, fake } = setup();
      const stream$ = service.invoke$('showToast', { title: 'x' });
      expect(fake.showToast).not.toHaveBeenCalled();
      await firstValueFrom(stream$);
      expect(fake.showToast).toHaveBeenCalledTimes(1);
    });

    it('AbortSignal：已取消则不发起调用直接 reject', async () => {
      const { service, fake } = setup();
      const controller = new AbortController();
      controller.abort('取消');
      await expect(
        service.invoke('showToast', { title: 'x', signal: controller.signal }),
      ).rejects.toBeDefined();
      expect(fake.showToast).not.toHaveBeenCalled();
    });

    it('AbortSignal：in-flight 取消以 AbortError 落定', async () => {
      const { service } = setup('wx', {
        showToast: () => undefined, // 永不回调
      });
      const controller = new AbortController();
      const promise = service.invoke('showToast', {
        title: 'x',
        signal: controller.signal,
      });
      controller.abort();
      await expect(promise).rejects.toBeDefined();
    });

    it('task 类：signal 取消自动 task.abort()', () => {
      const { service } = setup();
      const controller = new AbortController();
      const task = service.invoke('request', {
        url: 'https://x.com',
        signal: controller.signal,
      });
      const spy = vi.spyOn(task, 'abort');
      controller.abort();
      expect(spy).toHaveBeenCalled();
    });

    it('task 类：post 管道作用于结果后再触发回调', async () => {
      const { service } = setup('wx', {
        request: (opts: any) => {
          setTimeout(() => opts.success?.({ statusCode: 200 }), 0);
          return { abort: () => undefined };
        },
      });
      service.setPipe('request', {
        post: [map((res: any) => ({ ...res, tagged: true }))],
      });
      let result: any;
      service.invoke('request', {
        url: 'https://x.com',
        success: (res: any) => (result = res),
      });
      await new Promise((r) => setTimeout(r, 10));
      expect(result.tagged).toBe(true);
    });
  });

  describe('异步存储类型化方法', () => {
    it('setStorage/getStorage 往返', async () => {
      const store: Record<string, any> = {};
      const { service } = setup('wx', {
        setStorage: (o: any) => {
          store[o.key] = o.data;
          o.success?.({});
        },
        getStorage: (o: any) => o.success?.({ data: store[o.key] }),
      });
      await service.invoke('setStorage', { key: 'user', data: { id: 1 } });
      const res = await service.invoke<'getStorage', { data: { id: number } }>(
        'getStorage',
        { key: 'user' },
      );
      expect(res.data).toEqual({ id: 1 });
    });

    it('removeStorage/clearStorage', async () => {
      let removed = '';
      let cleared = false;
      const { service } = setup('wx', {
        removeStorage: (o: any) => {
          removed = o.key;
          o.success?.({});
        },
        clearStorage: (o: any) => {
          cleared = true;
          o.success?.({});
        },
      });
      await service.invoke('removeStorage', { key: 'k' });
      await service.invoke('clearStorage');
      expect(removed).toBe('k');
      expect(cleared).toBe(true);
    });
  });

  describe('系统信息族方法', () => {
    const sysRaw = {
      brand: 'Apple',
      model: 'iPhone 14',
      system: 'iOS 16.6',
      platform: 'ios',
      language: 'zh_CN',
      SDKVersion: '8.0.30',
      pixelRatio: 3,
      windowWidth: 390,
      screenHeight: 844,
    };

    it('getSystemInfoSync 返回增强结果', () => {
      const { service } = setup('wx', {
        getSystemInfoSync: () => ({ ...sysRaw }),
      });
      const res = service.getSystemInfoSync();
      expect(res.osName).toBe('ios');
      expect(res.hostName).toBe('WeChat');
      expect(res.deviceId).toBeDefined();
    });

    it('getDeviceInfo 优先用平台原生拆分 API', () => {
      const nativeSpy = vi.fn().mockReturnValue({
        brand: 'Apple',
        model: 'iPhone',
        system: 'iOS 16.6',
        platform: 'ios',
      });
      const { service } = setup('wx', {
        getDeviceInfo: nativeSpy,
        getSystemInfoSync: () => ({ ...sysRaw }),
      });
      const res = service.getDeviceInfo();
      expect(nativeSpy).toHaveBeenCalled();
      expect(res.osVersion).toBe('16.6');
    });

    it('无原生拆分 API 时从 getSystemInfoSync 拼', () => {
      const sysSpy = vi.fn().mockReturnValue({ ...sysRaw });
      const { service } = setup('my', { getSystemInfoSync: sysSpy });
      const res = service.getWindowInfo();
      expect(sysSpy).toHaveBeenCalled();
      expect(res.windowWidth).toBe(390);
      expect(res.windowTop).toBe(0);
    });

    it('异步 getSystemInfo 走 invoke 管线，可被拦截', async () => {
      const { service } = setup('wx', {
        getSystemInfo: (opts: any) => opts.success?.({ ...sysRaw }),
      });
      let hits = 0;
      service.setPipe('getSystemInfo', {
        post: [
          tap(() => {
            hits++;
          }),
        ],
      });
      const res = await service.getSystemInfo();
      expect(hits).toBe(1);
      expect(res.osName).toBe('ios');
    });
  });

  describe('类型化方法', () => {
    it('navigateTo 字符串参数（自动拼 __id__ 通道参数）', async () => {
      const { service, fake } = setup();
      const res = await service.navigateTo({ url: '/a' });
      const url = (fake.navigateTo as any).mock.calls.at(-1)[0].url;
      expect(url).toMatch(/^\/a\?__id__=\d+$/);
      expect(res.eventChannel).toBeDefined();
    });

    it('navigateBack 数字参数 -> delta', async () => {
      const spy = vi.fn().mockImplementation((opts: any) => opts.success?.({}));
      const { service } = setup('wx', { navigateBack: spy });
      await service.invoke('navigateBack', { delta: 2 });
      expect(spy.mock.calls.at(-1)[0].delta).toBe(2);
    });
  });
});
