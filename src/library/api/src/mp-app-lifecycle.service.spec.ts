/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram/platform';
import { initMiniProgramTestEnv } from '../../platform/test-util/init-env';
import { MpAppLifecycleService } from './mp-app-lifecycle.service';
import { MP_PLATFORM } from './platform';

describe('MpAppLifecycleService', () => {
  function setup() {
    initMiniProgramTestEnv();
    const showListeners = new Set<(res: any) => void>();
    const errorHandlers: any[] = [];
    const fake = {
      onAppShow: (cb: any) => showListeners.add(cb),
      offAppShow: (cb: any) => showListeners.delete(cb),
      onAppHide: () => undefined,
      offAppHide: () => undefined,
      onError: (cb: any) => errorHandlers.push(cb),
      get onErrorCount() {
        return errorHandlers.length;
      },
      fireShow(res: any) {
        showListeners.forEach((cb) => cb(res));
      },
      fireError(err: any) {
        errorHandlers.forEach((cb) => cb(err));
      },
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: MINIPROGRAM_GLOBAL_TOKEN, useValue: fake },
        { provide: MP_PLATFORM, useValue: 'wx' },
      ],
    });
    return { service: TestBed.inject(MpAppLifecycleService), fake };
  }

  it('appShow$ 订阅后收到 onAppShow 事件', () => {
    const { service, fake } = setup();
    let received: any;
    service.appShow$.subscribe((res) => (received = res));
    fake.fireShow({ path: 'pages/index/index', scene: 1001 });
    expect(received.path).toBe('pages/index/index');
    expect(received.scene).toBe(1001);
  });

  it('多订阅共享一次注册（share）', () => {
    const { service, fake } = setup();
    service.error$.subscribe(() => undefined);
    service.error$.subscribe(() => undefined);
    expect(fake.onErrorCount).toBe(1);
    let a: any;
    let b: any;
    service.error$.subscribe((e) => (a = e));
    service.error$.subscribe((e) => (b = e));
    fake.fireError('boom');
    expect(a).toBe('boom');
    expect(b).toBe('boom');
  });

  it('无 off 配对的事件（onError）退订不抛错', () => {
    const { service } = setup();
    const sub = service.error$.subscribe();
    expect(() => sub.unsubscribe()).not.toThrow();
  });
});
