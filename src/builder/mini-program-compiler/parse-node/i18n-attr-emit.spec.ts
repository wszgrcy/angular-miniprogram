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

/**
 * 元素级 `i18n`（裸属性，带消息 id）在 wxml 里的产出。
 *
 * 与 `i18n-*` 是同一个坑的另一半：静态文本被烘进 wxml 后，
 * `loadTranslations` 就再也影响不到渲染结果——切语言永远看不到效果。
 * Angular 会为它发 `ɵɵtext` + `ɵɵi18nApply`，译文落在
 * `nodeList[i].value`，所以 wxml 必须改成读它。
 *
 * 这个坑特别容易漏：`nodeList` 里的译文一直是对的，只查 `nodeList`
 * 的测试永久绿，而屏上始织是源文案。
 */
describe('元素级 i18n 文本的 wxml 产出', () => {
  it('静态 i18n 文本改成读 value 的绑定', async () => {
    const w = await compileHtml(`<p i18n="@@a.title">标题</p>`);
    expect(w).toContain(`>{{nodeList[1].value}}<`);
    expect(w).not.toContain('标题');
  });

  it('没 i18n 的静态文本照旧内联，不产生绑定', async () => {
    const w = await compileHtml(`<p>标题</p>`);
    expect(w).toContain('>标题<');
    expect(w).not.toContain('nodeList[1].value');
  });

  it('i18n-<attr> 不会把子级文本一并变成绑定', async () => {
    // 只有裸 `i18n` 才管子级；`i18n-title` 只管那个属性
    const w = await compileHtml(`<p i18n-title="说明">正文</p>`);
    expect(w).toContain('>正文<');
    expect(w).not.toContain('nodeList[1].value');
  });

  it('带插值的 i18n 消息仍走原有绑定，不重复发包', async () => {
    // i18n pass 已把它变成 BoundText，不需要特判，这里只是钉住不回退
    const w = await compileHtml(`<p i18n="@@a.count">共 {{ n }} 项</p>`);
    expect(w).toContain('{{');
    expect(w).not.toContain('共 ');
  });

  it('i18n 元素里的非文本子节点不受影响', async () => {
    const w = await compileHtml(`<p i18n-title="t" title="x">文案</p>`);
    expect(w).toContain(`title="{{nodeList[0].attribute.title}}"`);
    expect(w).toContain('>文案<');
  });
});
