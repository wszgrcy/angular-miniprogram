/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseTemplate } from '@angular/compiler';
import { withDeclarations } from './test-declare-util';
import { stripWxsFromAst } from './wxs-angular-strip';
import { rewriteWxsTemplates } from './wxs-rewrite';

/**
 * `stripWxsFromAst` 的回归钉。
 *
 * 存在的理由是一条踩过的坑：Angular 的表达式 `sourceSpan` 落在**交给解析器的
 * 那段文本**坐标系里，`preserveWhitespaces:false` 折叠过空白后它就不再是原始
 * 文件坐标。当时拿它直接切原文，产出静默切坏（残留 `}}`、枝叶切成 `box'`），
 * 而且不报错 —— 属于最难查的一类。
 *
 * 所以这里同时用两种折叠设置跑同一份模板，**结果必须一致**。
 * 一旦哪天有人把取法改回「按 sourceSpan 切原文」，这条立刻红。
 */
async function strip(
  html: string,
  preserveWhitespaces: boolean,
): Promise<string> {
  const source = withDeclarations(html);
  const parsed: any = parseTemplate(source, 'p.html', { preserveWhitespaces });
  if (parsed.errors?.length) {
    throw new Error('模板解析失败: ' + parsed.errors[0].message);
  }
  await rewriteWxsTemplates(parsed.nodes, 'p.html');
  return stripWxsFromAst(parsed.nodes, source, 'p.html');
}

/** 跨行插值 + 带字面量实参的调用 —— 当年切坏的就是这两种写法 */
const TRICKY = `<div class="card">
  <p class="hint">
    {{ format.money(price()) }}
  </p>

  <div [class]="format.cls('wxs-box', on())">
    盒子：{{ format.cls('wxs-box', on()) }}
  </div>
</div>`;

describe('stripWxsFromAst', () => {
  for (const preserveWhitespaces of [true, false]) {
    describe(`preserveWhitespaces = ${preserveWhitespaces}`, () => {
      it('不残留 wxs 表达式与插值括号', async () => {
        const out = await strip(TRICKY, preserveWhitespaces);
        expect(out).not.toContain('format.');
        expect(out).not.toContain('}}');
        expect(out).not.toContain('<wxs');
      });

      it('枝叶只取 wxs 调用，字面量实参不算枝叶', async () => {
        const out = await strip(TRICKY, preserveWhitespaces);
        expect(out).toContain('[price()]');
        // 'wxs-box' 是字面量、不是 wxs 调用，所以枝叶只有 on()
        expect(out).toContain('[on()]');
        // 曾经出现过的症状：偏移错位切出半截字符串
        expect(out).not.toContain("box'");
        expect(out).not.toContain('wxs-bo');
      });

      it('同宿主上 [class] 与插值表达式相同时，承载位不重复', async () => {
        const out = await strip(TRICKY, preserveWhitespaces);
        const hits = out.match(/\[on\(\)\]/g) ?? [];
        expect(hits.length).toBe(1);
      });

      it('字面文本为空时用零宽空格占位，保住文本节点', async () => {
        const out = await strip(
          `<p class="a">{{ format.money(price()) }}</p>`,
          preserveWhitespaces,
        );
        expect(out).toContain('\u200b');
      });

      it('字面文本非空时原样保留', async () => {
        const out = await strip(
          `<p class="a">money={{ format.money(price()) }}</p>`,
          preserveWhitespaces,
        );
        expect(out).toContain('money=');
      });

      it('零枝叶的 class 绑定退化成空数组', async () => {
        const out = await strip(
          `<div [class]="format.cls('a', 'b')">x</div>`,
          preserveWhitespaces,
        );
        expect(out).toContain('[class]="[]"');
      });
    });
  }

  it('两种折叠设置下枝叶载荷完全一致', async () => {
    /**
     * 整体输出不该相等：`preserveWhitespaces` 就是管空白留不留的，替换区间
     * 跟着变是止确的。真正必须不变的是**枝叶文本** —— 它靠「在 carrier
     * 自己的坐标系里切」保证，跟折叠无关。
     */
    const payloads = (s: string): string[] =>
      s.match(/\[__wx[a-z0-9]+\]="\[[^\]]*\]"/g) ?? [];
    const a = payloads(await strip(TRICKY, true));
    const b = payloads(await strip(TRICKY, false));
    expect(a.length).toBeGreaterThan(0);
    expect(b).toEqual(a);
  });
});
