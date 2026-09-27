import {
  ɵChangeDetectionScheduler as ChangeDetectionScheduler,
  Injector,
  ɵNotificationSource as NotificationSource,
} from '@angular/core';
import { runInAngular, scheduleChangeDetection } from './change-detection';

describe('zoneless change-detection 辅助方法', () => {
  let notified: NotificationSource[];
  let injector: Injector;

  beforeEach(() => {
    notified = [];
    injector = Injector.create({
      providers: [
        {
          provide: ChangeDetectionScheduler,
          useValue: {
            notify: (source: NotificationSource) => notified.push(source),
          },
        },
      ],
    });
  });

  it('runInAngular 应该返回回调的返回值', () => {
    expect(runInAngular(injector, () => 'result')).toBe('result');
  });

  it('runInAngular 执行完毕后应该通知调度器一次', () => {
    let called = false;
    runInAngular(injector, () => {
      called = true;
    });
    expect(called).toBe(true);
    expect(notified).toEqual([NotificationSource.Listener]);
  });

  it('回调抛错时 runInAngular 依然应该通知调度器，并且把错误抛出', () => {
    let thrown: unknown = undefined;
    try {
      runInAngular(injector, () => {
        throw new Error('boom');
      });
    } catch (error) {
      thrown = error;
    }
    expect((thrown as Error)?.message).toBe('boom');
    expect(notified).toEqual([NotificationSource.Listener]);
  });

  it('scheduleChangeDetection 默认使用 Listener 作为来源', () => {
    scheduleChangeDetection(injector);
    expect(notified).toEqual([NotificationSource.Listener]);
  });

  it('scheduleChangeDetection 可以指定通知来源', () => {
    scheduleChangeDetection(injector, NotificationSource.MarkForCheck);
    expect(notified).toEqual([NotificationSource.MarkForCheck]);
  });
});
