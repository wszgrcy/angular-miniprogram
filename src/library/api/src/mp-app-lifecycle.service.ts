import { Injectable, inject } from '@angular/core';
import { Observable, share } from 'rxjs';
import { MpLaunchOptions } from './domain-types';
import { MpApiService } from './mp-api.service';

/**
 * App 级生命周期事件（onAppShow / onAppHide / onError / onUnhandledRejection）。
 * 每个流内部只向平台注册一次监听（share），多个订阅方共享；首次订阅时才注册，避免无人消费也占监听。
 * `onError` / `onUnhandledRejection` 平台没有配对的 off，首次订阅后监听常驻。
 */
@Injectable({ providedIn: 'root' })
export class MpAppLifecycleService {
  private readonly api = inject(MpApiService);

  readonly appShow$: Observable<MpLaunchOptions> = this.api
    .event$<MpLaunchOptions>('onAppShow', 'offAppShow')
    .pipe(share());

  readonly appHide$: Observable<unknown> = this.api
    .event$('onAppHide', 'offAppHide')
    .pipe(share());

  readonly error$: Observable<string> = this.api
    .event$<string>('onError')
    .pipe(share());

  readonly unhandledRejection$: Observable<{ reason: unknown }> = this.api
    .event$<{ reason: unknown }>('onUnhandledRejection')
    .pipe(share());
}
