/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseTemplate } from '@angular/compiler';
import { WxTransform } from '../../platform/wx/wx.transform';
import { withDeclarations } from '../../wxs/test-declare-util';
import { rewriteWxsTemplates } from '../../wxs/wxs-rewrite';
import { ComponentContext } from './component-context';
import { TemplateDefinition } from './template-definition';

/**
 * 端到端：模板 HTML → wxml 产物。
 *
 * 走真实管线 `parseTemplate → rewriteWxsTemplates → TemplateDefinition →
 * WxTransform`，不 mock，断言的就是最终落盘的那串字符。
 * 改写阶段必须跑，否则 walk 读到的和 emit 用的不是同一份 AST。
 *
 * 这里自动把模板里用到的模块补成 `<wxs module src>` 声明，
 * 让本文件的断言集中在「枝叶拆分 / 下标展开」上。
 * 声明机制本身（缺失报错、重名、内联拦截）在 wxs-declare.spec.ts 里单独测。
 */
async function compileHtml(html: string): Promise<string> {
  const r: any = parseTemplate(withDeclarations(html), 'p.html');
  if (r.errors?.length) {
    throw new Error('模板解析失败: ' + r.errors[0].message);
  }
  const { declared } = await rewriteWxsTemplates(r.nodes);
  const ctx = new ComponentContext(undefined);
  // 真实管线里这一步由 buildComponentMeta 从改写结果注入；
  // 测试没有组件身份，直接设上，事件下推才能识别到模块
  ctx.declaredWxsModules = declared;
  const def = new TemplateDefinition(r.nodes, ctx);
  const metas = def.run().map((n) => n.getNodeMeta());
  const transform = new WxTransform();
  transform.init();
  return transform.compile(metas).content;
}

/** 取报错文本，便于对报错内容做断言 */
async function errOf(html: string): Promise<string> {
  try {
    await compileHtml(html);
  } catch (e) {
    return (e as Error).message;
  }
  return '';
}

describe('wxs 端到端产出: 属性下推', () => {
  it('单参数属性绑定改写为渲染层调用', async () => {
    const w = await compileHtml(`<div [foo]="mod.fn(a)"></div>`);
    expect(w).toContain(`foo="{{mod.fn(nodeList[0].property.foo[0])}}"`);
  });

  it('多参数按下标展开', async () => {
    const w = await compileHtml(`<div [foo]="mod.fn(a, b, c)"></div>`);
    expect(w).toContain(
      'foo="{{mod.fn(nodeList[0].property.foo[0], ' +
        'nodeList[0].property.foo[1], ' +
        'nodeList[0].property.foo[2])}}',
    );
  });

  it('零参数', async () => {
    const w = await compileHtml(`<div [foo]="mod.fn()"></div>`);
    expect(w).toContain(`foo="{{mod.fn()}}"`);
  });

  it('未下推的属性仍走原物化路径', async () => {
    const w = await compileHtml(`<div [foo]="a" [bar]="mod.fn(x)"></div>`);
    expect(w).toContain(`foo="{{nodeList[0].property.foo}}"`);
    expect(w).toContain(`bar="{{mod.fn(nodeList[0].property.bar[0])}}"`);
  });

  it('class / style 仍走框架物化路径，不受影响', async () => {
    const w = await compileHtml(`<div [foo]="mod.fn(a)"></div>`);
    expect(w).toContain(`class="{{nodeList[0].class}}"`);
    expect(w).toContain(`style="{{nodeList[0].style}}"`);
  });
});

