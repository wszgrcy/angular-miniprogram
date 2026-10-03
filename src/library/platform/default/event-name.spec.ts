import { AgentNode } from './agent-node';
import { mpListenerKeys, mpListenerOnce } from './event-name';
import { MiniProgramRenderer } from './mini-program.renderer';
import { MiniProgramCoreFactory } from './platform-core';

/**
 * 事件名归一化：模板写法 → `listener` 表的键。
 *
 * 编译期把 `(tap.stop)` 写成 `catch:tap="catchEvent"`，事件打进来时
 * `catchEvent` 只会拿 `event.type` 去查键。所以真正的验收标准不是
 * 「键长什么样」，而是「查得到查不到」——下面每条都拿真实的
 * `getListenerEventMapping` 对一遍。
 */

/** 暴露 protected 的映射，断言用的就是运行时那份实现 */
class MappingProbe extends MiniProgramCoreFactory {
  mapping(prefix: string, name: string) {
    return this.getListenerEventMapping(prefix, name);
  }
}
const probe = new MappingProbe();
const renderer = new MiniProgramRenderer();

/** 编译期产物：[模板写法, wxml 前缀, event.type] */
const CASES: Array<[string, string, string]> = [
  ['tap', 'bind', 'tap'],
  ['tap.stop', 'catch', 'tap'],
  ['tap.prevent', 'catch', 'tap'],
  ['tap.capture', 'capture-bind', 'tap'],
  ['tap.stop.capture', 'capture-catch', 'tap'],
  ['tap.once', 'bind', 'tap'],
  ['tap.once.stop', 'catch', 'tap'],
  ['click', 'bind', 'tap'],
  ['click.stop', 'catch', 'tap'],
  ['longpress', 'bind', 'longpress'],
];

describe('mpListenerKeys', () => {
  CASES.forEach(([templateName, prefix, type]) => {
    it(`${templateName} 能被 ${prefix}:${type} 的派发查到`, () => {
      const registered = mpListenerKeys(templateName);
      const lookedUp = probe.mapping(prefix, type);
      expect(registered.some((key) => lookedUp.includes(key))).toBe(true);
    });
  });

  it('首个键永远是模板原文', () => {
    expect(mpListenerKeys('tap.stop')[0]).toBe('tap.stop');
    expect(mpListenerKeys('tap')[0]).toBe('tap');
  });

  it('未知修饰符不产生归一化键', () => {
    expect(mpListenerKeys('tap.unknown')).toEqual(['tap.unknown']);
  });

  it('Angular 按键修饰符原样保留', () => {
    expect(mpListenerKeys('keyup.enter')).toEqual(['keyup.enter']);
  });

  it('click 同时占 click 与 tap 两个键', () => {
    expect(mpListenerKeys('click')).toEqual(['click', 'tap']);
  });

  it('once 只剔名字，不造新键', () => {
    expect(mpListenerKeys('tap.once')).toEqual(['tap.once', 'tap']);
    expect(mpListenerOnce('tap.once')).toBe(true);
    expect(mpListenerOnce('tap.once.stop')).toBe(true);
    expect(mpListenerOnce('tap.stop')).toBe(false);
    expect(mpListenerOnce('tap')).toBe(false);
  });
});

describe('mpListenerOnce: .once 只响一次', () => {
  /** 模拟 `bindEvent` 的派发：按键查，查不到就什么都不做 */
  const dispatch = (node: AgentNode, key: string) => {
    const fn = node.listener[key];
    if (typeof fn === 'function') {
      fn('e');
    }
  };

  it('首次触发后把占过的键全删掉', () => {
    const node = new AgentNode('element');
    const calls: unknown[] = [];
    renderer.listen(node, 'tap.once', (event) => {
      calls.push(event);
    });
    dispatch(node, 'tap');
    dispatch(node, 'tap.once');
    dispatch(node, 'tap');
    expect(calls).toEqual(['e']);
    expect(node.listener['tap']).toBeUndefined();
    expect(node.listener['tap.once']).toBeUndefined();
  });

  it('不带 once 的不会被删', () => {
    const node = new AgentNode('element');
    const calls: unknown[] = [];
    renderer.listen(node, 'tap.stop', (event) => {
      calls.push(event);
    });
    dispatch(node, 'catchtap');
    dispatch(node, 'catchtap');
    expect(calls).toEqual(['e', 'e']);
  });
});

describe('MiniProgramRenderer.listen', () => {
  it('修饰符写法注册到小程序语义键', () => {
    const node = new AgentNode('element');
    const handler = () => {};
    renderer.listen(node, 'tap.stop', handler);
    expect(node.listener['catchtap']).toBe(handler);
    expect(node.listener['tap.stop']).toBe(handler);
  });

  it('既有写法不受影响', () => {
    const node = new AgentNode('element');
    const handler = () => {};
    renderer.listen(node, 'tap', handler);
    expect(node.listener['tap']).toBe(handler);
    expect(Object.keys(node.listener)).toEqual(['tap']);
  });

  it('非 AgentNode 目标仍然报错', () => {
    expect(() =>
      renderer.listen({} as AgentNode, 'tap', () => {}),
    ).toThrowError('不支持其他类型监听');
  });
});
