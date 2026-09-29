/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  clearWxsModuleRegistry,
  collectWxsCallMethods,
  createWxsCallMethodForwarders,
  flushPendingCallMethods,
  getWxsModuleDefinition,
  registerWxsModule,
} from './wxs-runtime';

/**
 * 新架构下运行时只剩两件事：模块元数据注册表 + callMethod 转发。
 *
 * marker / proxy / token 那一层已经删除 —— 它们是为了让逻辑层
 * 「参与」渲染层计算而存在的，与「wxs 在渲染层、ng 看不到它」
 * 这条隔离原则相悖。
 */
describe('wxs 运行时: 模块注册表', () => {
  beforeEach(() => clearWxsModuleRegistry());

  it('注册后可查定义', () => {
    registerWxsModule('mod', {
      exports: ['fn', 'msg'],
      callMethods: ['onTap'],
    });
    expect(getWxsModuleDefinition('mod')).toEqual({
      exports: ['fn', 'msg'],
      callMethods: ['onTap'],
    });
  });

  it('未注册模块返回 undefined', () => {
    expect(getWxsModuleDefinition('nope')).toBeUndefined();
  });

  it('跨模块汇总 callMethod 名单并去重', () => {
    registerWxsModule('a', { exports: ['f'], callMethods: ['onTap', 'onEnd'] });
    registerWxsModule('b', { exports: ['g'], callMethods: ['onEnd', 'other'] });
    expect(collectWxsCallMethods().sort()).toEqual(['onEnd', 'onTap', 'other']);
  });

  it('无 callMethod 的模块不贡献名单', () => {
    registerWxsModule('a', { exports: ['f'], callMethods: [] });
    expect(collectWxsCallMethods()).toEqual([]);
  });
});

describe('wxs 运行时: callMethod 回传通道', () => {
  beforeEach(() => clearWxsModuleRegistry());

  it('已链接时直接调用组件方法并透传参数', () => {
    const calls: unknown[] = [];
    const ng = { onTap: (args: unknown) => calls.push(args) };
    const fns = createWxsCallMethodForwarders(['onTap']);
    fns.onTap.call({ __ngComponentInstance: ng }, { id: 7 });
    expect(calls).toEqual([{ id: 7 }]);
  });

  it('组件方法返回值原样带回', () => {
    const ng = { onTap: () => 'ret' };
    const fns = createWxsCallMethodForwarders(['onTap']);
    expect(fns.onTap.call({ __ngComponentInstance: ng }, null)).toBe('ret');
  });

  it('未链接时不报错，暂存等 flush', () => {
    const calls: unknown[] = [];
    const mp: any = {};
    const fns = createWxsCallMethodForwarders(['onTap']);
    expect(() => fns.onTap.call(mp, { v: 1 })).not.toThrow();
    expect(calls).toEqual([]);

    mp.__ngComponentInstance = { onTap: (a: unknown) => calls.push(a) };
    flushPendingCallMethods(mp);
    expect(calls).toEqual([{ v: 1 }]);
  });

  it('flush 只补发一次，不重复', () => {
    const calls: unknown[] = [];
    const mp: any = {};
    const fns = createWxsCallMethodForwarders(['onTap']);
    fns.onTap.call(mp, 1);
    mp.__ngComponentInstance = { onTap: (a: unknown) => calls.push(a) };
    flushPendingCallMethods(mp);
    flushPendingCallMethods(mp);
    expect(calls).toEqual([1]);
  });

  it('多条暂存按触发顺序补发', () => {
    const calls: number[] = [];
    const mp: any = {};
    const fns = createWxsCallMethodForwarders(['onTap']);
    fns.onTap.call(mp, 1);
    fns.onTap.call(mp, 2);
    fns.onTap.call(mp, 3);
    mp.__ngComponentInstance = { onTap: (a: number) => calls.push(a) };
    flushPendingCallMethods(mp);
    expect(calls).toEqual([1, 2, 3]);
  });

  it('暂存超过上限后丢弃并告警', () => {
    const warns: string[] = [];
    const spy = spyOn(console, 'warn').and.callFake((...a: unknown[]) => {
      warns.push(a.join(' '));
    });
    const mp: any = {};
    const fns = createWxsCallMethodForwarders(['onTap']);
    for (let i = 0; i < 30; i++) {
      fns.onTap.call(mp, i);
    }
    expect(spy).toHaveBeenCalled();
    const calls: number[] = [];
    mp.__ngComponentInstance = { onTap: (a: number) => calls.push(a) };
    flushPendingCallMethods(mp);
    expect(calls.length).toBe(20);
    expect(warns.join('')).toContain('丢弃');
  });

  it('组件上找不到方法时告警而不是抛错', () => {
    const spy = spyOn(console, 'warn');
    const fns = createWxsCallMethodForwarders(['missing']);
    expect(() =>
      fns.missing.call({ __ngComponentInstance: {} }, 1),
    ).not.toThrow();
    expect(spy).toHaveBeenCalled();
  });

  it('空名单不产出任何方法', () => {
    expect(Object.keys(createWxsCallMethodForwarders([]))).toEqual([]);
  });

  it('不同实例的暂存互不干扰', () => {
    const mpA: any = {};
    const mpB: any = {};
    const fns = createWxsCallMethodForwarders(['onTap']);
    fns.onTap.call(mpA, 'a');
    fns.onTap.call(mpB, 'b');
    const calls: unknown[] = [];
    mpB.__ngComponentInstance = { onTap: (x: unknown) => calls.push(x) };
    flushPendingCallMethods(mpB);
    expect(calls).toEqual(['b']);

    mpA.__ngComponentInstance = { onTap: (x: unknown) => calls.push(x) };
    flushPendingCallMethods(mpA);
    expect(calls).toEqual(['b', 'a']);
  });
});
