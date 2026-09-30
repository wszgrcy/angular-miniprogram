/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram/platform';
import { take } from 'rxjs';
import { initMiniProgramTestEnv } from '../../platform/test-util/init-env';
import { MpApiService } from './mp-api.service';
import { MP_PLATFORM } from './platform';

describe('MpApiService 域方法', () => {
  function setup(
    platform: any = 'wx',
    overrides: Record<string, any> = {},
  ): { service: MpApiService; fake: Record<string, any> } {
    initMiniProgramTestEnv();
    const fake: Record<string, any> = {
      scanCode: jasmine
        .createSpy('scanCode')
        .and.callFake((o: any) =>
          o.success?.({ result: 'ABC', scanType: 'qrCode' }),
        ),
      setClipboardData: jasmine
        .createSpy('setClipboardData')
        .and.callFake((o: any) => o.success?.({})),
      getClipboardData: jasmine
        .createSpy('getClipboardData')
        .and.callFake((o: any) => o.success?.({ data: 'hello' })),
      getScreenBrightness: jasmine
        .createSpy('getScreenBrightness')
        .and.callFake((o: any) => o.success?.({ value: 0.5 })),
      getAppAuthorizeSetting: jasmine
        .createSpy('getAppAuthorizeSetting')
        .and.returnValue({ cameraAuthorized: 'authorized' }),
      createAnimation: jasmine
        .createSpy('createAnimation')
        .and.returnValue({ __animation: true }),
      ...overrides,
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: MINIPROGRAM_GLOBAL_TOKEN, useValue: fake },
        { provide: MP_PLATFORM, useValue: platform },
      ],
    });
    return { service: TestBed.inject(MpApiService), fake };
  }

  describe('一次性动作 -> Promise', () => {
    it('scanCode resolve 结果', async () => {
      const { service } = setup();
      const res = await service.scanCode({ onlyFromCamera: true });
      expect(res.result).toBe('ABC');
      expect(res.scanType).toBe('qrCode');
    });

    it('剪贴板 set / get', async () => {
      const { service, fake } = setup();
      await service.setClipboardData({ data: 'x' });
      expect((fake.setClipboardData as any).calls.mostRecent().args[0].data).toBe(
        'x',
      );
      expect(await service.getClipboardData()).toEqual({ data: 'hello' });
    });

    it('getScreenBrightness 返回 { value }', async () => {
      const { service } = setup();
      expect(await service.getScreenBrightness()).toEqual({ value: 0.5 });
    });

    it('setKeepScreenOn 收 { keepScreenOn }', async () => {
      const { service } = setup('wx', {
        setKeepScreenOn: jasmine
          .createSpy('setKeepScreenOn')
          .and.callFake((o: any) => o.success?.({})),
      });
      await service.setKeepScreenOn({ keepScreenOn: true });
      expect(
        (service.getRawApi('setKeepScreenOn') as any).calls.mostRecent().args[0]
          .keepScreenOn,
      ).toBeTrue();
    });

    it('createBLEConnection 是异步的（create* 中的例外）', async () => {
      const { service } = setup('wx', {
        createBLEConnection: (o: any) => o.success?.({}),
      });
      const ret = service.createBLEConnection({ deviceId: 'd1' });
      expect(typeof ret.then).toBe('function');
      await expectAsync(ret).toBeResolved();
    });

    it('平台失败时 Promise reject', async () => {
      const { service } = setup('wx', {
        scanCode: (o: any) => o.fail?.({ errMsg: 'scanCode:fail' }),
      });
      await expectAsync(service.scanCode()).toBeRejectedWith({
        errMsg: 'scanCode:fail',
      });
    });

    it('getBLEDeviceRSSI 返回 { rssi }', async () => {
      const { service, fake } = setup('wx', {
        getBLEDeviceRSSI: jasmine
          .createSpy('getBLEDeviceRSSI')
          .and.callFake((o: any) => o.success?.({ rssi: -63 })),
      });
      const res = await service.getBLEDeviceRSSI({ deviceId: 'd1' });
      expect(res.rssi).toBe(-63);
      expect((fake.getBLEDeviceRSSI as any).calls.mostRecent().args[0].deviceId).toBe(
        'd1',
      );
    });

    it('setBLEMTU 透传 deviceId + mtu', async () => {
      const { service, fake } = setup('wx', {
        setBLEMTU: jasmine
          .createSpy('setBLEMTU')
          .and.callFake((o: any) => o.success?.({})),
      });
      await service.setBLEMTU({ deviceId: 'd1', mtu: 185 });
      const arg = (fake.setBLEMTU as any).calls.mostRecent().args[0];
      expect(arg.deviceId).toBe('d1');
      expect(arg.mtu).toBe(185);
    });

    it('preloadPage / unPreloadPage 收 { url }', async () => {
      const { service, fake } = setup('wx', {
        preloadPage: jasmine
          .createSpy('preloadPage')
          .and.callFake((o: any) => o.success?.({})),
        unPreloadPage: jasmine
          .createSpy('unPreloadPage')
          .and.callFake((o: any) => o.success?.({})),
      });
      await service.preloadPage({ url: '/pages/a/a' });
      await service.unPreloadPage({ url: '/pages/a/a' });
      expect((fake.preloadPage as any).calls.mostRecent().args[0].url).toBe(
        '/pages/a/a',
      );
      expect((fake.unPreloadPage as any).calls.mostRecent().args[0].url).toBe(
        '/pages/a/a',
      );
    });
  });

  describe('同步 API', () => {
    it('getAppAuthorizeSetting 直接返回', () => {
      const { service } = setup();
      expect(service.getAppAuthorizeSetting().cameraAuthorized).toBe(
        'authorized',
      );
    });

    it('createAnimation 透传平台对象', () => {
      const { service } = setup();
      expect(service.createAnimation({ duration: 200 }).__animation).toBeTrue();
    });
  });

  describe('on*/off* -> Observable', () => {
    it('订阅即注册，退订即移除', () => {
      let registered: any = null;
      let removed: any = null;
      const { service } = setup('wx', {
        onAccelerometer: (h: any) => (registered = h),
        offAccelerometer: (h: any) => (removed = h),
      });

      const stream$ = service.onAccelerometer();
      expect(registered).toBeNull();

      const seen: any[] = [];
      const sub = stream$.subscribe((v) => seen.push(v));
      expect(typeof registered).toBe('function');

      registered({ x: 1, y: 2, z: 3 });
      expect(seen.length).toBe(1);
      expect(seen[0].x).toBe(1);

      sub.unsubscribe();
      expect(removed).toBe(registered);
    });

    it('多订阅共享同一注册，全部退订才移除', () => {
      let offCalls = 0;
      const { service } = setup('wx', {
        onCompass: (h: any) => void h,
        offCompass: () => offCalls++,
      });
      const stream$ = service.onCompass();
      const a = stream$.subscribe();
      const b = stream$.subscribe();
      a.unsubscribe();
      expect(offCalls).toBe(1);
      b.unsubscribe();
      expect(offCalls).toBe(2);
    });

    it('平台缺 off 时退订不报错', () => {
      const { service } = setup('wx', {
        onWindowResize: (h: any) => h({ windowWidth: 375, windowHeight: 600 }),
      });
      const seen: any[] = [];
      service
        .onWindowResize()
        .pipe(take(1))
        .subscribe((v) => seen.push(v));
      expect(seen[0].windowWidth).toBe(375);
    });
  });

  describe('Context 包装', () => {
    function fakeRecorder() {
      const handlers: Record<string, any> = {};
      return {
        handlers,
        start(opts: any) {
          handlers.onStart?.({ tempFilePath: '/a.mp3', ...opts });
        },
        stop() {
          handlers.onStop?.({ tempFilePath: '/a.mp3' });
        },
        onStart(h: any) {
          handlers.onStart = h;
        },
        onStop(h: any) {
          handlers.onStop = h;
        },
      };
    }

    it('on(event) 得到事件流，方法透传到原始对象', () => {
      const rec = fakeRecorder();
      const { service } = setup('wx', {
        getRecorderManager: () => rec,
      });
      const manager = service.getRecorderManager();

      const started: any[] = [];
      const stopped: any[] = [];
      manager.on('start').subscribe((v: any) => started.push(v));
      manager.on('stop').subscribe((v: any) => stopped.push(v));

      manager.start({ format: 'mp3' });
      manager.stop();

      expect(started.length).toBe(1);
      expect(started[0].tempFilePath).toBe('/a.mp3');
      expect(stopped.length).toBe(1);
    });

    it('退订后 off 被调用，原始 handler 被摘掉', () => {
      let offStart: any = null;
      const rec = {
        onStart(h: any) {
          (this as any)._on = h;
        },
        offStart(h: any) {
          offStart = h;
        },
      };
      const { service } = setup('wx', { getRecorderManager: () => rec });
      const manager = service.getRecorderManager();
      const sub = manager.on('start').subscribe();
      sub.unsubscribe();
      expect(offStart).toBe((rec as any)._on);
    });

    it('raw 拿到原始对象', () => {
      const rec = fakeRecorder();
      const { service } = setup('wx', { getRecorderManager: () => rec });
      expect(service.getRecorderManager().raw).toBe(rec as any);
    });

    it('不支持的事件报错', async () => {
      const { service } = setup('wx', { getRecorderManager: () => ({}) });
      await expectAsync(service.getRecorderManager().on('nope').toPromise()).toBeRejectedWithError(
        /不支持事件/,
      );
    });
  });

  describe('canIUse 能力探测', () => {
    it('改名 API 用平台真名探测', () => {
      const { service, fake } = setup('my', {
        canIUse: jasmine
          .createSpy('canIUse')
          .and.callFake((n: string) => n === 'setNavigationBar'),
      });
      expect(service.canIUse('setNavigationBarTitle')).toBeTrue();
      expect((fake.canIUse as any).calls.mostRecent().args[0]).toBe(
        'setNavigationBar',
      );
    });

    it('未走协议表解析时会误报，此处验证已修正', () => {
      const { service } = setup('my', {
        canIUse: (n: string) => n === 'setNavigationBar',
      });
      // 直接拿统一名去问会得到 false，走表解析后为 true
      expect(service.canIUse('setNavigationBarTitle')).toBeTrue();
    });

    it('钉钉 request -> httpRequest 同样走解析', () => {
      const { service, fake } = setup('dd', {
        canIUse: jasmine
          .createSpy('canIUse')
          .and.callFake((n: string) => n === 'httpRequest'),
      });
      expect(service.canIUse('request')).toBeTrue();
      expect((fake.canIUse as any).calls.mostRecent().args[0]).toBe(
        'httpRequest',
      );
    });

    it('custom 协议需全部合成 API 就位', () => {
      const { service } = setup('my', {
        canIUse: (n: string) => n === 'alert',
      });
      expect(service.canIUse('showModal')).toBeFalse();
    });

    it('custom 协议全部就位为 true', () => {
      const { service } = setup('my', {
        canIUse: () => true,
      });
      expect(service.canIUse('showModal')).toBeTrue();
    });

    it('平台无 canIUse 时落到函数存在性判断', () => {
      const { service } = setup('my', {
        setNavigationBar: () => {},
      });
      expect(service.canIUse('setNavigationBarTitle')).toBeTrue();
      // makePhoneCall 未在 fake 中提供，函数不存在 -> 不支持
      expect(service.canIUse('makePhoneCall')).toBeFalse();
    });

    it('平台 canIUse 抛错时不致于误报不支持', () => {
      const { service } = setup('my', {
        canIUse: () => {
          throw new Error('unsupported schema');
        },
        setNavigationBar: () => {},
      });
      expect(service.canIUse('setNavigationBarTitle')).toBeTrue();
    });

    it('无协议映射的 API 用统一名探测', () => {
      const { service, fake } = setup('wx', {
        canIUse: jasmine.createSpy('canIUse').and.returnValue(true),
      });
      expect(service.canIUse('scanCode')).toBeTrue();
      expect((fake.canIUse as any).calls.mostRecent().args[0]).toBe('scanCode');
    });
  });
});
