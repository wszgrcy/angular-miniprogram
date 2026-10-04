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

/**
 * 把整棵 AST 的 span 整体平移 `n`，模拟 ngtsc 对 inline 模板做的那步平移。
 *
 * 不区分节点类型，见到「带数字偏移的 span」就移：TmplAst 节点的
 * `sourceSpan` / `startSourceSpan` / `endSourceSpan` 是 `{start:{offset},end:{offset}}`，
 * 表达式的是 `{start:number,end:number}`，两种都吃。
 */
function shiftSpans(root: unknown, n: number, seen = new Set<unknown>()): void {
  if (root === null || typeof root !== 'object' || seen.has(root)) {
    return;
  }
  seen.add(root);
  if (Array.isArray(root)) {
    for (const item of root) {
      shiftSpans(item, n, seen);
    }
    return;
  }
  const obj = root as Record<string, unknown>;
  const shiftOne = (span: any): void => {
    if (!span || typeof span !== 'object') {
      return;
    }
    for (const side of ['start', 'end']) {
      const pos = span[side];
      if (typeof pos === 'number') {
        span[side] = pos + n;
      } else if (pos && typeof pos.offset === 'number') {
        // ParseLocation 在多个 span 之间是共享的（元素的 sourceSpan.end 与
        // endSourceSpan.end 是同一个对象），不去重就会加好几次。
        if (seen.has(pos)) {
          continue;
        }
        seen.add(pos);
        pos.offset += n;
      }
    }
  };
  for (const key of ['sourceSpan', 'startSourceSpan', 'endSourceSpan']) {
    shiftOne(obj[key]);
  }
  for (const value of Object.values(obj)) {
    shiftSpans(value, n, seen);
  }
}

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

  /**
   * inline `template` 的坐标系钉。
   *
   * ngtsc 解析 inline 模板后会把整棵 AST 的 span 平到宿主 .ts 坐标系，
   * 而 `meta.template.content` 仍是模板文本。两边不同坐标系时，所有替换区间
   * 都落在字符串尾巴之后，`slice` 把越界钳成「追加到末尾」：不报错，但
   * wxs 改写全部跑到尾部，Angular 编出来的 update 函数里留着 `ctx.fmt.xxx()`。
   *
   * 所以：平移后的输出必须与不平移逐字节相同。
   */
  it('span 整体平移后，剥离结果与不平移逐字节相同', async () => {
    const html = withDeclarations(TRICKY);
    const base = 344;
    const parsed: any = parseTemplate(html, 'p.html', {
      preserveWhitespaces: false,
    });
    if (parsed.errors?.length) {
      throw new Error('模板解析失败: ' + parsed.errors[0].message);
    }
    shiftSpans(parsed.nodes, base);
    await rewriteWxsTemplates(parsed.nodes, 'p.html');
    const shifted = stripWxsFromAst(parsed.nodes, html, 'p.html', [], base);

    expect(shifted).toBe(await strip(TRICKY, false));
    expect(shifted).not.toContain('format.');
  });

  /**
   * 反向钉：传了平移量却按 `0` 切，必须能当场发现，不能静默产出坏模板。
   */
  it('该平移却按 0 切时，输出会残留 wxs 表达式', async () => {
    const html = withDeclarations(TRICKY);
    const parsed: any = parseTemplate(html, 'p.html', {
      preserveWhitespaces: false,
    });
    shiftSpans(parsed.nodes, 344);
    await rewriteWxsTemplates(parsed.nodes, 'p.html');
    const wrong = stripWxsFromAst(parsed.nodes, html, 'p.html');

    expect(wrong).toContain('format.');
    expect(wrong).not.toBe(
      stripWxsFromAst(parsed.nodes, html, 'p.html', [], 344),
    );
  });
});
