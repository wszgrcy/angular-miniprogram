/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseTemplate } from '@angular/compiler';
import { WxTransform } from '../../platform/wx/wx.transform';
import { withDeclarations } from '../../wxs/test-declare-util';
import { rewriteWxsTemplates } from '../../wxs/wxs-rewrite';
import { ComponentContext } from './component-context';
import { NgElementMeta, NgNodeKind } from './interface';
import { TemplateDefinition } from './template-definition';

/** 端到端：模板 HTML → wxml 产物，走真实管线，不 mock */
async function compileHtml(html: string): Promise<string> {
  const r: any = parseTemplate(withDeclarations(html), 'p.html');
  if (r.errors?.length) {
    throw new Error('模板解析失败: ' + r.errors[0].message);
  }
  const { declared } = await rewriteWxsTemplates(r.nodes);
  const ctx = new ComponentContext(undefined);
  ctx.declaredWxsModules = declared;
  const def = new TemplateDefinition(r.nodes, ctx);
  const metas = def.run().map((n) => n.getNodeMeta());
  const transform = new WxTransform();
  // 本文件只关 rich-text 承载；tag-name 标记与它无关，开着只会往
  // class 属性前面插一段字面量，把断言撑得跟主题无关。
  transform.tagNameClass = 'off';
  transform.init();
  return transform.compile(metas).content;
}

/** 只跑解析层，拿节点元数据 */
function metasOf(html: string) {
  const r: any = parseTemplate(html, 'p.html');
  if (r.errors?.length) {
    throw new Error('模板解析失败: ' + r.errors[0].message);
  }
  const def = new TemplateDefinition(r.nodes, new ComponentContext(undefined));
  return def.run().map((n) => n.getNodeMeta());
}

describe('innerHTML → rich-text', () => {
  it('绑定值由 rich-text 子节点承载，宿主标签上不再出现 innerHTML', async () => {
    const w = await compileHtml(`<div class="c" [innerHTML]="html"></div>`);
    // 宿主标签自己该带的照带，只是不再挂 innerHTML
    expect(w).toContain(`<view  class="{{nodeList[0].class}}`);
    expect(w).toContain(
      `<rich-text nodes="{{nodeList[0].property.innerHTML}}"/>`,
    );
    expect(w).not.toContain(`innerHTML="{{`);
  });

  it('原有子节点整段丢弃', async () => {
    const w = await compileHtml(`<div [innerHTML]="html"><span>x</span></div>`);
    expect(w).toContain(
      `<rich-text nodes="{{nodeList[0].property.innerHTML}}"/>`,
    );
    expect(w).not.toContain(`<span`);
  });

  it('后续兄弟节点的下标不受子节点丢弃影响', async () => {
    const w = await compileHtml(
      `<div [innerHTML]="html"><span>{{a}}</span></div><p>{{b}}</p>`,
    );
    // div=0 span=1 text=2 p=3 text=4
    expect(w).toContain(
      `<rich-text nodes="{{nodeList[0].property.innerHTML}}"/>`,
    );
    expect(w).toContain(`{{nodeList[4].value}}`);
  });

  it('未写 innerHTML 的元素不受影响', async () => {
    const w = await compileHtml(`<div [foo]="bar"><span>x</span></div>`);
    expect(w).toContain(`foo="{{nodeList[0].property.foo}}"`);
    expect(w).toContain(`<view`);
    expect(w).not.toContain(`rich-text`);
  });

  it('静态 innerHTML 属性不当成富文本', async () => {
    const metas = metasOf(`<div innerHTML="x"></div>`) as NgElementMeta[];
    expect(metas[0].richText).toBe(false);
  });

  it('元数据上标记 richText，且不再单闭', () => {
    const metas = metasOf(`<div [innerHTML]="html"></div>`) as NgElementMeta[];
    expect(metas[0].kind).toBe(NgNodeKind.Element);
    expect(metas[0].richText).toBe(true);
    expect(metas[0].children.length).toBe(0);
    expect(metas[0].inputs).not.toContain('innerHTML');
  });

  it('wxs 下推的富文本走枝叶路径', async () => {
    const w = await compileHtml(`<div [innerHTML]="mod.fn(a)"></div>`);
    expect(w).toContain(
      `<rich-text nodes="{{mod.fn(nodeList[0].property.innerHTML[0])}}"/>`,
    );
  });
});