describe('wxs 端到端产出: 脊柱运算下推（旧架构做不到）', () => {
  it('wxs 调用 + 字面量', async () => {
    const w = await compileHtml(`<div [foo]="mod.fn(a) + 1"></div>`);
    expect(w).toContain('foo="{{( mod.fn(nodeList[0].property.foo[0]) + 1 )}}');
  });

  it('wxs 调用 + 动态值：两侧各自物化', async () => {
    const w = await compileHtml(`<div [foo]="mod.fn(a) + b"></div>`);
    expect(w).toContain(
      'foo="{{( mod.fn(nodeList[0].property.foo[0]) + ' +
        'nodeList[0].property.foo[1] )}}',
    );
  });

  it('两个 wxs 调用相加', async () => {
    const w = await compileHtml(`<div [foo]="m.f(a) + m.g(b)"></div>`);
    expect(w).toContain(
      'foo="{{( m.f(nodeList[0].property.foo[0]) + ' +
        'm.g(nodeList[0].property.foo[1]) )}}',
    );
  });

  it('三元运算符', async () => {
    const w = await compileHtml(`<div [foo]="mod.fn(a) ? 'y' : 'n'"></div>`);
    expect(w).toContain(
      "foo=\"{{( mod.fn(nodeList[0].property.foo[0]) ? 'y' : 'n' )}}\"",
    );
  });
});

describe('wxs 端到端产出: 插值下推', () => {
  /**
   * 从产物里反解合成承载属性名。
   *
   * 文本节点带不了枝叶数组：`ɵɵtextInterpolate*` → `renderStringify` →
   * `String(v)` 会把数组 join。所以改写层把它挂到宿主元素的合成普通
   * property 上，wxml 按宿主下标取。key 是 plan 哈希，只能反解。
   */
  const carrierOf = (wxml: string) => /property\.(__wx\w+)/.exec(wxml)?.[1];

  it('纯 wxs 插值改写', async () => {
    const w = await compileHtml(`<div>{{ mod.fn(a) }}</div>`);
    const c = carrierOf(w);
    expect(c).toBeTruthy();
    expect(w).toContain(`{{mod.fn(nodeList[0].property.${c}[0])}}`);
    // 承载位只是运输通道，不该作为业务属性多输出一份
    expect(w).not.toContain(`${c}="{{`);
  });

  it('前后缀字面文本保留', async () => {
    const w = await compileHtml(`<div>pre{{ mod.fn(a) }}post</div>`);
    const c = carrierOf(w);
    expect(w).toContain(`pre{{mod.fn(nodeList[0].property.${c}[0])}}post`);
  });

  it('字符串拼接进插值也能下推', async () => {
    const w = await compileHtml(`<div>{{ 'x' + mod.fn(a) }}</div>`);
    const c = carrierOf(w);
    expect(w).toContain(`{{( 'x' + mod.fn(nodeList[0].property.${c}[0]) )}}`);
  });

  it('wxs 成员引用（常量）零物化', async () => {
    const w = await compileHtml(`<div>{{ test.msg }}</div>`);
    // 只看文本节点内容，避开元素自身 class/style 里的 nodeList
    const text = />([^<]*)<\/view>/.exec(w)?.[1] ?? '';
    expect(text).toBe('{{test.msg}}');
    // 零枝叶：文本里不该有任何下标引用
    expect(text).not.toContain('nodeList');
  });

  it('普通插值不受影响', async () => {
    const w = await compileHtml(`<div>{{ a }}</div>`);
    expect(w).toContain(`{{nodeList[1].value}}`);
    expect(w).not.toContain('<wxs');
  });
});

