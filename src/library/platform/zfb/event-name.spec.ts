import { AgentNode } from '../default/agent-node';
import { MiniProgramRenderer } from '../default/mini-program.renderer';
import { wxEventNamesOf } from './event-name';
import { MiniProgramCore } from './platform-core';

/**
 * 支付宝事件派发时的键反查。
 *
 * 编译期把 `(touchstart)` 写成 `onTouchStart`，事件打过来 `e.type` 是
 * `touchStart`，而监听键是按模板原文登记的（`touchstart`）。
 * 这里验的就是「属性名对了之后，监听到底查不查得到」。
 */

/** `getListenerEventMapping` 是 protected，测试从外部取派发候选 */
const mapping = (prefix: string, name: string): string[] =>
  (
    MiniProgramCore as unknown as {
      getListenerEventMapping(prefix: string, name: string): string[];
    }
  ).getListenerEventMapping(prefix, name);

const renderer = new MiniProgramRenderer();

/** 模拟派发：按候选键依次查，查到就调 */
const dispatch = (node: AgentNode, prefix: string, type: string): unknown[] => {
  const called: unknown[] = [];
  mapping(prefix, type).forEach((key) => {
    const fn = node.listener[key];
    if (typeof fn === 'function') {
      called.push(key);
      fn(type);
    }
  });
  return called;
};

describe('wxEventNamesOf', () => {
  it('支付宝驼峰名反查回微信名', () => {
    expect(wxEventNamesOf('touchStart')).toEqual(['touchstart']);
    expect(wxEventNamesOf('longTap')).toEqual(['longtap', 'longpress']);
  });

  it('两边同名的普通事件不反查', () => {
    expect(wxEventNamesOf('tap')).toEqual([]);
    expect(wxEventNamesOf('input')).toEqual([]);
  });
});

describe('支付宝事件派发', () => {
  it('模板写微信名，e.type 是驼峰名 —— 查得到', () => {
    const node = new AgentNode('element');
    renderer.listen(node, 'touchstart', () => {});
    expect(dispatch(node, 'on', 'touchStart')).toContain('touchstart');
  });

  it('catch 前缀同样查得到', () => {
    const node = new AgentNode('element');
    renderer.listen(node, 'longpress.stop', () => {});
    expect(dispatch(node, 'catch', 'longTap')).toContain('catchlongpress');
  });

  it('模板直接写驼峰（旧用法）仍然查得到', () => {
    const node = new AgentNode('element');
    renderer.listen(node, 'touchStart', () => {});
    expect(dispatch(node, 'on', 'touchStart')).toContain('touchStart');
  });

  it('普通事件的候选列表不被放大', () => {
    expect(mapping('on', 'tap')).toEqual([
      'tap',
      'ontap',
      'onTap',
      'mut-bindtap',
      'capture-bindtap',
      'bindtap',
      'mut-bindTap',
      'capture-bindTap',
      'bindTap',
    ]);
  });

  it('候选不重复', () => {
    const keys = mapping('on', 'longTap');
    expect(keys.length).toBe(new Set(keys).size);
  });
});
