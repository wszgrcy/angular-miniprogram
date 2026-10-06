/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseTemplate } from '@angular/compiler';
import { ComponentContext } from './mini-program-compiler/parse-node/component-context';
import { TemplateDefinition } from './mini-program-compiler/parse-node/template-definition';
import type { TagNameClassMode } from './mini-program-compiler/tag-mapping';
import { WxTransform } from './platform/wx/wx.transform';
import { withDeclarations } from './wxs/test-declare-util';
import { rewriteWxsTemplates } from './wxs/wxs-rewrite';

async function compile(
  html: string,
  tagNameClass: TagNameClassMode = 'mapped',
): Promise<string> {
  const r: any = parseTemplate(withDeclarations(html), 'p.html');
  if (r.errors?.length) {
    throw new Error('模板解析失败: ' + r.errors[0].message);
  }
  const { declared } = await rewriteWxsTemplates(r.nodes);
  const ctx = new ComponentContext(undefined);
  ctx.declaredWxsModules = declared;
  const def = new TemplateDefinition(r.nodes, ctx);
  const t = new WxTransform();
  t.tagNameClass = tagNameClass;
  t.init();
  return t.compile(def.run().map((n) => n.getNodeMeta())).content;
}

/**
 * class / style 两条通道的按需输出。
 *
 * 以前每个元素都无条件带 `class="{{nodeList[i].class}}"` 和
 * `style="{{nodeList[i].style}}"`，模板里用没用到都一样，实测占掉 wxml
 * 近三成体积，数据侧还跟着发一份空串。现在编译期静态分析出「这个元素到底
 * 有没有 class / style 来源」，没有就整条属性都不输出，数据侧也不发。
 *
 * 判据漏一条就是「运行时改了 class 而 wxml 不读」的静默丢样式，所以下面
 * 把每种写法逐个钉住，而不是只测一个正例。
 */
describe('class / style 按需输出', () => {
  it('两个通道都没用到的元素一个属性也不带', async () => {
    const wxml = await compile(`<view></view>`);
    expect(wxml).not.toContain('class=');
    expect(wxml).not.toContain('style=');
  });

  it('静态 class 只要 class 通道', async () => {
    const wxml = await compile(`<view class="a"></view>`);
    expect(wxml).toContain(`class="{{nodeList[0].class}}"`);
    expect(wxml).not.toContain('style=');
  });

  it('静态 style 只要 style 通道', async () => {
    const wxml = await compile(`<view style="color:red"></view>`);
    expect(wxml).toContain(`style="{{nodeList[0].style}}"`);
    expect(wxml).not.toContain('class=');
  });

  it('[class.x] / [style.x] 各自认自己的通道', async () => {
    expect(await compile(`<view [class.on]="ok"></view>`)).toContain(
      `class="{{nodeList[0].class}}"`,
    );
    const style = await compile(`<view [style.color]="c"></view>`);
    expect(style).toContain(`style="{{nodeList[0].style}}"`);
    expect(style).not.toContain('class=');
  });

  it('[class] / [style] 整体绑定', async () => {
    expect(await compile(`<view [class]="cls"></view>`)).toContain(
      `class="{{nodeList[0].class}}"`,
    );
    expect(await compile(`<view [style]="st"></view>`)).toContain(
      `style="{{nodeList[0].style}}"`,
    );
  });

  it('带插值的静态 class 也算 class 来源', async () => {
    expect(await compile(`<view class="a {{x}}"></view>`)).toContain(
      `class="{{nodeList[0].class}}"`,
    );
  });

  it('[attr.class] / [attr.style] 也算', async () => {
    expect(await compile(`<view [attr.class]="c"></view>`)).toContain(
      `class="{{nodeList[0].class}}"`,
    );
    expect(await compile(`<view [attr.style]="s"></view>`)).toContain(
      `style="{{nodeList[0].style}}"`,
    );
  });

  it('普通属性绑定不会把 class 通道捎带上', async () => {
    const wxml = await compile(`<view [title]="t"></view>`);
    expect(wxml).not.toContain('class=');
    expect(wxml).not.toContain('style=');
    expect(wxml).toContain(`title="{{nodeList[0].property.title}}"`);
  });

  it('#ref 元素靠 class 通道承载查询标记', async () => {
    expect(await compile(`<view #box></view>`)).toContain(
      `class="{{(nodeList[0].class || '') + ' ' + (nodeList[0].refClass || '')}}"`,
    );
  });

  it('ng-container 落成 block，不带任何属性', async () => {
    expect(await compile(`<ng-container class="a"></ng-container>`)).toContain(
      `<block ></block>`,
    );
  });
});

/**
 * `tag-name-<原标签>` 标记。
 *
 * 用途是「模板写 div、wxml 里已经是 view」时补一个选中把手。映射前后一样
 * 的标签本来就能直接选中，带着它只是每个元素多一个 class token。
 *
 * 标记由编译期烘成字面量（运行时不知道映射表），所以没有别的 class 来源的
 * 元素连数据通道都不用留 —— 一个 `class="tag-name-div"` 就完了。
 */
describe('tag-name 标记', () => {
  it('mapped（默认）：只给被改写的标签', async () => {
    const wxml = await compile(`<div></div><view></view>`);
    expect(wxml).toContain(`class="tag-name-div"`);
    expect(wxml).not.toContain('tag-name-view');
    expect(wxml.match(/class="/g)?.length).toBe(1);
  });

  it('all：每个元素都带', async () => {
    const wxml = await compile(`<div></div><view></view>`, 'all');
    expect(wxml).toContain(`class="tag-name-div"`);
    expect(wxml).toContain(`class="tag-name-view"`);
  });

  it('off：一个都不带', async () => {
    const wxml = await compile(`<div></div>`, 'off');
    expect(wxml).not.toContain('tag-name-');
    expect(wxml).not.toContain('class=');
  });

  it('已有 class 绑定时标记拼在绑定前面，不另开属性', async () => {
    const wxml = await compile(`<div class="card"></div>`);
    expect(wxml).toContain(`class="tag-name-div {{nodeList[0].class}}"`);
    expect(wxml.match(/class="/g)?.length).toBe(1);
  });

  it('自定义组件标签没被改写，默认不带标记', async () => {
    expect(await compile(`<app-x></app-x>`)).not.toContain('tag-name-');
  });
});
