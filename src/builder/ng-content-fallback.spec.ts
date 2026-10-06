/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseTemplate } from '@angular/compiler';
import { ComponentContext } from './mini-program-compiler/parse-node/component-context';
import { TemplateDefinition } from './mini-program-compiler/parse-node/template-definition';
import { WxTransform } from './platform/wx/wx.transform';

function compile(html: string): string {
  const r: any = parseTemplate(html, 'p.html');
  if (r.errors?.length) {
    throw new Error('模板解析失败: ' + r.errors[0].message);
  }
  const ctx = new ComponentContext(undefined);
  const def = new TemplateDefinition(r.nodes, ctx);
  const t = new WxTransform();
  t.init();
  return t.compile(def.run().map((n) => n.getNodeMeta())).content;
}

describe('ng-content 兜底内容', () => {
  it('无兜底：就是一个 slot', () => {
    expect(compile(`<ng-content></ng-content>`)).toContain(
      `<block wx:if="{{hasLoad}}"><slot></slot></block>`,
    );
  });

  it('无兜底的命名插槽', () => {
    expect(
      compile(`<ng-content select="[slot='head']"></ng-content>`),
    ).toContain(`<slot name="head"></slot>`);
  });

  it('兜底与 slot 二选一，判据是兜底容器有没有视图', () => {
    const wxml = compile(`<ng-content>兜底</ng-content>`);
    expect(wxml).toContain(`<block wx:if="{{nodeList[1].length}}">`);
    expect(wxml).toContain(`<block wx:else><slot></slot></block>`);
    expect(wxml).toContain(
      `<template name="projectionFallback_1">兜底</template>`,
    );
  });

  /**
   * 兜底容器里最多一份视图（Angular 只在插槽空着时创建一份），
   * 所以直接取 `[0]`，不能走通用容器那套 `wx:for`。
   *
   * 模板名也写成字面量：兜底视图的 `__templateName` 恒为 `null`，
   * `item.__templateName||` 那半截在这儿永远是废条件。
   */
  it('兜底只有一份视图，直接取下标，不套 wx:for', () => {
    const wxml = compile(`<ng-content>兜底</ng-content>`);
    expect(wxml).toContain(
      `<template is="projectionFallback_1" data="{{...nodeList[1][0] }}"></template>`,
    );
    expect(wxml).not.toContain(`wx:for="{{nodeList[1]}}"`);
  });

  it('命名插槽的兜底', () => {
    const wxml = compile(`<ng-content select="[slot='x']">没内容</ng-content>`);
    expect(wxml).toContain(`<block wx:else><slot name="x"></slot></block>`);
  });

  it('兜底里的绑定用兜底视图自己的下标，宿主视图只多出容器那一格', () => {
    const wxml = compile(`<ng-content>{{ a }}</ng-content><b>{{ b }}</b>`);
    // 兜底视图里文本是 0 号槽；宿主视图里 b 排在兜底容器（1 号）之后
    expect(wxml).toContain(`<template name="projectionFallback_1">`);
    expect(wxml).toContain(`{{nodeList[0].value}}`);
    expect(wxml).toContain(`{{nodeList[3].value}}`);
  });

  it('兜底容器紧贴投影节点，后面的节点整体后移一格', () => {
    const plain = compile(`<ng-content></ng-content><b>{{ b }}</b>`);
    const withFallback = compile(`<ng-content>兜底</ng-content><b>{{ b }}</b>`);
    expect(plain).toContain(`{{nodeList[2].value}}`);
    expect(withFallback).toContain(`{{nodeList[3].value}}`);
  });

  it('元素里的兜底用外层前缀命名，避免与兄弟插槽撞名', () => {
    const wxml = compile(`<view><ng-content>兜底</ng-content></view>`);
    expect(wxml).toContain(`<template name="projectionFallback_2">`);
    expect(wxml).toContain(`nodeList[2].length`);
  });

  it('控制流里的兜底：用内嵌视图的下标空间与路径前缀', () => {
    const wxml = compile(`@if (ok) { <ng-content>兜底</ng-content> }`);
    // ifBlock 模板内部：投影 0 号，兜底容器 1 号，模板名带 ifBlock 前缀
    expect(wxml).toContain(`<template name="ifBlock_0">`);
    expect(wxml).toContain(`<template name="projectionFallback_0_1">`);
    expect(wxml).toContain(`nodeList[1].length`);
  });

  it('多个带兜底的插槽各自一份模板，名字不撞', () => {
    const wxml = compile(
      `<ng-content select="[slot='a']">A</ng-content><ng-content select="[slot='b']">B</ng-content>`,
    );
    expect(wxml).toContain(
      `<template name="projectionFallback_1">A</template>`,
    );
    expect(wxml).toContain(
      `<template name="projectionFallback_3">B</template>`,
    );
  });
});
