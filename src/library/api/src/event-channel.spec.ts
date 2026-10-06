/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram/platform';
import { initMiniProgramTestEnv } from '../../platform/test-util/init-env';
import { MpEventChannel } from './event-channel';
import { MpApiService } from './mp-api.service';
import { MP_PLATFORM } from './platform';

describe('MpEventChannel（参考 uni-shared EventChannel）', () => {
  it('emit -> on 监听收到事件', () => {
    const ch = new MpEventChannel(1);
    let received: any;
    ch.on('msg', (p) => (received = p));
    ch.emit('msg', { a: 1 });
    expect(received).toEqual({ a: 1 });
  });

  it('emit 早于监听：进缓存，注册时冲刷', () => {
    const ch = new MpEventChannel(1);
    const seen: any[] = [];
    ch.emit('early', 'x');
    ch.emit('early', 'y');
    expect(seen).toEqual([]);
    ch.on('early', (v) => seen.push(v));
    expect(seen).toEqual(['x', 'y']);
  });

  it('once 只触发一次', () => {
    const ch = new MpEventChannel(1);
    let count = 0;
    ch.once('boom', () => count++);
    ch.emit('boom');
    ch.emit('boom');
    expect(count).toBe(1);
  });

  it('off 精确移除 / 全量移除', () => {
    const ch = new MpEventChannel(1);
    let count = 0;
    const fn = () => count++;
    ch.on('e', fn);
    ch.on('e', () => count++);
    ch.off('e', fn);
    ch.emit('e');
    expect(count).toBe(1);
    ch.off('e');
    ch.emit('e');
    expect(count).toBe(1);
  });

  it('构造时传入 events 自动注册', () => {
    let received: any;
    const ch = new MpEventChannel(1, { hello: (v: any) => (received = v) });
    ch.emit('hello', 42);
    expect(received).toBe(42);
  });
});

describe('navigateTo 事件通道接线', () => {
  function setup(overrides: Record<string, any> = {}): MpApiService {
    initMiniProgramTestEnv();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MINIPROGRAM_GLOBAL_TOKEN,
          useValue: {
            navigateTo: (opts: any) =>
              opts.success?.({ errMsg: 'navigateTo:ok' }),
            ...overrides,
          },
        },
        { provide: MP_PLATFORM, useValue: 'wx' },
      ],
    });
    return TestBed.inject(MpApiService);
  }

  it('已有 query 用 & 拼接', async () => {
    const navSpy = vi.fn().mockImplementation((o: any) => o.success?.({}));
    const service = setup({ navigateTo: navSpy });
    await service.navigateTo({ url: '/b?id=1' });
    expect(navSpy.mock.calls.at(-1)[0].url).toMatch(/^\/b\?id=1&__id__=\d+$/);
  });

  it('opener 与 target 通过同一通道通信', async () => {
    const service = setup();
    const res = await service.navigateTo({ url: '/target' });
    const openerChannel = res.eventChannel as MpEventChannel;
    const id = openerChannel.id!;

    // 目标页消费
    const targetChannel = service.getEventChannel(id);
    expect(targetChannel).toBe(openerChannel);

    const fromOpener: any[] = [];
    const fromTarget: any[] = [];
    targetChannel!.on('toTarget', (v) => fromOpener.push(v));
    openerChannel.on('toOpener', (v) => fromTarget.push(v));

    openerChannel.emit('toTarget', 'hello');
    targetChannel!.emit('toOpener', 'world');
    expect(fromOpener).toEqual(['hello']);
    expect(fromTarget).toEqual(['world']);
  });

  it('getEventChannel 一次性消费', () => {
    const service = setup();
    void service.navigateTo({ url: '/x' });
    const first = service.getEventChannel(1);
    expect(first).toBeDefined();
    expect(service.getEventChannel(1)).toBeUndefined();
  });
});
