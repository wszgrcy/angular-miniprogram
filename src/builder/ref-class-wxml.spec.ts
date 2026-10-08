/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseTemplate } from '@angular/compiler';
import { ComponentContext } from './mini-program-compiler/parse-node/component-context';
import { TemplateDefinition } from './mini-program-compiler/parse-node/template-definition';
import { WxTransform } from './platform/wx/wx.transform';
import { withDeclarations } from './wxs/test-declare-util';
import { rewriteWxsTemplates } from './wxs/wxs-rewrite';

async function compile(html: string): Promise<string> {
  const r: any = parseTemplate(withDeclarations(html), 'p.html');
  if (r.errors?.length) {
    throw new Error('模板解析失败: ' + r.errors[0].message);
  }
  const { declared } = await rewriteWxsTemplates(r.nodes);
  const ctx = new ComponentContext(undefined);
  ctx.declaredWxsModules = declared;
  const def = new TemplateDefinition(r.nodes, ctx);
  const t = new WxTransform();
  // 本文件只关 refClass。`tag-name-*` 会往 class 属性前面插一段字面量，开着它断言就变成同时钉两件事。
  t.tagNameClass = 'off';
  t.init();
  return t.compile(def.run().map((n) => n.getNodeMeta())).content;
}

/**
 * wxml 侧的可查询 class。与运行时 `refClassOf()` 是同一条件的两侧：只有带 `#` 的元素才拼
 * `nodeList[i].refClass`。没 `#` 的元素连这个表达式都不出现，数据侧也不会发这个字段，两边同进同退。
 * 拼在 class 表达式末尾且自带 `|| ''` 兜底：refClass 只是追加一个 token。
 */
describe('wxml 可查询 class', () => {
  const REF_EXPR = `(nodeList[0].class || '') + ' ' + (nodeList[0].refClass || '')`;

  it('带 # 的元素把 refClass 追加到 class 末尾', async () => {
    expect(await compile(`<div #box></div>`)).toContain(
      `class="{{${REF_EXPR}}}"`,
    );
  });

  it('没 # 的元素完全不碰 refClass', async () => {
    const wxml = await compile(`<div #box></div><span></span>`);
    expect(wxml.match(/refClass/g)?.length).toBe(1);
    expect(wxml).toContain(`class="{{${REF_EXPR}}}"`);
  });

  it('静态 class 走的是 class 聚合串，不被 refClass 顶掉', async () => {
    const wxml = await compile(`<div class="card" #box></div>`);
    expect(wxml).toContain(`class="{{${REF_EXPR}}}"`);
  });

  it('class 下推到渲染层时同样追加', async () => {
    const wxml = await compile(
      `<div class="base" #box [class]="mod.cls(a)"></div>`,
    );
    expect(wxml).toContain(`mod.cls(`);
    expect(wxml).toContain(`+ ' ' + 'base'`);
    expect(wxml).toContain(`(nodeList[0].refClass || '')`);
  });

  it('内嵌模板里用本视图的局部下标，全路径由数据侧给', async () => {
    const wxml = await compile(`@if (ok) { <p #hint></p> }`);
    // 模板内的 p 是内嵌视图的 0 号槽；外层容器也是 0 号，靠数据区分
    expect(wxml).toContain(
      `<template name="ifBlock_0"><view  class="{{${REF_EXPR}}}"`,
    );
    expect(wxml).toContain(`data="{{...nodeList[0][index] }}"`);
  });

  it('兄弟节点各用自己的下标，只有带 # 的那个拼 refClass', async () => {
    const wxml = await compile(`<div #box></div><div class="x"></div>`);
    expect(wxml.match(/refClass/g)?.length).toBe(1);
    expect(wxml).toContain(`nodeList[0].refClass`);
    expect(wxml).toContain(`class="{{nodeList[2].class}}"`);
  });
});
