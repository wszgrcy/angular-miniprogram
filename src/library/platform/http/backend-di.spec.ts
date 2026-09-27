/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Injector, inject } from '@angular/core';
import { HttpBackend, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { MiniprogramHttpBackend } from './backend';
import { initMiniProgramTestEnv } from '../test-util/init-env';
import { withMiniProgramRequest } from './provider';

/**
 * `MiniprogramHttpBackend` 的 DI 回归测试。
 *
 * ## 起因
 *
 * 真机报 `NG0204: Can't resolve all parameters for
 * MiniprogramHttpBackend: (?)`。根因是这个类被当类 provider 注册
 * （`providers: [MiniprogramHttpBackend]`），但类上**没有
 * `@Injectable()`**，于是 Angular 拿不到 `ɵprov`，退回反射；
 * 而本仓库 `emitDecoratorMetadata` 是关的，反射也拿不到构造参数
 * 类型，就报 `(?)`。
 *
 * 修法参照官方 `FetchBackend`：`@Injectable()` + 依赖用字段初始化器
 * 里的 `inject()` 声明，工厂 `deps` 为空，完全不依赖元数据反射。
 */
describe('MiniprogramHttpBackend 依赖注入', () => {
  beforeEach(() => {
    initMiniProgramTestEnv();
  });

  it('@Injectable() 让类自身可被 DI 解析（不再 NG0204）', () => {
    TestBed.configureTestingModule({
      providers: [MiniprogramHttpBackend],
    });

    const backend = TestBed.inject(MiniprogramHttpBackend);

    expect(backend).toBeTruthy();
    expect(backend instanceof MiniprogramHttpBackend).toBe(true);
  });

  it('编译产物带 ɵprov（NG0204 的直接根因就是它缺失）', () => {
    const def = (MiniprogramHttpBackend as any).ɵprov;

    expect(def).toBeTruthy();
    expect(def.token).toBe(MiniprogramHttpBackend);
    expect(typeof def.factory).toBe('function');
  });

  it('changeDetectionScheduler 通过 inject() 真实注入，不是 undefined', () => {
    TestBed.configureTestingModule({
      providers: [MiniprogramHttpBackend],
    });

    const backend: any = TestBed.inject(MiniprogramHttpBackend);

    // 字段初始化器里 inject() 失败的话，这里会是 undefined，
    // 后续 runInAngular() 会在运行时炸。
    expect(backend.changeDetectionScheduler).toBeTruthy();
    expect(typeof backend.changeDetectionScheduler.notify).toBe('function');
  });

  it('provideHttpClient() 把 HttpBackend 指向 MiniprogramHttpBackend', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withMiniProgramRequest())],
    });

    const backend = TestBed.inject(HttpBackend);

    expect(backend instanceof MiniprogramHttpBackend).toBe(true);
  });

  /**
   * 反向对照：证明这套断言真的能抓住「缺装饰器」的回归。
   *
   * 若哪天有人把 `@Injectable()` 从 MiniprogramHttpBackend 上拿掉，
   * 上面几个 spec 会失败；本 spec 则确认「无装饰器的类 provider」
   * 确实会抛 NG0204，即这套检测不是空转。
   */
  it('反向对照：无 @Injectable() 的类 provider 会抛 NG0204', () => {
    class UndecoratedBackend {
      constructor(private readonly dep: Injector) {}
      handle(): void {
        void this.dep;
      }
    }

    TestBed.configureTestingModule({
      providers: [UndecoratedBackend],
    });

    let thrown: any = null;
    try {
      TestBed.inject(UndecoratedBackend as any);
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeTruthy();
    expect(String(thrown.message ?? thrown)).toContain('NG0204');
  });

  it('反向对照：带 @Injectable() 但用 inject() 的类不受 emitDecoratorMetadata 关闭影响', () => {
    @Injectable()
    class DecoratedWithInject {
      readonly injected = inject(Injector);
    }

    TestBed.configureTestingModule({
      providers: [DecoratedWithInject],
    });

    const instance = TestBed.inject(DecoratedWithInject);

    expect(instance.injected).toBeTruthy();
  });
});