describe('wxs 端到端产出: class / style 整体下推', () => {
  /**
   * 从产物里反解合成承载属性名。
   *
   * `[class]` 走 `ɵɵclassMap` → addClass，不进 `setProperty`，枝叶数组到不了
   * `property.class`，所以改写层会把它改挂到一个合成普通 property 上。
   * key 是 plan 哈希，不固定，只能反解。
   */
  const carrierOf = (wxml: string) => /property\.(__wx\w+)/.exec(wxml)?.[1];
  const carriersOf = (wxml: string) =>
    [...wxml.matchAll(/property\.(__wx\w+)/g)].map((m) => m[1]);

  it('class 整体绑定走渲染层', async () => {
    const w = await compileHtml(`<div [class]="u.cls(a)"></div>`);
    const c = carrierOf(w);
    expect(c).toBeTruthy();
    expect(w).toContain(`class="{{u.cls(nodeList[0].property.${c}[0])}}"`);
    // 承载位只是运输通道，不该作为业务属性多输出一份
    expect(w).not.toContain(`${c}="{{`);
  });

  it('class 字面量参数内联', async () => {
    const w = await compileHtml(`<div [class]="u.cls('a', b)"></div>`);
    const c = carrierOf(w);
    expect(w).toContain(`class="{{u.cls('a', nodeList[0].property.${c}[0])}}"`);
  });

  it('静态 class 与下推 class 合并（不被抹掉）', async () => {
    const w = await compileHtml(`<div class="s1 s2" [class]="u.cls(a)"></div>`);
    const c = carrierOf(w);
    expect(w).toContain(
      `class="{{[u.cls(nodeList[0].property.${c}[0]), 's1 s2']}}"`,
    );
  });

  it('style 整体绑定走渲染层', async () => {
    const w = await compileHtml(`<div [style]="u.fs('color:red')"></div>`);
    expect(w).toContain(`style="{{u.fs('color:red')}}"`);
  });

  it('静态 style 与下推 style 用分号串接', async () => {
    const w = await compileHtml(
      `<div style="color:green" [style]="u.fs(x)"></div>`,
    );
    const c = carrierOf(w);
    expect(w).toContain(
      `style="{{u.fs(nodeList[0].property.${c}[0]) + ';' + 'color:green'}}"`,
    );
  });

  it('class 和 style 同时下推，互不干扰', async () => {
    const w = await compileHtml(
      `<div [class]="u.cls(a)" [style]="u.fs(b)"></div>`,
    );
    const [cls, sty] = carriersOf(w);
    expect(w).toContain(`class="{{u.cls(nodeList[0].property.${cls}[0])}}"`);
    expect(w).toContain(`style="{{u.fs(nodeList[0].property.${sty}[0])}}"`);
  });

  it('未下推时 class / style 仍走 AgentNode 聚合串', async () => {
    const w = await compileHtml(`<div [foo]="a"></div>`);
    expect(w).toContain(`class="{{nodeList[0].class}}"`);
    expect(w).toContain(`style="{{nodeList[0].style}}"`);
  });

  it('class 下推不影响其他属性走物化路径', async () => {
    const w = await compileHtml(`<div [class]="u.cls(a)" [foo]="b"></div>`);
    const c = carrierOf(w);
    expect(w).toContain(`class="{{u.cls(nodeList[0].property.${c}[0])}}"`);
    expect(w).toContain(`foo="{{nodeList[0].property.foo}}"`);
  });
});

describe('wxs 端到端产出: 对象语法 class / style（uni-app 主用形态）', () => {
  const carrierOf = (wxml: string) => /property\.(__wx\w+)/.exec(wxml)?.[1];

  it('对象语法 class 下推', async () => {
    const w = await compileHtml(`<div [class]="{active: m.f(x)}"></div>`);
    const c = carrierOf(w);
    expect(w).toContain(
      `class="{{{'active': m.f(nodeList[0].property.${c}[0])}}}"`,
    );
  });

  it('对象语法多个 key，只把 wxs 那侧当脊柱', async () => {
    const w = await compileHtml(
      `<div [class]="{active: m.f(x), big: 'large'}"></div>`,
    );
    const c = carrierOf(w);
    expect(w).toContain(
      `class="{{{'active': m.f(nodeList[0].property.${c}[0]), ` +
        `'big': 'large'}}}"`,
    );
  });

  it('对象语法 style 下推', async () => {
    const w = await compileHtml(`<div [style]="{color: m.fs(x)}"></div>`);
    const c = carrierOf(w);
    expect(w).toContain(
      `style="{{{'color': m.fs(nodeList[0].property.${c}[0])}}}"`,
    );
  });

  it('对象语法与静态 class 合并', async () => {
    const w = await compileHtml(
      `<div class="base" [class]="{active: m.f(x)}"></div>`,
    );
    const c = carrierOf(w);
    expect(w).toContain(
      `class="{{[{'active': m.f(nodeList[0].property.${c}[0])}, 'base']}}"`,
    );
  });

  it('对象里 wxs 被当值使用（非计算键）是合法下推', async () => {
    // 注：`{[k()]: v}` 这种计算键 Angular 自己就解析不了（Vue 独有），
    // 不是本框架的差距。
    const w = await compileHtml(`<div [class]="{a: m.f(1)}"></div>`);
    expect(w).toContain(`class="{{{'a': m.f(1)}}}"`);
  });
});

