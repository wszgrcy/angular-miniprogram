/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyFieldMap } from './protocol-engine';

describe('协议引擎 applyFieldMap（key 级映射）', () => {
  it('未声明的 key 原样透传', () => {
    const out = applyFieldMap({ a: 1, b: 2 }, {});
    expect(out).toEqual({ a: 1, b: 2 });
  });

  it('无映射表时全量透传', () => {
    const out = applyFieldMap({ a: 1 }, undefined);
    expect(out).toEqual({ a: 1 });
  });

  it('字符串规则 = 改名', () => {
    const out = applyFieldMap(
      { phoneNumber: '10086' },
      { phoneNumber: 'number' },
    );
    expect(out).toEqual({ number: '10086' });
  });

  it('false 规则 = 丢弃字段', () => {
    const out = applyFieldMap({ a: 1, legacy: 'x' }, { legacy: false });
    expect(out).toEqual({ a: 1 });
  });

  it('函数规则 = 值转换', () => {
    const out = applyFieldMap(
      { count: '3' },
      { count: (v: string) => Number(v) * 2 },
    );
    expect(out).toEqual({ count: 6 });
  });

  it('函数返回 false = 丢弃；返回 undefined = 保留原值', () => {
    const out = applyFieldMap(
      { a: 1, b: 2 },
      {
        a: () => false,
        b: () => undefined,
      },
    );
    expect(out).toEqual({ b: 2 });
  });

  it('描述符规则 = 改名 + 指定值', () => {
    const out = applyFieldMap(
      { type: 'old' },
      { type: { name: 'kind', value: 'new' } },
    );
    expect(out).toEqual({ kind: 'new' });
  });

  it('函数形态直写 to，优先于透传（可产出假值 0）', () => {
    const out = applyFieldMap(
      { current: 'b.png', urls: ['a.png', 'b.png'] },
      (from: any, to: any) => {
        to.current = from.urls.indexOf(from.current);
      },
    );
    expect(out.current).toBe(1);
    expect(out.urls).toEqual(['a.png', 'b.png']);
  });

  it('函数形态直写 0 不被透传覆盖', () => {
    const out = applyFieldMap(
      { current: 'a.png', urls: ['a.png'] },
      (from: any, to: any) => {
        to.current = from.urls.indexOf(from.current);
      },
    );
    expect(out.current).toBe(0);
  });

  it('函数形态可返回补充字段映射', () => {
    const out = applyFieldMap({ a: 1, b: 2 }, () => ({ b: 'c' }));
    expect(out).toEqual({ a: 1, c: 2 });
  });

  it('回调字段（success/fail/complete）默认透传', () => {
    const cb = () => undefined;
    const out = applyFieldMap({ x: 1, success: cb }, { x: 'y' });
    expect(out.y).toBe(1);
    expect(out.success).toBe(cb);
  });

  it('from 为空安全', () => {
    expect(applyFieldMap(null, { a: 'b' })).toEqual({});
    expect(applyFieldMap(undefined)).toEqual({});
  });
});
