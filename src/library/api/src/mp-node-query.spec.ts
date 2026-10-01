/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram/platform';
import { firstValueFrom } from 'rxjs';
import { initMiniProgramTestEnv } from '../../platform/test-util/init-env';
import { MpApiService } from './mp-api.service';
import { matchMpMediaQuery } from './mp-node-query';
import { MP_PLATFORM } from './platform';

function fakeSelectorQuery() {
  const calls: string[] = [];
  const q: any = {
    calls,
    select: (s: string) => {
      calls.push(`select:${s}`);
      return q;
    },
    boundingClientRect: () => {
      calls.push('boundingClientRect');
      return q;
    },
    in: () => {
      calls.push('in');
      return q;
    },
    exec: (cb: (res: any) => void) => cb([{ width: 100, height: 50 }]),
  };
  return q;
}

function fakeIntersectionObserver() {
  const state: any = { disconnected: false, callbacks: [] as any[] };
  const o: any = {
    state,
    relativeTo: () => o,
    relativeToViewport: () => o,
    observe: (_sel: string, cb: (res: any) => void) => {
      state.callbacks.push(cb);
    },
    disconnect: () => {
      state.disconnected = true;
    },
  };
  return o;
}

describe('节点查询 / 观察器', () => {
  function setup(overrides: Record<string, any> = {}) {
    initMiniProgramTestEnv();
    const fake = {
      createSelectorQuery: jasmine
        .createSpy('createSelectorQuery')
        .and.returnValue(fakeSelectorQuery()),
      createIntersectionObserver: jasmine
        .createSpy('createIntersectionObserver')
        .and.returnValue(fakeIntersectionObserver()),
      getSystemInfoSync: () => ({ windowWidth: 400, windowHeight: 600 }),
      ...overrides,
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: MINIPROGRAM_GLOBAL_TOKEN, useValue: fake },
        { provide: MP_PLATFORM, useValue: 'wx' },
      ],
    });
    return { service: TestBed.inject(MpApiService), fake };
  }

  describe('createSelectorQuery', () => {
    it('链式调用 + exec 返回 Promise', async () => {
      const { service } = setup();
      const res = await service
        .createSelectorQuery()
        .select('#box')
        .boundingClientRect()
        .exec();
      expect(res[0].width).toBe(100);
    });

    it('in(component) 限定组件作用域', async () => {
      const { service } = setup();
      const res = await service
        .createSelectorQuery({ component: true })
        .select('#box')
        .exec();
      expect(res).toBeDefined();
    });

    it('raw 逃生舱可拿到原生对象', () => {
      const { service } = setup();
      expect(service.createSelectorQuery().raw).toBeDefined();
    });
  });

  describe('createIntersectionObserver', () => {
    it('observe$ 订阅即 observe，退订即 disconnect', async () => {
      const { service } = setup();
      const observer = service.createIntersectionObserver();
      const promise = firstValueFrom(observer.observe$('#box'));
      const raw = observer.raw;
      raw.state.callbacks[0]({ intersectionRatio: 0.5 });
      expect((await promise).intersectionRatio).toBe(0.5);

      const sub = observer.observe$('#box').subscribe();
      sub.unsubscribe();
      expect(raw.state.disconnected).toBeTrue();
    });

    it('relativeTo 链式返回包装对象', () => {
      const { service } = setup();
      const observer = service.createIntersectionObserver();
      expect(observer.relativeToViewport()).toBe(observer);
    });
  });

  describe('createMediaQueryObserver', () => {
    it('observe 立即以当前匹配结果触发', () => {
      const { service } = setup();
      const observer = service.createMediaQueryObserver();
      let result: any;
      observer.observe({ minWidth: 300 }, (res) => (result = res));
      expect(result.matches).toBeTrue();
      observer.observe({ maxWidth: 300 }, (res) => (result = res));
      expect(result.matches).toBeFalse();
    });

    it('observe$ 首个值即当前匹配', async () => {
      const { service } = setup();
      const observer = service.createMediaQueryObserver();
      const res = await firstValueFrom(observer.observe$({ orientation: 'portrait' }));
      expect(res.matches).toBeTrue();
    });

    it('matchMpMediaQuery 各条件求值', () => {
      expect(matchMpMediaQuery({ minWidth: 100 }, 400, 600)).toBeTrue();
      expect(matchMpMediaQuery({ maxWidth: 100 }, 400, 600)).toBeFalse();
      expect(matchMpMediaQuery({ height: 600 }, 400, 600)).toBeTrue();
      expect(matchMpMediaQuery({ orientation: 'landscape' }, 400, 600)).toBeFalse();
    });
  });
});