describe('wxs 端到端产出: 事件旁路', () => {
  it('wxs 事件直接绑函数，不生成 data-node-index', async () => {
    const w = await compileHtml(`<div (tap)="mod.fn"></div>`);
    expect(w).toContain(`bind:tap="{{mod.fn}}"`);
    expect(w).not.toContain('data-node-index');
    expect(w).not.toContain('bindEvent');
  });

  it('普通事件仍走 bindEvent 路由', async () => {
    const w = await compileHtml(`<div (tap)="go()"></div>`);
    expect(w).toContain(`bind:tap="bindEvent"`);
    expect(w).toContain('data-node-index');
  });

  it('wxs 事件与普通事件共存，各走各的', async () => {
    const w = await compileHtml(
      `<div (tap)="mod.fn" (longpress)="go()"></div>`,
    );
    expect(w).toContain(`bind:tap="{{mod.fn}}"`);
    expect(w).toContain(`bind:longpress="bindEvent"`);
  });

  it('catch 前缀保留，且属性名与普通事件完全一致', async () => {
    // 不写死大小写：eventAttrName 复用 eventNameConvert，
    // 下推路径与普通路径的属性名必然相同，这才是真正要锁的不变量。
    const wxsPath = await compileHtml(`<div (catchTap)="mod.fn"></div>`);
    const normalPath = await compileHtml(`<div (catchTap)="go()"></div>`);
    const attrOf = (w: string) => /\s([a-z-]*:[A-Za-z]+)="[^"]*"/.exec(w)?.[1];
    expect(attrOf(wxsPath)).toBe(attrOf(normalPath));
    expect(wxsPath).toContain('catch');
    expect(wxsPath).toContain('{{mod.fn}}');
  });
});

describe('wxs 端到端产出: 头部引入', () => {
  it('用到的模块在文件顶部引入', async () => {
    const w = await compileHtml(`<div [foo]="mod.fn(a)"></div>`);
    expect(w.startsWith('<wxs module="mod" src="/common/mod.wxs"/>')).toBe(
      true,
    );
  });

  it('多模块各引入一次', async () => {
    const w = await compileHtml(
      `<div [a]="m1.f(1)" [b]="m2.g(2)" [c]="m1.h(3)"></div>`,
    );
    expect((w.match(/<wxs module="m1"/g) || []).length).toBe(1);
    expect((w.match(/<wxs module="m2"/g) || []).length).toBe(1);
  });

  it('未使用 wxs 时不产出头部', async () => {
    const w = await compileHtml(`<div [foo]="a"></div>`);
    expect(w).not.toContain('<wxs');
  });

  it('头部必须在 hasLoad 块之前', async () => {
    const w = await compileHtml(`<div [foo]="mod.fn(a)"></div>`);
    expect(w.indexOf('<wxs')).toBeLessThan(w.indexOf('hasLoad'));
  });
});

