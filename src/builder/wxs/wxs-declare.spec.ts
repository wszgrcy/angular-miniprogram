/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseTemplate } from '@angular/compiler';
import {
  assertNoDuplicateModule,
  extractWxsDeclarations,
  planSharedWxsEmit,
} from './wxs-declare';
import { rewriteWxsTemplates } from './wxs-rewrite';

function parse(html: string): any {
  const r: any = parseTemplate(html, 'p.html');
  if (r.errors?.length) {
    throw new Error('模板解析失败: ' + r.errors[0].message);
  }
  return r.nodes;
}

async function errOf(fn: () => Promise<unknown>): Promise<string> {
  try {
    await fn();
  } catch (e: any) {
    return String(e?.message ?? e);
  }
  return '';
}

describe('wxs 声明: 提取', () => {
  it('外链声明被提取', () => {
    const nodes = parse(
      `<wxs module="format" src="./format.wxs"></wxs><view></view>`,
    );
    expect(extractWxsDeclarations(nodes)).toEqual([
      { module: 'format', src: './format.wxs' },
    ]);
  });

  it('自闭合同样支持', () => {
    const nodes = parse(`<wxs module="a" src="./a.wxs"/>`);
    expect(extractWxsDeclarations(nodes)).toEqual([
      { module: 'a', src: './a.wxs' },
    ]);
  });

  it('声明节点被摘除，不会留在渲染树里', () => {
    const nodes = parse(`<wxs module="a" src="./a.wxs"></wxs><view></view>`);
    extractWxsDeclarations(nodes);
    expect(nodes.length).toBe(1);
    expect(nodes[0].name).toBe('view');
  });

  it('多模块按书写顺序返回', () => {
    const nodes = parse(
      `<wxs module="a" src="./a.wxs"></wxs>` +
        `<wxs module="b" src="../common/b.wxs"></wxs>`,
    );
    expect(extractWxsDeclarations(nodes).map((d) => d.module)).toEqual([
      'a',
      'b',
    ]);
  });

  it('ng-template 内的声明也能提取', () => {
    const nodes = parse(
      `<ng-container *ngIf="ok">` +
        `<wxs module="inner" src="./inner.wxs"></wxs>` +
        `</ng-container>`,
    );
    const decls = extractWxsDeclarations(nodes);
    expect(decls.map((d) => d.module)).toEqual(['inner']);
  });

  it('无声明时返回空且不报错', () => {
    const nodes = parse(`<view></view>`);
    expect(extractWxsDeclarations(nodes)).toEqual([]);
  });
});

describe('wxs 声明: 缺失字段必须报错', () => {
  it('缺 src', async () => {
    const msg = await errOf(async () => {
      const nodes = parse(`<wxs module="a"></wxs>`);
      extractWxsDeclarations(nodes);
    });
    expect(msg).toContain('必须同时带 module 和 src');
    expect(msg).toContain('src=<缺失>');
  });

  it('缺 module', async () => {
    const msg = await errOf(async () => {
      const nodes = parse(`<wxs src="./a.wxs"></wxs>`);
      extractWxsDeclarations(nodes);
    });
    expect(msg).toContain('module=<缺失>');
  });
});

describe('wxs 声明: 内联形式明确拦截', () => {
  /**
   * Angular 解析器会把裸 JS 的 `{` 当 ICU / 插值起始符，内联写法根本过不了 parse；`<script lang="wxs">` 则被整块剥掉。
   * 这里拦的是「写了内联但侥幸过了 parse」的形态，给出明确指引。
   */
  it('带子节点的 <wxs> 报错并指向文件写法', async () => {
    const msg = await errOf(async () => {
      const nodes = parse(`<wxs module="a" src="./a.wxs">var x = 1;</wxs>`);
      extractWxsDeclarations(nodes);
    });
    expect(msg).toContain('不支持内联');
    expect(msg).toContain('./a.wxs');
  });
});

describe('wxs 声明: 重名检查', () => {
  it('同名同 src 允许（重复引入同一文件）', () => {
    expect(() =>
      assertNoDuplicateModule([
        { module: 'a', src: './a.wxs' },
        { module: 'a', src: './a.wxs' },
      ]),
    ).not.toThrow();
  });

  it('同名不同 src 报错（会静默覆盖）', () => {
    let msg = '';
    try {
      assertNoDuplicateModule([
        { module: 'a', src: './a.wxs' },
        { module: 'a', src: '../other/a.wxs' },
      ]);
    } catch (e: any) {
      msg = String(e?.message ?? e);
    }
    expect(msg).toContain('重复声明且 src 不同');
  });
});

