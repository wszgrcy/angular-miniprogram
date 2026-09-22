import {
  ɵChangeDetectionScheduler as ChangeDetectionScheduler,
  Injector,
  ɵNotificationSource as NotificationSource,
} from '@angular/core';

/**
 * zoneless 变更检测辅助方法。
 *
 * 迁移前：所有由小程序侧（事件回调、http 回调、启动流程）进入 Angular 的代码
 * 都必须包在 `NgZone.run()` 里，由 zone.js 负责触发变更检测。
 *
 * 迁移后：不再依赖 zone.js，回调执行完毕后显式通知
 * `ChangeDetectionScheduler`，由调度器安排一次 tick。
 */

/** 通知调度器需要跑一次变更检测 */
export function scheduleChangeDetection(
  injector: Injector,
  source: NotificationSource = NotificationSource.Listener
): void {
  injector.get(ChangeDetectionScheduler).notify(source);
}

/**
 * 执行回调并通知调度器执行变更检测。
 * 回调抛错时依然会通知（与 zone 行为保持一致），错误继续向外抛出。
 */
export function runInAngular<T>(injector: Injector, fn: () => T): T {
  try {
    return fn();
  } finally {
    scheduleChangeDetection(injector);
  }
}