describe('wxs 端到端产出: 不可下推必须拦截', () => {
  it('wxs 返回值交给管道 → 报错', async () => {
    expect(await errOf(`<div [foo]="mod.fn(a) | date"></div>`)).toContain(
      '管道',
    );
  });

  it('非 wxs 函数吞掉 wxs 结果 → 报错', async () => {
    expect(await errOf(`<div [foo]="helper(mod.fn(a))"></div>`)).toContain(
      '无法下推',
    );
  });

  it('逐目标 class 绑定 → 明确拒绝并指向整体绑定写法', async () => {
    const msg = await errOf(`<div [class.x]="mod.fn(a)"></div>`);
    expect(msg).toContain('不支持逐目标绑定');
    expect(msg).toContain('整体绑定');
  });

  it('逐目标 style 绑定 → 明确拒绝', async () => {
    expect(await errOf(`<div [style.color]="mod.fn(a)"></div>`)).toContain(
      '不支持逐目标绑定',
    );
  });

  it('事件带调用 → 报错', async () => {
    expect(await errOf(`<div (tap)="mod.fn($event)"></div>`)).toContain(
      '不带调用的成员引用',
    );
  });

  it('合法写法不报错', async () => {
    expect(await errOf(`<div [foo]="mod.fn(a) + 1"></div>`)).toBe('');
  });
});

describe('wxs 端到端产出: 模块收集', () => {
  it('多个模块都进头部，且不重复', async () => {
    const w = await compileHtml(`<div [foo]="mod.fn(a)" (tap)="evt.h"></div>`);
    expect(w).toContain('<wxs module="mod"');
    expect(w).toContain('<wxs module="evt"');
    expect((w.match(/<wxs /g) || []).length).toBe(2);
  });
});

describe('wxs 端到端产出: 「wxs 结果被上层消费」家族', () => {
  /**
   * 判据只有一条：上层（逻辑层）需不需要拿到 wxs 的返回值。
   * 需要 -> 报错；不需要（渲染层自己能算）-> 正常下推。
   */

  it('管道套结果 -> 报错（管道在逻辑层）', async () => {
    let msg = '';
    try {
      await compileHtml(`<div [foo]="m.f(a) | date"></div>`);
    } catch (e: any) {
      msg = String(e?.message ?? e);
    }
    expect(msg).toContain('管道');
  });

  it('逐目标 class -> 报错（增量通道无整值槽）', async () => {
    let msg = '';
    try {
      await compileHtml(`<div [class.x]="m.f(a)"></div>`);
    } catch (e: any) {
      msg = String(e?.message ?? e);
    }
    expect(msg).toContain('逐目标');
  });

  it('typeof 套结果 -> 报错（渲染层无此算子）', async () => {
    let msg = '';
    try {
      await compileHtml(`<div [foo]="typeof m.f(a)"></div>`);
    } catch (e: any) {
      msg = String(e?.message ?? e);
    }
    expect(msg).toContain('无法下推到渲染层');
  });

  it('模板字符串套结果 -> 报错', async () => {
    let msg = '';
    try {
      await compileHtml(`<div [foo]="\`\${m.f(a)}\`"></div>`);
    } catch (e: any) {
      msg = String(e?.message ?? e);
    }
    expect(msg).toContain('无法下推到渲染层');
  });

  it('非 wxs 函数吞掉结果 -> 报错', async () => {
    let msg = '';
    try {
      await compileHtml(`<div [foo]="helper(m.f(a))"></div>`);
    } catch (e: any) {
      msg = String(e?.message ?? e);
    }
    expect(msg).toContain('无法下推到渲染层');
  });

  it('下标取结果 -> 合法下推', async () => {
    const w = await compileHtml(`<div [foo]="m.f(a)[0]"></div>`);
    expect(w).toContain('( m.f(nodeList[0].property.foo[0]) )[ 0 ]');
  });

  it('成员取结果 -> 合法下推', async () => {
    const w = await compileHtml(`<div [foo]="m.f(a).len"></div>`);
    expect(w).toContain('( m.f(nodeList[0].property.foo[0]) ).len');
  });
});
