/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseTemplate } from '@angular/compiler';
import { WxTransform } from '../../platform/wx/wx.transform';
import { withDeclarations } from '../../wxs/test-declare-util';
import { rewriteWxsTemplates } from '../../wxs/wxs-rewrite';
import { ComponentContext } from './component-context';
import { NgElementMeta, NgNodeKind } from './interface';
import { TemplateDefinition } from './template-definition';

/**
 * `i18n-*` 属性在 wxml 里的产出。
 *
 * 译文只有运行时知道（`$localize` 查表），所以**凡是 i18n 过的属性都不能
 * 内联源文案**，否则不是翻错、是根本不翻。两条通道：
 *
 * - 值含插值 → `ɵɵi18nAttributes` + `setProperty` → `property.<name>`
 *   （普通插值属性本来就走这条，无需特判）
 * - 纯静态 → 建元素时 `setAttribute` → `attribute.<name>`，必须显式改成绑定
 */
async function compileHtml(html: string): Promise<string> {
  const r: any = parseTemplate(withDeclarations(html), 'p.html');
  if (r.errors?.length) {
    throw new Error('模板解析失败: ' + r.errors[0].message);
  }
  const { declared } = await rewriteWxsTemplates(r.nodes);
  const ctx = new ComponentContext(undefined);
  ctx.declaredWxsModules = declared;
  ctx.templateText = html;
  const def = new TemplateDefinition(r.nodes, ctx);
  const metas = def.run().map((n) => n.getNodeMeta());
  const transform = new WxTransform();
  transform.init();
  return transform.compile(metas).content;
}

function elementMeta(html: string): NgElementMeta {
  const r: any = parseTemplate(html, 'p.html');
  const ctx = new ComponentContext(undefined);
  ctx.templateText = html;
  return new TemplateDefinition(r.nodes, ctx)
    .run()
    .map((n) => n.getNodeMeta())
    .find((m) => m.kind === NgNodeKind.Element) as NgElementMeta;
}

describe('i18n 属性的 wxml 产出', () => {
  it('静态 i18n 属性改成读 attribute 的绑定', async () => {
    const w = await compileHtml(`<img i18n-title="说明" title="Settings" />`);
    expect(w).toContain(`title="{{nodeList[0].attribute.title}}"`);
    expect(w).not.toContain(`title="Settings"`);
  });

  it('没 i18n 的静态属性照旧内联，不产生绑定', async () => {
    const w = await compileHtml(`<img title="Settings" />`);
    expect(w).toContain(`title="Settings"`);
    expect(w).not.toContain('attribute.title');
  });

  it('值含插值的走 property，不重复挂 attribute', async () => {
    const w = await compileHtml(
      `<img i18n-alt="照片 {{n}}" alt="photo {{n}}" />`,
    );
    expect(w).toContain(`alt="{{nodeList[0].property.alt}}"`);
    expect(w).not.toContain('attribute.alt');
  });

  it('静态与插值各走各的通道', async () => {
    const w = await compileHtml(
      `<img i18n-alt="照片 {{n}}" alt="photo {{n}}" i18n-title="说明" title="t" />`,
    );
    expect(w).toContain(`alt="{{nodeList[0].property.alt}}"`);
    expect(w).toContain(`title="{{nodeList[0].attribute.title}}"`);
  });

  it('meta 只登记静态那批名字', () => {
    expect(
      elementMeta(
        `<img i18n-alt="照片 {{n}}" alt="photo {{n}}" i18n-title="说明" title="t" />`,
      ).i18nAttrs,
    ).toEqual(['title']);
    expect(elementMeta(`<img title="t" />`).i18nAttrs).toEqual([]);
  });

  it('i18n 说明里带引号也不会把属性名切错', () => {
    expect(
      elementMeta(`<img i18n-title="说 明" title="t" />`).i18nAttrs,
    ).toEqual(['title']);
  });
});
