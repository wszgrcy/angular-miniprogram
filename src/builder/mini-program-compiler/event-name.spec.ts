/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseTemplate } from '@angular/compiler';
import { DOM_EVENT_ALIASES as LIB_DOM_EVENT_ALIASES } from '../../library/platform/default/event-name';
import { WxTransform } from '../platform/wx/wx.transform';
import { ZfbTransform } from '../platform/zfb/zfb.transform';
import { DOM_EVENT_ALIASES, parseMpEvent } from './event-name';
import { ComponentContext } from './parse-node/component-context';
import { TemplateDefinition } from './parse-node/template-definition';

/**
 * 事件修饰符：模板写法 → wxml 属性。
 * 编译期一张表，运行期（`src/library/platform/default/event-name.ts`）另一张表，两张表必须落在
 * 同一个事件上，所以这里把「模板写法 → wxml 属性 → 逻辑层监听键」三段一次断言完。
 */
function compile(html: string, transform = new WxTransform()): string {
  const r: any = parseTemplate(html, 'p.html');
  if (r.errors?.length) {
    throw new Error('模板解析失败: ' + r.errors[0].message);
  }
  const def = new TemplateDefinition(r.nodes, new ComponentContext(undefined));
  transform.init();
  return transform.compile(def.run().map((n) => n.getNodeMeta())).content;
}

/** 只取事件属性对，屏蔽掉 class / style / data-node-* 噪音 */
function eventAttrs(html: string, transform?: WxTransform): string[] {
  const wxml = compile(html, transform);
  return [...wxml.matchAll(/([a-z-]+:[\w.]+)="(\w+Event)"/g)].map(
    (m) => `${m[1]}="${m[2]}"`,
  );
}

describe('parseMpEvent: 修饰符 → 绑定前缀', () => {
  const table: Array<[string, string, string, string]> = [
    // [模板写法, wxml 事件名, 逻辑层监听键, 说明]
    ['tap', 'tap', 'tap', '裸事件名不变'],
    ['tap.stop', 'catch:tap', 'catchtap', 'stop → catch'],
    ['tap.prevent', 'catch:tap', 'catchtap', 'prevent 与 stop 同义'],
    [
      'tap.capture',
      'capture-bind:tap',
      'capture-bindtap',
      'capture → capture-bind',
    ],
    [
      'tap.stop.capture',
      'capture-catch:tap',
      'capture-catchtap',
      '两个修饰符顺序无关',
    ],
    ['tap.capture.stop', 'capture-catch:tap', 'capture-catchtap', '反序同上'],
    ['tap.once', 'tap', 'tap', 'once 不改前缀，只剔名字'],
    ['tap.once.stop', 'catch:tap', 'catchtap', 'once + stop'],
    ['longpress.stop', 'catch:longpress', 'catchlongpress', '任意事件名'],
    ['tap.stop.stop', 'catch:tap', 'catchtap', '重复修饰符'],
    ['tap.unknown', 'tap.unknown', 'tap.unknown', '未知修饰符原样保留'],
    ['keyup.enter', 'keyup.enter', 'keyup.enter', 'Angular 按键修饰符不能吃'],
    [
      'keyup.enter.stop',
      'catch:keyup.enter',
      'catchkeyup.enter',
      '按键 + 小程序修饰符',
    ],
  ];
  table.forEach(([raw, name, listener, why]) => {
    it(`${raw} → ${name} / ${listener}（${why}）`, () => {
      const event = parseMpEvent(raw);
      expect(event.name).toBe(name);
      expect(event.listener).toBe(listener);
      expect(event.once).toBe(raw.split('.').includes('once'));
    });
  });

  it('click 在非组件上映射为 tap', () => {
    expect(parseMpEvent('click').name).toBe('tap');
    expect(parseMpEvent('click').listener).toBe('tap');
  });
  it('click 在自定义组件上保持原样', () => {
    expect(parseMpEvent('click', { isOwnEvent: true }).name).toBe('click');
    expect(parseMpEvent('click.stop', { isOwnEvent: true }).name).toBe(
      'catch:click',
    );
  });

  it('整张别名表都受 isOwnEvent 豁免，新增别名不用改判断', () => {
    Object.entries(DOM_EVENT_ALIASES).forEach(([dom, mp]) => {
      expect(parseMpEvent(dom).type).toBe(mp);
      expect(parseMpEvent(dom, { isOwnEvent: true }).type).toBe(dom);
    });
  });

  it('编译期与运行期共用同一张别名表', () => {
    expect(DOM_EVENT_ALIASES).toEqual(LIB_DOM_EVENT_ALIASES);
  });
});