describe('wxs 声明: 声明集合就是定义', () => {
  /**
   * 识别完全靠声明集合，所以不存在「漏声明要报错」：没声明的名字就是普通 Angular 属性访问，
   * 走逻辑层，不报错也不下推。
   */
  it('未声明的名字不报错，也不被当成 wxs', async () => {
    const nodes = parse(`<view [foo]="ghost.fn(a)"></view>`);
    const result = await rewriteWxsTemplates(nodes);
    expect(result.modules).toEqual([]);
    expect(result.declared.size).toBe(0);
  });

  it('已声明的下推，未声明的混在里面也不受影响', async () => {
    const nodes = parse(
      `<wxs module="real" src="./real.wxs"></wxs>` +
        `<view [foo]="real.f(a)"></view>` +
        `<view [bar]="ghost.g(b)"></view>`,
    );
    const result = await rewriteWxsTemplates(nodes);
    expect(result.modules).toEqual(['real']);
    expect([...result.declared]).toEqual(['real']);
  });

  it('声明齐全时下推正常，且声明不残留进渲染树', async () => {
    const nodes = parse(
      `<wxs module="util" src="./util.wxs"></wxs>` +
        `<view [foo]="util.add(a)"></view>`,
    );
    const result = await rewriteWxsTemplates(nodes);
    expect(result.modules).toEqual(['util']);
    expect(result.declarations).toEqual([
      { module: 'util', src: './util.wxs' },
    ]);
    expect(nodes.length).toBe(1);
  });

  it('共享脚本：src 指向上级目录也能声明', async () => {
    const nodes = parse(
      `<wxs module="shared" src="../common/shared.wxs"></wxs>` +
        `<view [foo]="shared.f(a)"></view>`,
    );
    const result = await rewriteWxsTemplates(nodes);
    expect(result.declarations[0].src).toBe('../common/shared.wxs');
  });
});

describe('wxs 共享落盘: planSharedWxsEmit', () => {
  const plan = (entries: Array<{ module: string; resolvedSource: string }>) =>
    planSharedWxsEmit(entries, 'common', '.sjs');

  it('多组件共用同一源 -> 只落一份', () => {
    const p = plan([
      { module: 'format', resolvedSource: '/src/common/format.wxs' },
      { module: 'format', resolvedSource: '/src/common/format.wxs' },
      { module: 'format', resolvedSource: '/src/common/format.wxs' },
    ]);
    expect(p.length).toBe(1);
    expect(p[0].outPath).toBe('common/format.sjs');
  });

  it('不同模块各落一份', () => {
    const p = plan([
      { module: 'a', resolvedSource: '/src/common/a.wxs' },
      { module: 'b', resolvedSource: '/src/common/b.wxs' },
    ]);
    expect(p.map((x) => x.outPath)).toEqual(['common/a.sjs', 'common/b.sjs']);
  });

  it('同名不同源 -> 报错（会撞同一产物）', () => {
    let msg = '';
    try {
      plan([
        { module: 'format', resolvedSource: '/src/a/format.wxs' },
        { module: 'format', resolvedSource: '/src/b/format.wxs' },
      ]);
    } catch (e: any) {
      msg = String(e?.message ?? e);
    }
    expect(msg).toContain('两个不同的源文件');
    expect(msg).toContain('common/format.sjs');
  });

  it('同一文件的不同路径写法（含 ..）归一后不算冲突', () => {
    const p = plan([
      { module: 'fmt', resolvedSource: '/src/common/fmt.wxs' },
      { module: 'fmt', resolvedSource: '/src/x/../common/fmt.wxs' },
    ]);
    expect(p.length).toBe(1);
  });

  it('空输入 -> 空计划', () => {
    expect(plan([])).toEqual([]);
  });

  it('输出路径固定在 sharedDir 下，不随组件位置变', () => {
    const p = plan([
      { module: 'u', resolvedSource: '/src/pages/a/u.wxs' },
      { module: 'v', resolvedSource: '/src/deep/nested/v.wxs' },
    ]);
    expect(p.map((x) => x.outPath)).toEqual(['common/u.sjs', 'common/v.sjs']);
  });
});
