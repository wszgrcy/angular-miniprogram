/* eslint-disable @typescript-eslint/no-explicit-any */
import { ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram/platform';
import { initMiniProgramTestEnv } from '../../platform/test-util/init-env';
import { MpApiService } from './mp-api.service';
import { MP_PLATFORM } from './platform';

/** 可记录调用的假全局对象，替代 wx/my 等 */
function createFakeGlobal(overrides: Record<string, any> = {}) {
  return {
    navigateTo: jasmine
      .createSpy('navigateTo')
      .and.callFake((opts: any) => opts.success?.({ errMsg: 'navigateTo:ok' })),
    showToast: jasmine
      .createSpy('showToast')
      .and.callFake((opts: any) => opts.success?.({ errMsg: 'showToast:ok' })),
    getStorageSync: jasmine
      .createSpy('getStorageSync')
      .and.returnValue('stored-value'),
    request: jasmine.createSpy('request').and.returnValue({
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
      await expectAsync(
        service.invoke('showToast', { title: 'hi' }),
      ).toBeResolved();
    });

    it('fail 回调触发时 reject', async () => {
      const { service } = setup('wx', {
        showToast: (opts: any) => opts.fail?.({ errMsg: 'showToast:fail' }),
      });
      await expectAsync(
        service.invoke('showToast', { title: 'hi' }),
      ).toBeRejectedWith({ errMsg: 'showToast:fail' });
    });

    it('传了 success 回调则不走 Promise，返回 undefined', () => {
      const { service } = setup();
      let result: any;
      const ret = service.invoke('showToast', {
        title: 'hi',
        success: (res: any) => (result = res),
      });
      expect(ret).toBeUndefined();
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
      await expectAsync(service.invoke('someMissingApi')).toBeRejected();
      expect(() => service.getStorageSync('k')).toThrowError(
        /不支持 API/,
      );
    });
  });

  describe('拦截器', () => {
    it('invoke 钩子改写参数', async () => {
      const { service, fake } = setup();
      service.addInterceptor('navigateTo', {
        invoke: (ctx: any) => ({
          ...ctx,
          options: { ...ctx.options, url: '/login' },
        }),
      });
      await service.navigateTo('/home');
      expect((fake.navigateTo as any).calls.mostRecent().args[0].url).toBe(
        '/login',
      );
    });

    it('invoke 返回 false 阻断调用，目标 API 不执行、Promise 永不落定', async () => {
      const { service, fake } = setup();
      service.addInterceptor('navigateTo', { invoke: () => false });
      let settled = false;
      service
        .navigateTo('/home')
        .then(
          () => (settled = true),
          () => (settled = true),
        );
      await new Promise((r) => setTimeout(r, 10));
      expect(fake.navigateTo).not.toHaveBeenCalled();
      expect(settled).toBeFalse();
    });

    it('success 钩子改写结果', async () => {
      const { service } = setup();
      service.addInterceptor('showToast', {
        success: (res: any) => ({ ...res, tagged: true }),
      });
      let result: any;
      service.invoke('showToast', {
        title: 'x',
        success: (res: any) => (result = res),
      });
      expect(result.tagged).toBeTrue();
    });

    it('作用域拦截器只影响目标 API', () => {
      const { service } = setup();
      let navigateHits = 0;
      let toastHits = 0;
      service.addInterceptor('navigateTo', {
        success: (r: any) => {
          navigateHits++;
          return r;
        },
      });
      service.addInterceptor('showToast', {
        success: (r: any) => {
          toastHits++;
          return r;
        },
      });
      service.invoke('showToast', { title: 'x' });
      expect(toastHits).toBe(1);
      expect(navigateHits).toBe(0);
    });

    it('全局拦截器对所有 API 生效', () => {
      const { service } = setup();
      let hits = 0;
      service.addInterceptor({
        success: (r: any) => {
          hits++;
          return r;
        },
      });
      service.invoke('showToast', { title: 'a' });
      service.invoke('navigateTo', { url: '/b' });
      expect(hits).toBe(2);
    });

    it('removeInterceptor 精确移除', () => {
      const { service } = setup();
      let hits = 0;
      const interceptor = {
        success: (r: any) => {
          hits++;
          return r;
        },
      };
      service.addInterceptor('showToast', interceptor);
      service.invoke('showToast', { title: 'a' });
      expect(hits).toBe(1);
      service.removeInterceptor('showToast', interceptor);
      service.invoke('showToast', { title: 'b' });
      expect(hits).toBe(1);
    });

    it('returnValue 钩子包装 task', () => {
      const { service } = setup();
      service.addInterceptor('request', {
        returnValue: (task: any) => ({ ...task, tagged: true }),
      });
      const task = service.invoke('request', { url: 'https://x.com' });
      expect(task.tagged).toBeTrue();
    });

    it('invoke 钩子支持异步（Promise 改写参数）', async () => {
      const { service, fake } = setup();
      service.addInterceptor('navigateTo', {
        invoke: async (ctx: any) => ({
          ...ctx,
          options: { ...ctx.options, url: '/async' },
        }),
      });
      await service.navigateTo('/home');
      expect((fake.navigateTo as any).calls.mostRecent().args[0].url).toBe(
        '/async',
      );
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
      await service.setStorage('user', { id: 1 });
      const user = await service.getStorage<{ id: number }>('user');
      expect(user).toEqual({ id: 1 });
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
      await service.removeStorage('k');
      await service.clearStorage();
      expect(removed).toBe('k');
      expect(cleared).toBeTrue();
    });
  });

  describe('变更检测', () => {
    it('回调执行后通知 scheduler', () => {
      const { service } = setup();
      const scheduler = TestBed.inject(ChangeDetectionScheduler);
      const spy = spyOn(scheduler, 'notify');
      service.invoke('showToast', { title: 'x' });
      expect(spy).toHaveBeenCalled();
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
      const nativeSpy = jasmine
        .createSpy('getDeviceInfo')
        .and.returnValue({ brand: 'Apple', model: 'iPhone', system: 'iOS 16.6', platform: 'ios' });
      const { service } = setup('wx', {
        getDeviceInfo: nativeSpy,
        getSystemInfoSync: () => ({ ...sysRaw }),
      });
      const res = service.getDeviceInfo();
      expect(nativeSpy).toHaveBeenCalled();
      expect(res.osVersion).toBe('16.6');
    });

    it('无原生拆分 API 时从 getSystemInfoSync 拼', () => {
      const sysSpy = jasmine
        .createSpy('getSystemInfoSync')
        .and.returnValue({ ...sysRaw });
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
      service.addInterceptor('getSystemInfo', {
        success: (r: any) => {
          hits++;
          return r;
        },
      });
      const res = await service.getSystemInfo();
      expect(hits).toBe(1);
      expect(res.osName).toBe('ios');
    });
  });

  describe('类型化方法', () => {
    it('navigateTo 字符串参数（自动拼 __id__ 通道参数）', async () => {
      const { service, fake } = setup();
      const res = await service.navigateTo('/a');
      const url = (fake.navigateTo as any).calls.mostRecent().args[0].url;
      expect(url).toMatch(/^\/a\?__id__=\d+$/);
      expect(res.eventChannel).toBeDefined();
    });

    it('navigateBack 数字参数 -> delta', async () => {
      const spy = jasmine
        .createSpy('navigateBack')
        .and.callFake((opts: any) => opts.success?.({}));
      const { service } = setup('wx', { navigateBack: spy });
      await service.navigateBack(2);
      expect(spy.calls.mostRecent().args[0].delta).toBe(2);
    });
  });
});
