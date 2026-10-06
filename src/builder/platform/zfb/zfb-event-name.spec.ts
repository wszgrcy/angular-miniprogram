/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseTemplate } from '@angular/compiler';
import { ALIPAY_EVENT_NAMES as LIB_ALIPAY_EVENT_NAMES } from '../../../library/platform/zfb/event-name';
import { ComponentContext } from '../../mini-program-compiler/parse-node/component-context';
import { TemplateDefinition } from '../../mini-program-compiler/parse-node/template-definition';
import { ALIPAY_EVENT_NAMES, alipayEventName } from './zfb-event-name';
import { ZfbTransform } from './zfb.transform';

/**
 * 支付宝事件名映射。编译期把微信事件名翻成支付宝驼峰名（`touchstart` → `onTouchStart`）。
 * 表内容与运行期那份（`src/library/platform/zfb/event-name.ts`）逐条比对，两边不一致就是「属性名对了、监听查不到」。
 */
const transform = new ZfbTransform();

function compile(html: string): string {
  const r: any = parseTemplate(html, 'p.html');
  if (r.errors?.length) {
    throw new Error('模板解析失败: ' + r.errors[0].message);
  }
  const def = new TemplateDefinition(r.nodes, new ComponentContext(undefined));
  transform.init();
  return transform.compile(def.run().map((n) => n.getNodeMeta())).content;
}

describe('支付宝事件名映射', () => {
  it('与运行期那份表逐条相同（防漂移）', () => {
    expect(ALIPAY_EVENT_NAMES).toEqual(LIB_ALIPAY_EVENT_NAMES);
  });

  it('断词事件名按表翻译', () => {
    expect(alipayEventName('touchstart')).toBe('touchStart');
    expect(alipayEventName('longpress')).toBe('longTap');
    expect(alipayEventName('scrolltolower')).toBe('scrollToLower');
  });

  it('语义不同的事件名也照表走', () => {
    expect(alipayEventName('waiting')).toBe('loading');
    expect(alipayEventName('animationfinish')).toBe('animationEnd');
    expect(alipayEventName('loadedmetadata')).toBe('renderStart');
  });

  it('表外事件名原样返回', () => {
    expect(alipayEventName('tap')).toBe('tap');
    expect(alipayEventName('input')).toBe('input');
  });

  it('一个支付宝名可以对应多个微信名', () => {
    expect(alipayEventName('longtap')).toBe('longTap');
    expect(alipayEventName('longpress')).toBe('longTap');
  });
});

describe('支付宝事件属性产物', () => {
  const cases: Array<[string, string]> = [
    ['<div (tap)="f()"></div>', 'onTap="onEvent"'],
    ['<div (touchstart)="f()"></div>', 'onTouchStart="onEvent"'],
    ['<div (longpress)="f()"></div>', 'onLongTap="onEvent"'],
    ['<div (scrolltolower)="f()"></div>', 'onScrollToLower="onEvent"'],
    ['<div (waiting)="f()"></div>', 'onLoading="onEvent"'],
    // 作者已经写驼峰（旧用法）：表里没有，仍然得到同一个属性名
    ['<div (touchStart)="f()"></div>', 'onTouchStart="onEvent"'],
    // 修饰符与前缀不受影响
    ['<div (touchstart.stop)="f()"></div>', 'catchTouchStart="catchEvent"'],
    ['<div (click)="f()"></div>', 'onTap="onEvent"'],
  ];
  cases.forEach(([html, expectAttr]) => {
    it(`${html} → ${expectAttr}`, () => {
      expect(compile(html)).toContain(expectAttr);
    });
  });

  it('eventNameConvert 返回的是平台事件名', () => {
    expect(transform.eventNameConvert('touchstart')).toEqual({
      prefix: 'on',
      type: 'touchStart',
      name: 'onTouchStart',
    });
    expect(transform.eventNameConvert('catch:longpress')).toEqual({
      prefix: 'catch',
      type: 'longTap',
      name: 'catchLongTap',
    });
  });
});
