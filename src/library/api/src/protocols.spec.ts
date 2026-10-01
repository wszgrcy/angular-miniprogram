/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram/platform';
import { tap } from 'rxjs';
import { initMiniProgramTestEnv } from '../../platform/test-util/init-env';
import { MpApiService } from './mp-api.service';
import { MP_PLATFORM } from './platform';

describe('平台协议归一化（uni 口径 -> 各家实际 API）', () => {
  function setup(platform: any, fake: Record<string, any>) {
    initMiniProgramTestEnv();
    TestBed.configureTestingModule({
      providers: [
        { provide: MINIPROGRAM_GLOBAL_TOKEN, useValue: fake },
        { provide: MP_PLATFORM, useValue: platform },
      ],
    });
    return TestBed.inject(MpApiService);
  }

  describe('支付宝(my)', () => {
    it('showModal showCancel=false -> my.alert，结果归一为 confirm=true', async () => {
      const alertSpy = jasmine
        .createSpy('alert')
        .and.callFake((opts: any) => opts.success?.({}));
      const service = setup('my', { alert: alertSpy });
      const res = await service.invoke('showModal', {
        title: 't',
        content: 'c',
        showCancel: false,
      });
      expect(alertSpy).toHaveBeenCalled();
      expect(res.confirm).toBeTrue();
      expect(res.cancel).toBeFalse();
    });

    it('showModal 双按钮 -> my.confirm，confirmText 映射为 confirmButtonText', async () => {
      const confirmSpy = jasmine
        .createSpy('confirm')
        .and.callFake((opts: any) => opts.success?.({ confirm: true }));
      const service = setup('my', { confirm: confirmSpy });
      const res = await service.invoke('showModal', {
        content: 'c',
        confirmText: '好',
        cancelText: '不',
      });
      const args = confirmSpy.calls.mostRecent().args[0];
      expect(args.confirmButtonText).toBe('好');
      expect(args.cancelButtonText).toBe('不');
      expect(res.confirm).toBeTrue();
      expect(res.cancel).toBeFalse();
    });

    it('setNavigationBarTitle -> my.setNavigationBar', async () => {
      const spy = jasmine
        .createSpy('setNavigationBar')
        .and.callFake((opts: any) => opts.success?.({}));
      const service = setup('my', { setNavigationBar: spy });
      await service.invoke('setNavigationBarTitle', { title: 'T' });
      expect(spy.calls.mostRecent().args[0].title).toBe('T');
    });

    it('showToast: title->content, icon error->fail', async () => {
      const spy = jasmine
        .createSpy('showToast')
        .and.callFake((opts: any) => opts.success?.({}));
      const service = setup('my', { showToast: spy });
      await service.invoke('showToast', { title: 'hi', icon: 'error' });
      const args = spy.calls.mostRecent().args[0];
      expect(args.content).toBe('hi');
      expect(args.type).toBe('fail');
      expect(args.title).toBeUndefined();
    });

    it('showLoading: title->content', async () => {
      const spy = jasmine
        .createSpy('showLoading')
        .and.callFake((opts: any) => opts.success?.({}));
      const service = setup('my', { showLoading: spy });
      await service.invoke('showLoading', { title: '加载中' });
      expect(spy.calls.mostRecent().args[0].content).toBe('加载中');
    });

    it('setClipboardData: my.setClipboard + data->text', async () => {
      const spy = jasmine
        .createSpy('setClipboard')
        .and.callFake((opts: any) => opts.success?.({}));
      const service = setup('my', { setClipboard: spy });
      await service.invoke('setClipboardData', { data: 'copy-me' });
      expect(spy.calls.mostRecent().args[0].text).toBe('copy-me');
    });

    it('getClipboardData: my.getClipboard + 结果 text->data', async () => {
      const spy = jasmine
        .createSpy('getClipboard')
        .and.callFake((opts: any) => opts.success?.({ text: 'clip' }));
      const service = setup('my', { getClipboard: spy });
      const res = await service.invoke('getClipboardData');
      expect(res.data).toBe('clip');
    });

    it('getStorageSync: 拆封 {data}', () => {
      const service = setup('my', {
        getStorageSync: () => ({ data: 'stored' }),
      });
      expect(service.getStorageSync('k')).toBe('stored');
    });

    it('getStorageSync: 无存储归一为空串', () => {
      const service = setup('my', {
        getStorageSync: () => ({ data: null }),
      });
      expect(service.getStorageSync('k')).toBe('');
    });

    it('getNetworkType 结果归一：NOTREACHABLE->none, WWAN->3g', async () => {
      const service = setup('my', {
        getNetworkType: (opts: any) =>
          opts.success?.({ networkType: 'NOTREACHABLE' }),
      });
      const res = await service.invoke('getNetworkType');
      expect(res.networkType).toBe('none');
    });

    it('makePhoneCall phoneNumber -> number', async () => {
      const spy = jasmine
        .createSpy('makePhoneCall')
        .and.callFake((opts: any) => opts.success?.({}));
      const service = setup('my', { makePhoneCall: spy });
      await service.invoke('makePhoneCall', { phoneNumber: '10086' });
      expect(spy.calls.mostRecent().args[0].number).toBe('10086');
    });

    it('previewImage current(url) -> 下标', async () => {
      const spy = jasmine
        .createSpy('previewImage')
        .and.callFake((opts: any) => opts.success?.({}));
      const service = setup('my', { previewImage: spy });
      await service.invoke('previewImage', {
        urls: ['a.png', 'b.png', 'c.png'],
        current: 'b.png',
      });
      expect(spy.calls.mostRecent().args[0].current).toBe(1);
    });

    it('showActionSheet 对象项归一为字符串', async () => {
      const spy = jasmine
        .createSpy('showActionSheet')
        .and.callFake((opts: any) => opts.success?.({ tapIndex: 0 }));
      const service = setup('my', { showActionSheet: spy });
      await service.invoke('showActionSheet', {
        itemList: [{ name: 'A' }, 'B'],
      });
      // my 收 items（旧版协议误写 itemList，已对照 uni 修正）
      expect(spy.calls.mostRecent().args[0].items).toEqual(['A', 'B']);
      expect(spy.calls.mostRecent().args[0].itemList).toBeUndefined();
    });
  });

  describe('通用结果归一（支付宝系 errMsg）', () => {
    it('成功结果补 errMsg: ok', async () => {
      const service = setup('my', {
        showToast: (opts: any) => opts.success?.({ random: 1 }),
      });
      const res = await service.invoke('showToast', { title: 'x' });
      expect(res.errMsg).toBe('showToast:ok');
      expect(res.random).toBe(1);
    });

    it('error/errorMessage 转为 errMsg fail 并移除原字段', async () => {
      const service = setup('my', {
        someApi: (opts: any) =>
          opts.fail?.({ error: 2, errorMessage: 'no permission', keep: 1 }),
      });
      let rejected: any;
      await service.invoke('someApi').catch((e) => (rejected = e));
      expect(rejected.errMsg).toBe('someApi:fail no permission');
      expect(rejected.keep).toBe(1);
      expect(rejected.error).toBeUndefined();
      expect(rejected.errorMessage).toBeUndefined();
    });

    it('fail 载荷同样被归一（保留其他字段）', async () => {
      const service = setup('my', {
        someApi: (opts: any) =>
          opts.fail?.({ error: 'E1', keep: 'v' }),
      });
      let rejected: any;
      await service.invoke('someApi').catch((e) => (rejected = e));
      expect(rejected.errMsg).toBe('someApi:fail E1');
      expect(rejected.keep).toBe('v');
      expect(rejected.error).toBeUndefined();
    });

    it('钉钉同样应用通用归一', async () => {
      const service = setup('dd', {
        hideLoading: (opts: any) => opts.success?.({}),
      });
      const res = await service.invoke('hideLoading');
      expect(res.errMsg).toBe('hideLoading:ok');
    });

    it('微信不注入 errMsg（无通用归一）', async () => {
      const service = setup('wx', {
        showToast: (opts: any) => opts.success?.({ existed: true }),
      });
      const res = await service.invoke('showToast', { title: 'x' });
      expect(res.errMsg).toBeUndefined();
      expect(res.existed).toBeTrue();
    });

    it('Error 实例不被归一污染', async () => {
      const err = new Error('boom');
      const service = setup('my', {
        someApi: (opts: any) => opts.fail?.(err),
      });
      let rejected: any;
      await service.invoke('someApi').catch((e) => (rejected = e));
      expect(rejected).toBe(err);
    });

    it('errMsg 归一发生在 post 管道之前（管道看到归一后结果）', async () => {
      let seen: any;
      const service = setup('my', {
        showToast: (opts: any) => opts.success?.({}),
      });
      service.setPipe('showToast', {
        post: [
          tap((res: any) => {
            seen = res;
          }),
        ],
      });
      await service.invoke('showToast', { title: 'x' });
      expect(seen.errMsg).toBe('showToast:ok');
    });
  });

  describe('钉钉(dd)', () => {
    it('request -> dd.httpRequest', () => {
      const spy = jasmine.createSpy('httpRequest').and.returnValue({ id: 1 });
      const service = setup('dd', { httpRequest: spy });
      const task = service.invoke('request', { url: 'https://x.com' });
      expect(spy).toHaveBeenCalled();
      expect(task.id).toBe(1);
    });

    it('钉钉 getStorageSync 同样拆封', () => {
      const service = setup('dd', {
        getStorageSync: () => ({ data: 42 }),
      });
      expect(service.getStorageSync('k')).toBe(42);
    });

    it('showModal -> dd.alert / dd.confirm', async () => {
      const alertSpy = jasmine
        .createSpy('alert')
        .and.callFake((opts: any) => opts.success?.({}));
      const service = setup('dd', { alert: alertSpy });
      const res = await service.invoke('showModal', { content: 'c', showCancel: false });
      expect(alertSpy).toHaveBeenCalled();
      expect(res.confirm).toBeTrue();
    });
  });

  describe('支付宝(my) 搬运自 uni-mp-alipay 的协议', () => {
    it('login -> my.getAuthCode，authCode 归一为 code', async () => {
      const spy = jasmine
        .createSpy('getAuthCode')
        .and.callFake((o: any) => o.success?.({ authCode: 'A1' }));
      const service = setup('my', { getAuthCode: spy });
      const res = await service.invoke('login');
      expect(spy).toHaveBeenCalled();
      expect(res.code).toBe('A1');
    });

    it('request header -> headers（key 小写化），结果 status -> statusCode', () => {
      const spy = jasmine
        .createSpy('request')
        .and.callFake((o: any) => {
          o.success?.({ status: 200, headers: { A: 'b' }, data: 'ok' });
          return { abort: () => undefined };
        });
      const service = setup('my', { request: spy });
      // request 是 task 类：invoke 返回 task，结果走回调旁路
      let res: any;
      service.invoke('request', {
        url: 'https://x.com',
        header: { 'Content-Type': 'application/json' },
        success: (r: any) => (res = r),
      });
      const arg = (spy as any).calls.mostRecent().args[0];
      expect(arg.headers['content-type']).toBe('application/json');
      expect(arg.header).toBeUndefined();
      expect(res.statusCode).toBe(200);
      expect(res.header).toEqual({ A: 'b' });
    });

    it('chooseImage apFilePaths 补齐 tempFilePaths / tempFiles', async () => {
      const service = setup('my', {
        chooseImage: (o: any) =>
          o.success?.({ apFilePaths: ['/a.png', '/b.png'] }),
      });
      const res = await service.invoke('chooseImage', {});
      expect(res.tempFilePaths).toEqual(['/a.png', '/b.png']);
      expect(res.tempFiles).toEqual([{ path: '/a.png' }, { path: '/b.png' }]);
    });

    it('scanCode -> my.scan，onlyFromCamera -> hideAlbum，code -> result', async () => {
      const spy = jasmine
        .createSpy('scan')
        .and.callFake((o: any) => o.success?.({ code: 'ABC' }));
      const service = setup('my', { scan: spy });
      const res = await service.invoke('scanCode', { onlyFromCamera: true });
      const arg = (spy as any).calls.mostRecent().args[0];
      expect(arg.hideAlbum).toBeTrue();
      expect(res.result).toBe('ABC');
    });

    it('downloadFile apFilePath -> tempFilePath', () => {
      const service = setup('my', {
        downloadFile: (o: any) => {
          o.success?.({ apFilePath: '/d.png', statusCode: 200 });
          return { abort: () => undefined };
        },
      });
      let res: any;
      service.invoke('downloadFile', {
        url: 'https://x',
        success: (r: any) => (res = r),
      });
      expect(res.tempFilePath).toBe('/d.png');
    });

    it('saveFile 参数与结果双向映射 apFilePath', async () => {
      const spy = jasmine
        .createSpy('saveFile')
        .and.callFake((o: any) => {
          expect(o.apFilePath).toBe('/tmp/a');
          o.success?.({ apFilePath: '/saved/a' });
        });
      const service = setup('my', { saveFile: spy });
      const res = await service.invoke('saveFile', { tempFilePath: '/tmp/a' });
      expect(res.savedFilePath).toBe('/saved/a');
    });

    it('getSavedFileList fileList 字段归一', async () => {
      const service = setup('my', {
        getSavedFileList: (o: any) =>
          o.success?.({
            fileList: [{ apFilePath: '/s/a', createTime: 1, size: 2 }],
          }),
      });
      const res = await service.invoke('getSavedFileList');
      expect(res.fileList[0].filePath).toBe('/s/a');
    });

    it('showActionSheet itemList -> items，index -> tapIndex', async () => {
      const spy = jasmine
        .createSpy('showActionSheet')
        .and.callFake((o: any) => {
          expect(o.items).toEqual(['a', 'b']);
          o.success?.({ index: 1 });
        });
      const service = setup('my', { showActionSheet: spy });
      const res = await service.invoke('showActionSheet', {
        itemList: ['a', { name: 'b' }],
      });
      expect(res.tapIndex).toBe(1);
    });

    it('getScreenBrightness brightness -> value；setScreenBrightness value -> brightness', async () => {
      const setSpy = jasmine
        .createSpy('setScreenBrightness')
        .and.callFake((o: any) => {
          expect(o.brightness).toBe(0.5);
          o.success?.({});
        });
      const service = setup('my', {
        setScreenBrightness: setSpy,
        getScreenBrightness: (o: any) => o.success?.({ brightness: 0.8 }),
      });
      const res = await service.invoke('getScreenBrightness');
      expect(res.value).toBe(0.8);
      await service.invoke('setScreenBrightness', { value: 0.5 });
    });

    it('requestPayment -> my.tradePay', async () => {
      const spy = jasmine
        .createSpy('tradePay')
        .and.callFake((o: any) => {
          expect(o.tradeNO).toBe('T1');
          o.success?.({ resultCode: '9000' });
        });
      const service = setup('my', { tradePay: spy });
      await service.invoke('requestPayment', { orderInfo: 'T1' });
      expect(spy).toHaveBeenCalled();
    });

    it('compressImage quality -> compressLevel，src -> apFilePaths', async () => {
      const spy = jasmine
        .createSpy('compressImage')
        .and.callFake((o: any) => {
          expect(o.compressLevel).toBe(2);
          expect(o.apFilePaths).toEqual(['/a.png']);
          o.success?.({ apFilePaths: ['/c.png'] });
        });
      const service = setup('my', { compressImage: spy });
      const res = await service.invoke('compressImage', {
        src: '/a.png',
        quality: 60,
      });
      expect(res.tempFilePath).toBe('/c.png');
    });

    it('authorize scope -> scopeName', async () => {
      const spy = jasmine
        .createSpy('authorize')
        .and.callFake((o: any) => {
          expect(o.scopeName).toBe('scope.userLocation');
          o.success?.({});
        });
      const service = setup('my', { authorize: spy });
      await service.invoke('authorize', { scope: 'scope.userLocation' });
      expect(spy).toHaveBeenCalled();
    });

    it('onBLEConnectionStateChange -> onBLEConnectionStateChanged（事件名映射）', () => {
      let registered: any = null;
      const service = setup('my', {
        onBLEConnectionStateChanged: (h: any) => (registered = h),
        offBLEConnectionStateChanged: () => (registered = null),
      });
      const seen: any[] = [];
      service
        .event$('onBLEConnectionStateChange', 'offBLEConnectionStateChange')
        .subscribe((v) => seen.push(v));
      expect(typeof registered).toBe('function');
      registered({ deviceId: 'd', connected: true });
      expect(seen[0].deviceId).toBe('d');
    });

    it('onNetworkStatusChange 事件结果值域归一', () => {
      let handler: any = null;
      const service = setup('my', {
        onNetworkStatusChange: (h: any) => (handler = h),
      });
      const seen: any[] = [];
      service
        .event$('onNetworkStatusChange', 'offNetworkStatusChange')
        .subscribe((v) => seen.push(v));
      handler({ isConnected: false, networkType: 'NOTREACHABLE' });
      expect(seen[0].networkType).toBe('none');
    });

    it('stopAccelerometer -> my.offAccelerometerChange', async () => {
      const spy = jasmine
        .createSpy('offAccelerometerChange')
        .and.callFake((o: any) => o.success?.({}));
      const service = setup('my', { offAccelerometerChange: spy });
      await service.invoke('stopAccelerometer');
      expect(spy).toHaveBeenCalled();
    });

    it('onAccelerometerChange -> my.onAccelerometer（事件名映射）', () => {
      let handler: any = null;
      const service = setup('my', {
        onAccelerometer: (h: any) => (handler = h),
        offAccelerometer: () => undefined,
      });
      const seen: any[] = [];
      const sub = service
        .event$('onAccelerometerChange', 'offAccelerometerChange')
        .subscribe((v) => seen.push(v));
      handler({ x: 1, y: 2, z: 3 });
      expect(seen[0].x).toBe(1);
      sub.unsubscribe();
    });

    it('getNetworkType 支付宝：networkType 归一 + errMsg 补齐', async () => {
      const service = setup('my', {
        getNetworkType: (o: any) =>
          o.success?.({ networkType: 'WWAN', errMsg: 'getNetworkType:ok' }),
      });
      const res = await service.invoke('getNetworkType');
      expect(res.networkType).toBe('3g');
      expect(res.errMsg).toBe('getNetworkType:ok');
    });

    it('getUserInfo 旧版支付宝 -> getAuthUserInfo 拼装 userInfo', async () => {
      const service = setup('my', {
        getAuthUserInfo: (o: any) =>
          o.success?.({ nickName: 'nick', avatar: 'http://a.png' }),
      });
      const res = await service.invoke('getUserInfo');
      expect(res.userInfo.nickName).toBe('nick');
      expect(res.userInfo.avatarUrl).toBe('http://a.png');
    });

    it('getUserInfo 新版支付宝 -> getOpenUserInfo（response JSON 解析）', async () => {
      const g: any = globalThis;
      const saved = g.my;
      g.my = { canIUse: (name: string) => name === 'getOpenUserInfo' };
      try {
        const service = setup('my', {
          getOpenUserInfo: (o: any) =>
            o.success?.({
              response: JSON.stringify({
                response: { nickName: 'n2', avatar: 'http://b.png' },
              }),
            }),
        });
        const res = await service.invoke('getUserInfo');
        expect(res.userInfo.nickName).toBe('n2');
        expect(res.userInfo.avatarUrl).toBe('http://b.png');
      } finally {
        if (saved === undefined) {
          delete g.my;
        } else {
          g.my = saved;
        }
      }
    });

    it('chooseAddress -> my.getAddress，result 字段重组为 wx 口径', async () => {
      const service = setup('my', {
        getAddress: (o: any) =>
          o.success?.({
            result: {
              fullname: '张三',
              area: '西湖区',
              prov: '浙江省',
              city: '杭州市',
              address: '某路 1 号',
              mobilePhone: '13800000000',
            },
          }),
      });
      const res = await service.invoke('chooseAddress');
      expect(res.userName).toBe('张三');
      expect(res.provinceName).toBe('浙江省');
      expect(res.cityName).toBe('杭州市');
      expect(res.countyName).toBe('西湖区');
      expect(res.detailInfo).toBe('某路 1 号');
      expect(res.telNumber).toBe('13800000000');
    });

    it('getFileSystemManager：支付宝 recursive stat 对象转数组', () => {
      const manager = {
        stat(options: any) {
          options.success?.({ stats: { a: { mode: 1 }, b: { mode: 2 } } });
        },
      };
      const service = setup('my', { getFileSystemManager: () => manager });
      const fs: any = service.invoke('getFileSystemManager');
      let stats: any;
      fs.stat({ recursive: true, success: (res: any) => (stats = res.stats) });
      expect(Array.isArray(stats)).toBeTrue();
      expect(stats.length).toBe(2);
      // 非 recursive 不动
      let raw: any;
      fs.stat({ path: '/x', success: (res: any) => (raw = res.stats) });
      expect(Array.isArray(raw)).toBeFalse();
    });
  });

  describe('支付宝补充协议（hideHomeButton/陀螺仪/系统信息）', () => {
    it('hideHomeButton -> my.hideBackHome', async () => {
      const spy = jasmine
        .createSpy('hideBackHome')
        .and.callFake((o: any) => o.success?.({}));
      const service = setup('my', { hideBackHome: spy });
      await service.invoke('hideHomeButton');
      expect(spy).toHaveBeenCalled();
    });

    it('showShareMenu -> my.showSharePanel', async () => {
      const spy = jasmine
        .createSpy('showSharePanel')
        .and.callFake((o: any) => o.success?.({}));
      const service = setup('my', { showSharePanel: spy });
      await service.invoke('showShareMenu');
      expect(spy).toHaveBeenCalled();
    });

    it('stopGyroscope -> my.offGyroscopeChange', async () => {
      const spy = jasmine
        .createSpy('offGyroscopeChange')
        .and.callFake((o: any) => o.success?.({}));
      const service = setup('my', { offGyroscopeChange: spy });
      await service.invoke('stopGyroscope');
      expect(spy).toHaveBeenCalled();
    });

    it('getDeviceInfo -> my.getDeviceBaseInfo', () => {
      const spy = jasmine
        .createSpy('getDeviceBaseInfo')
        .and.returnValue({ brand: 'HUAWEI' });
      const service = setup('my', { getDeviceBaseInfo: spy });
      service.getDeviceInfo();
      expect(spy).toHaveBeenCalled();
    });

    it('saveImageToPhotosAlbum 旧版支付宝 -> my.saveImage', async () => {
      let received: any;
      const service = setup('my', {
        saveImage: (o: any) => {
          received = o;
          o.success?.({});
        },
      });
      await service.invoke('saveImageToPhotosAlbum', { filePath: 'p' });
      expect(received.url).toBe('p');
      expect(received.filePath).toBeUndefined();
    });

    it('getSystemInfoSync 归一：screen/safeAreaInsets/platform', () => {
      const service = setup('my', {
        getSystemInfoSync: () => ({
          platform: 'iOS',
          screen: { width: 390, height: 844 },
          safeArea: { top: 47, left: 0, right: 390, bottom: 810 },
        }),
      });
      const res: any = service.invoke('getSystemInfoSync');
      expect(res.screenWidth).toBe(390);
      expect(res.screenHeight).toBe(844);
      expect(res.safeAreaInsets.top).toBe(47);
      expect(res.platform).toBe('ios');
    });
  });

  describe('wx 宿主 shim（shareVideoMessage）', () => {
    it('普通环境直接走 wx.shareVideoMessage', async () => {
      const spy = jasmine
        .createSpy('shareVideoMessage')
        .and.callFake((o: any) => o.success?.({}));
      const service = setup('wx', { shareVideoMessage: spy });
      await service.invoke('shareVideoMessage', { videoId: 'v' });
      expect(spy).toHaveBeenCalled();
    });

    it('SAAASDK 宿主走 wx.miniapp.shareVideoMessage', () => {
      const g: any = globalThis;
      const saved = g.wx;
      let viaMiniapp = false;
      g.wx = {
        getAppBaseInfo: () => ({ host: { env: 'SAAASDK' } }),
        miniapp: {
          shareVideoMessage: () => {
            viaMiniapp = true;
          },
        },
      };
      try {
        const service = setup('wx', {
          shareVideoMessage: () => {
            throw new Error('不应走普通 API');
          },
        });
        void service.invoke('shareVideoMessage', { videoId: 'v' });
        expect(viaMiniapp).toBeTrue();
      } finally {
        if (saved === undefined) {
          delete g.wx;
        } else {
          g.wx = saved;
        }
      }
    });
  });

  describe('宿主主题事件（onHostThemeChange）', () => {
    it('订阅即注册 onThemeChange，结果归一 hostTheme，退订 off', () => {
      let handler: any = null;
      let offed = false;
      const service = setup('wx', {
        onThemeChange: (h: any) => (handler = h),
        offThemeChange: () => (offed = true),
      });
      const seen: any[] = [];
      const sub = service
        .onHostThemeChange()
        .subscribe((v) => seen.push(v));
      handler({ theme: 'dark' });
      expect(seen[0].hostTheme).toBe('dark');
      sub.unsubscribe();
      expect(offed).toBeTrue();
    });
  });

  describe('钉钉(dd) 继承支付宝表 + 自有差异', () => {
    it('dd request 走 httpRequest', async () => {
      const spy = jasmine
        .createSpy('httpRequest')
        .and.callFake((o: any) => o.success?.({ status: 200 }));
      const service = setup('dd', { httpRequest: spy });
      await service.invoke('request', { url: 'https://x.com' });
      expect(spy).toHaveBeenCalled();
    });

    it('dd 复用支付宝 login -> getAuthCode', async () => {
      const spy = jasmine
        .createSpy('getAuthCode')
        .and.callFake((o: any) => o.success?.({ authCode: 'D1' }));
      const service = setup('dd', { getAuthCode: spy });
      const res = await service.invoke('login');
      expect(res.code).toBe('D1');
    });

    it('dd showModal showCancel=false -> alert', async () => {
      const alertSpy = jasmine
        .createSpy('alert')
        .and.callFake((opts: any) => opts.success?.({}));
      const service = setup('dd', { alert: alertSpy });
      const res = await service.invoke('showModal', { content: 'c', showCancel: false });
      expect(alertSpy).toHaveBeenCalled();
      expect(res.confirm).toBeTrue();
    });
  });

  describe('百度(swan) 搬运自 uni-mp-baidu', () => {
    it('login -> swan.getLoginCode，结果补 errMsg', async () => {
      const service = setup('swan', {
        getLoginCode: (o: any) => o.success?.({ code: 'c1' }),
      });
      const res = await service.invoke('login');
      expect(res.code).toBe('c1');
      expect(res.errMsg).toBe('login:ok');
    });

    it('error/errorMessage 归一为 errMsg fail', async () => {
      const service = setup('swan', {
        getLoginCode: (o: any) =>
          o.success?.({ error: 202, errorMessage: 'user not logged in' }),
      });
      const res: any = await service.invoke('login').catch((e) => e);
      // 通用归一只改写 success 结果里的 errMsg（uni 同款：不改变成败流）
      expect(res.errMsg).toBe('login:fail user not logged in');
      expect(res.error).toBeUndefined();
    });

    it('getAccountInfoSync -> swan.getEnvInfoSync 字段重组', () => {
      const service = setup('swan', {
        getEnvInfoSync: () => ({ appKey: 'ak', sdkVersion: '3.0' }),
      });
      const res: any = service.invoke('getAccountInfoSync');
      expect(res.miniProgram.appId).toBe('ak');
      expect(res.plugin.version).toBe('3.0');
    });

    it('request 强制 dataType：非 json 一律 string', () => {
      const seen: any[] = [];
      const service = setup('swan', {
        request: (o: any) => {
          seen.push(o);
          o.success?.({ statusCode: 200 });
        },
      });
      service.invoke('request', { url: 'http://a' });
      service.invoke('request', { url: 'http://a', dataType: 'json' });
      expect(seen[0].dataType).toBe('string');
      expect(seen[1].dataType).toBe('json');
    });

    it('getRecorderManager.onFrameRecorded 被 stub 提示', () => {
      const manager = {};
      const service = setup('swan', {
        getRecorderManager: () => manager,
      });
      const rec: any = service.invoke('getRecorderManager');
      const err = spyOn(console, 'error');
      rec.onFrameRecorded();
      expect(err).toHaveBeenCalled();
    });
  });

  describe('抖音(tt) 搬运自 uni-mp-toutiao', () => {
    it('requestPayment 新版走 tt.pay', async () => {
      const g: any = globalThis;
      const saved = g.tt;
      g.tt = { pay: (o: any) => o.success?.({ result: 'ok' }) };
      try {
        const service = setup('tt', (g.tt as any) as Record<string, any>);
        const res: any = await service.invoke('requestPayment', {
          orderInfo: { a: 1 },
        });
        expect(res.result).toBe('ok');
      } finally {
        if (saved === undefined) {
          delete g.tt;
        } else {
          g.tt = saved;
        }
      }
    });

    it('requestPayment 旧版 requestPayment：orderInfo -> data', async () => {
      let received: any;
      const service = setup('tt', {
        requestPayment: (o: any) => {
          received = o;
          o.success?.({});
        },
      });
      await service.invoke('requestPayment', { orderInfo: { a: 1 } });
      expect(received.data).toEqual({ a: 1 });
      expect(received.orderInfo).toBeUndefined();
    });

    it('showTabBar 不传 animation 时默认 false', async () => {
      let received: any;
      const service = setup('tt', {
        showTabBar: (o: any) => {
          received = o;
          o.success?.({});
        },
      });
      await service.invoke('showTabBar');
      expect(received.animation).toBeFalse();
    });

    it('login 丢弃 tt 不支持的 scopes/timeout', async () => {
      let received: any;
      const service = setup('tt', {
        login: (o: any) => {
          received = o;
          o.success?.({ code: 'x' });
        },
      });
      await service.invoke('login', { scopes: 'auth_user', timeout: 100 });
      expect(received.scopes).toBeUndefined();
      expect(received.timeout).toBeUndefined();
    });
  });

  describe('核心协议 previewImage（全平台）', () => {
    it('current 传数字串索引：钳位、重排 urls、丢弃 indicator/loop', async () => {
      let received: any;
      const service = setup('wx', {
        previewImage: (o: any) => {
          received = o;
          o.success?.({});
        },
      });
      await service.invoke('previewImage', {
        urls: ['u0', 'u1', 'u2'],
        current: '1',
      });
      expect(received.current).toBe('u1');
      expect(received.urls).toEqual(['u0', 'u1', 'u2']);
      expect(received.indicator).toBeUndefined();
      expect(received.loop).toBeUndefined();
    });

    it('current 传 url 时不动（原生处理）', async () => {
      let received: any;
      const service = setup('wx', {
        previewImage: (o: any) => {
          received = o;
          o.success?.({});
        },
      });
      await service.invoke('previewImage', {
        urls: ['u0', 'u1'],
        current: 'u1',
      });
      expect(received.current).toBe('u1');
      expect(received.urls).toEqual(['u0', 'u1']);
    });
  });

  describe('微信(wx) 无协议时直通', () => {
    it('showModal 直接调用 wx.showModal', async () => {
      const spy = jasmine
        .createSpy('showModal')
        .and.callFake((opts: any) => opts.success?.({ confirm: true }));
      const service = setup('wx', { showModal: spy });
      const res = await service.invoke('showModal', { content: 'c' });
      expect(spy).toHaveBeenCalled();
      expect(res.confirm).toBeTrue();
    });
  });
});
