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
      const res = await service.showModal({
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
      const res = await service.showModal({
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
      await service.showToast({ title: 'hi', icon: 'error' });
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
      await service.showLoading({ title: '加载中' });
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
      expect(spy.calls.mostRecent().args[0].itemList).toEqual(['A', 'B']);
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
      const res = await service.showModal({ content: 'c', showCancel: false });
      expect(alertSpy).toHaveBeenCalled();
      expect(res.confirm).toBeTrue();
    });
  });

  describe('微信(wx) 无协议时直通', () => {
    it('showModal 直接调用 wx.showModal', async () => {
      const spy = jasmine
        .createSpy('showModal')
        .and.callFake((opts: any) => opts.success?.({ confirm: true }));
      const service = setup('wx', { showModal: spy });
      const res = await service.showModal({ content: 'c' });
      expect(spy).toHaveBeenCalled();
      expect(res.confirm).toBeTrue();
    });
  });
});
