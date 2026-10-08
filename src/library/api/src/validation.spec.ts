/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram/platform';
import { lastValueFrom, of, tap } from 'rxjs';
import * as v from 'valibot';
import { initMiniProgramTestEnv } from '../../platform/test-util/init-env';
import { MpApiService } from './mp-api.service';
import { MP_PLATFORM } from './platform';
import {
  MP_API_SCHEMAS,
  MpApiSchema,
  isMpDevMode,
  mpValidationPipe,
} from './validation';

describe('参数校验管道', () => {
  function setup(schemas: Record<string, MpApiSchema> = {}, devMode = true) {
    // 必须自己调：isolate:false 下别的 spec 可能已经把 TestBed 环境建好了，
    // 但那靠执行顺序借来，不可靠。
    initMiniProgramTestEnv();
    const existing = (globalThis as any).ngDevMode;
    (globalThis as any).ngDevMode = devMode ? existing ?? {} : null;
    const fake: Record<string, any> = {
      showToast: vi.fn().mockImplementation((o: any) => o.success?.({})),
      navigateTo: vi.fn().mockImplementation((o: any) => o.success?.({})),
      scanCode: vi.fn().mockImplementation((o: any) => o.success?.({})),
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: MINIPROGRAM_GLOBAL_TOKEN, useValue: fake },
        { provide: MP_PLATFORM, useValue: 'wx' },
        { provide: MP_API_SCHEMAS, multi: true, useValue: schemas },
      ],
    });
    return { service: TestBed.inject(MpApiService), fake };
  }

  // captureWarn 里的 spyOn 不 restore 就会跨用例累积：console.warn 被反复 spyOn
  // 拿回的是同一个 spy，calls 一直往上加，于是「不产生告警」这类用例会读到上一个用例留下的文本。
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** 返回最近一次告警文本，无告警则为空串 */
  function captureWarn(order?: string[]) {
    const spy = vi.spyOn(console, 'warn').mockImplementation((msg: string) => {
      order?.push('validate');
    });
    return () =>
      spy.mock.calls.length > 0 ? String(spy.mock.calls.at(-1)[0]) : '';
  }

  it('开发期判定生效', () => {
    setup();
    expect(isMpDevMode()).toBe(true);
  });

  it('拼错的键被报出', async () => {
    const { service } = setup();
    const warn = captureWarn();
    await service.invoke('showToast', { titel: 'hi' } as any);
    expect(warn()).toContain('titel');
  });

  it('缺必填被报出', async () => {
    const { service } = setup();
    const warn = captureWarn();
    await service.invoke('navigateTo', {} as any);
    expect(warn()).toContain('url');
  });

  it('枚举值不符被报出', async () => {
    const { service } = setup();
    const warn = captureWarn();
    await service.invoke('showToast', { icon: 'succ' } as any);
    expect(warn()).toContain('icon');
  });

  it('类型不符被报出', async () => {
    const { service } = setup();
    const warn = captureWarn();
    await service.invoke('showToast', { duration: '300' } as any);
    expect(warn()).toContain('duration');
  });

  it('scanType 数组内枚举同样生效', async () => {
    const { service } = setup();
    const warn = captureWarn();
    await service.invoke('scanCode', { scanType: ['qrCode', 'nope'] } as any);
    expect(warn()).toContain('scanType');
  });

  it('合法入参不产生告警', async () => {
    const { service } = setup();
    const warn = captureWarn();
    await service.invoke('showToast', {
      title: 'hi',
      icon: 'success',
      duration: 1500,
      mask: true,
    });
    expect(warn()).toBe('');
  });

  it('signal 不被当作未知键', async () => {
    const { service } = setup();
    const warn = captureWarn();
    await service.invoke('showToast', {
      title: 'hi',
      signal: new AbortController().signal,
    });
    expect(warn()).toBe('');
  });

  it('未收录的 API 不做校验', async () => {
    const { service } = setup();
    const warn = captureWarn();
    await expect(
      service.invoke('someUnknownApi', { whatever: 1 } as any),
    ).rejects.toBeDefined();
    expect(warn()).toBe('');
  });

  it('只告警，不阻断真实调用', async () => {
    const { service, fake } = setup();
    captureWarn();
    await service.invoke('showToast', { titel: 'hi' } as any);
    expect(fake.showToast).toHaveBeenCalled();
  });

  it('业务 schema 覆盖内置规则', async () => {
    const { service } = setup({
      showToast: v.strictObject({ anything: v.optional(v.any()) }),
    });
    const warn = captureWarn();
    // 内置规则下这是合法入参；覆盖后 title / icon 都成了未知键
    await service.invoke('showToast', { title: 'hi', icon: 'success' } as any);
    expect(warn()).toContain('title');
  });

  it('内置校验跑在用户管道之前', async () => {
    const order: string[] = [];
    const { service } = setup();
    captureWarn(order);
    service.setGlobalPipes({
      pre: [(src: any) => src.pipe(tap(() => order.push('user')))],
    });
    await service.invoke('showToast', { titel: 'hi' } as any);
    expect(order).toEqual(['validate', 'user']);
  });

  it('clearGlobalPipes 不会移除内置校验', async () => {
    const { service } = setup();
    service.clearGlobalPipes();
    const warn = captureWarn();
    await service.invoke('showToast', { titel: 'hi' } as any);
    expect(warn()).toContain('titel');
  });

  it('用户管道 dispose 后不再执行，内置校验仍在', async () => {
    const { service } = setup();
    let ran = false;
    const handle = service.setPipe('showToast', {
      pre: [(src: any) => src.pipe(tap(() => (ran = true)))],
    });
    handle.dispose();
    const warn = captureWarn();
    await service.invoke('showToast', { titel: 'hi' } as any);
    expect(ran).toBe(false);
    expect(warn()).toContain('titel');
  });

  it('非开发期不注册校验', async () => {
    const saved = (globalThis as any).ngDevMode;
    try {
      const { service } = setup({}, false);
      const warn = captureWarn();
      await service.invoke('showToast', { titel: 'hi' } as any);
      expect(warn()).toBe('');
    } finally {
      (globalThis as any).ngDevMode = saved;
    }
  });

  it('管道是纯函数，可脱离 service 独立复用', async () => {
    const pipe = mpValidationPipe({
      foo: v.strictObject({ id: v.string() }),
    });
    const spy = vi.spyOn(console, 'warn').mockReturnValue(undefined);

    await lastValueFrom(of({ name: 'foo', options: { id: 1 } }).pipe(pipe));
    expect(spy.mock.calls.length).toBe(1);
    expect(String(spy.mock.calls.at(-1)[0])).toContain('id');

    // 无 schema 的名字走同一管道，不产生新告警
    await lastValueFrom(of({ name: 'bar', options: { x: 1 } }).pipe(pipe));
    expect(spy.mock.calls.length).toBe(1);

    // 合法入参不告警
    await lastValueFrom(of({ name: 'foo', options: { id: 'ok' } }).pipe(pipe));
    expect(spy.mock.calls.length).toBe(1);
  });
});