describe('wxml 产物: 事件属性', () => {
  const cases: Array<[string, string]> = [
    ['<div (tap)="f()"></div>', 'bind:tap="bindEvent"'],
    ['<div (tap.stop)="f()"></div>', 'catch:tap="catchEvent"'],
    ['<div (tap.prevent)="f()"></div>', 'catch:tap="catchEvent"'],
    ['<div (tap.capture)="f()"></div>', 'capture-bind:tap="captureBindEvent"'],
    [
      '<div (tap.stop.capture)="f()"></div>',
      'capture-catch:tap="captureCatchEvent"',
    ],
    ['<div (tap.once)="f()"></div>', 'bind:tap="bindEvent"'],
    ['<div (tap.once.stop)="f()"></div>', 'catch:tap="catchEvent"'],
    ['<div (click)="f()"></div>', 'bind:tap="bindEvent"'],
    ['<div (click.stop)="f()"></div>', 'catch:tap="catchEvent"'],
  ];
  cases.forEach(([html, expectAttr]) => {
    it(`${html} → ${expectAttr}`, () => {
      expect(compile(html)).toContain(expectAttr);
    });
  });

  it('未知修饰符原样透传（不当小程序修饰符吃掉）', () => {
    expect(eventAttrs('<div (tap.unknown)="f()"></div>')).toEqual([
      'bind:tap.unknown="bindEvent"',
    ]);
  });

  it('事件仍带 data-node-index 反查链路', () => {
    const wxml = compile('<div (tap.stop)="f()"></div>');
    expect(wxml).toContain('data-node-index');
  });

  it('同一元素多个事件互不影响', () => {
    const wxml = compile('<div (tap)="a()" (tap.stop)="b()"></div>');
    expect(wxml).toContain('bind:tap="bindEvent"');
    expect(wxml).toContain('catch:tap="catchEvent"');
  });
});

describe('wxml 产物: 前缀解析（库元数据里的 listeners）', () => {
  it('catch:tap 不再拼成 catch::tap', () => {
    const transform = new WxTransform();
    expect(transform.eventNameConvert('catch:tap')).toEqual({
      prefix: 'catch',
      type: 'tap',
      name: 'catch:tap',
    });
    expect(transform.eventNameConvert('capture-catch:tap')).toEqual({
      prefix: 'capture-catch',
      type: 'tap',
      name: 'capture-catch:tap',
    });
    expect(transform.eventNameConvert('tap')).toEqual({
      prefix: 'bind',
      type: 'tap',
      name: 'bind:tap',
    });
  });
});

describe('wxml 产物: 支付宝方言', () => {
  const cases: Array<[string, string]> = [
    ['<div (tap)="f()"></div>', 'onTap="onEvent"'],
    ['<div (tap.stop)="f()"></div>', 'catchTap="catchEvent"'],
    ['<div (tap.capture)="f()"></div>', 'onTap="onEvent"'],
    ['<div (tap.stop.capture)="f()"></div>', 'catchTap="catchEvent"'],
    ['<div (click)="f()"></div>', 'onTap="onEvent"'],
  ];
  cases.forEach(([html, expectAttr]) => {
    it(`${html} → ${expectAttr}`, () => {
      expect(compile(html, new ZfbTransform())).toContain(expectAttr);
    });
  });
});
