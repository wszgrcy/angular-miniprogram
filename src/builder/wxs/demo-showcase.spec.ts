/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseTemplate } from '@angular/compiler';
import { ComponentContext } from '../mini-program-compiler/parse-node/component-context';
import { TemplateDefinition } from '../mini-program-compiler/parse-node/template-definition';
import { WxTransform } from '../platform/wx/wx.transform';
import { withDeclarations } from './test-declare-util';
import { rewriteWxsTemplates } from './wxs-rewrite';

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
  t.init();
  return t.compile(def.run().map((n) => n.getNodeMeta())).content;
}

const ROWS: Array<[string, string]> = [
  ['成员引用（零物化）', `<text>{{format.MSG}}</text>`],
  ['单参数', `<text>{{format.money(cents)}}</text>`],
  ['结果参与运算', `<text>{{format.money(cents) + ' 元'}}</text>`],
  ['两个 wxs 相加', `<text>{{format.money(a) + format.money(b)}}</text>`],
  ['三元', `<text>{{ok ? format.money(a) : '—'}}</text>`],
  ['class 下推', `<view [class]="format.cls('row', on)"></view>`],
  ['class 对象语法', `<view [class]="{on: format.money(c)}"></view>`],
  [
    '静态 class 合并',
    `<view class="base" [class]="format.cls('row', on)"></view>`,
  ],
  ['事件旁路', `<view (touchstart)="format.touchstart"></view>`],
  ['枝叶含管道', `<text>{{format.money(t.value | currency)}}</text>`],
];

describe('DEMO: wxs 声明与调用', () => {
  it('打印全部形态', async () => {
    const lines: string[] = [];
    for (const [label, html] of ROWS) {
      lines.push('');
      lines.push('── ' + label);
      lines.push('   作者写 : ' + html);
      try {
        const out = await compile(html);
        const header = (out.match(/^<wxs[^>]*\/>/) ?? ['(无头部)'])[0];
        const body = out.replace(/^<wxs[^>]*\/>\s*/, '').trim();
        lines.push('   头部   : ' + header);
        lines.push('   产物   : ' + body);
      } catch (e: any) {
        lines.push('   报错   : ' + e.message);
      }
    }
    console.log('\n' + lines.join('\n'));
    expect(ROWS.length).toBe(10);
  });
});
