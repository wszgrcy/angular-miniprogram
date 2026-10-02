/* eslint-disable @typescript-eslint/no-explicit-any */
import { ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { initMiniProgramTestEnv } from '../../platform/test-util/init-env';
import { MpEventBus } from './mp-event-bus.service';

describe('MpEventBus', () => {
  function setup(): MpEventBus {
    initMiniProgramTestEnv();
    return TestBed.inject(MpEventBus);
  }

  it('on/emit 收发消息', () => {
    const bus = setup();
    let received: any;
    bus.on('msg', (p) => (received = p));
    bus.emit('msg', { a: 1 });
    expect(received).toEqual({ a: 1 });
  });

  it('on 返回的退订函数生效', () => {
    const bus = setup();
    let count = 0;
    const unsubscribe = bus.on('tick', () => count++);
    bus.emit('tick');
    unsubscribe();
    bus.emit('tick');
    expect(count).toBe(1);
  });

  it('once 只触发一次', () => {
    const bus = setup();
    let count = 0;
    bus.once('boom', () => count++);
    bus.emit('boom');
    bus.emit('boom');
    expect(count).toBe(1);
  });

  it('off(event) 移除该事件全部监听', () => {
    const bus = setup();
    let count = 0;
    bus.on('e', () => count++);
    bus.on('e', () => count++);
    bus.off('e');
    bus.emit('e');
    expect(count).toBe(0);
  });

  it('off 可通过原 handler 移除 once 包装', () => {
    const bus = setup();
    let count = 0;
    const handler = () => count++;
    bus.once('e', handler);
    bus.off('e', handler);
    bus.emit('e');
    expect(count).toBe(0);
  });

  it('handler 内部 off 不影响本轮派发（快照迭代）', () => {
    const bus = setup();
    const seen: number[] = [];
    const h2 = () => seen.push(2);
    bus.on('e', () => {
      seen.push(1);
      bus.off('e', h2);
    });
    bus.on('e', h2);
    bus.emit('e');
    expect(seen).toEqual([1, 2]);
  });

  it('emit 后通知变更检测', () => {
    const bus = setup();
    const scheduler = TestBed.inject(ChangeDetectionScheduler);
    const spy = vi.spyOn(scheduler, 'notify');
    bus.on('e', () => undefined);
    bus.emit('e');
    expect(spy).toHaveBeenCalled();
  });

  it('has/clear', () => {
    const bus = setup();
    bus.on('a', () => undefined);
    expect(bus.has('a')).toBe(true);
    bus.clear();
    expect(bus.has('a')).toBe(false);
  });
});
